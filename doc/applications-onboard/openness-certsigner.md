```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# Certificate Signer
- [Overview](#overview)
- [Usage](#usage)
  - [Deployment](#deployment)

## Overview
Each application that needs the TLS authentication certificate should generate it using the Certificate Signer by sending a CSR via Certificate Requester.

## Usage
Generally the CSR will be sent from a Pod's Certificate Requester InitContainer which then needs to be approved by an administrator using `kubectl certificate approve <CSR_name>`.

After that the Certificate Requester saves the certificate and key under `/home/certrequester/certs/cert.pem` and `/home/certrequester/certs/key.pem`.

Application can use the certificate by having a shared volume mounted under `/home/certrequester/certs` in Certificate Requester container and under a requried path in its service container.

Each application needs to perform mutual TLS authentication with the [EAA](openness-eaa.md). To achieve that, the application should trust the CA certificate `root.pem` that is stored in `ca-certrequester` Kubernetes Secret.

### Deployment
In order to use Certificate Requester the following Kubernetes entities needs to be created:

1. RBAC Service Account and Cluster Role Binding to a `csr-requester` Cluster Role.

   ```yml
   ---
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: service-acc

   ---
   kind: ClusterRoleBinding
   apiVersion: rbac.authorization.k8s.io/v1
   metadata:
     name: service-csr-requester
   roleRef:
     apiGroup: rbac.authorization.k8s.io
     kind: ClusterRole
     name: csr-requester
   subjects:
     - kind: ServiceAccount
       name: service-acc
       namespace: default
   ```

2. JSON CSR config:
 - *CSR.Name*: Kubernetes CSR name
 - *CSR.Subject*: https://golang.org/pkg/crypto/x509/pkix/#Name
 - *CSR.DNSSANs*: A list of DNS SANs
 - *CSR.IPSANs*: A list of IP SANs
 - *CSR.KeyUsages*: Specifies valid usage contexts for keys, list of elements of type https://godoc.org/k8s.io/api/certificates/v1#KeyUsage
 - *Signer*: Specifies Kubernetes Signer that will handle the CSR. OpenNESS Certificate Signer name should be used: "*openness.org/certsigner*"
 - *WaitTimeout*: Specifies how much time the CSR can wait until it's approved before deletion.

   Sample config:
   ```yml
   ---
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: service-csr-config
   data:
     certrequest.json: |
       {
           "CSR": {
               "Name": "service",
               "Subject": {
                   "CommonName": "ExampleNamespace:ExampleProducerAppID"
               },
               "DNSSANs": [],
               "IPSANs": [],
               "KeyUsages": [
                   "digital signature", "key encipherment", "client auth"
               ]
           },
           "Signer": "openness.org/certsigner",
           "WaitTimeout": "5m"
       }
   ```

3. Sample deployment:

   ```yml
   ---
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: service
     labels:
       app: service
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: service
     template:
       metadata:
         labels:
           app: service
       spec:
         securityContext:
           runAsUser: 1000
           runAsGroup: 3000
         serviceAccountName: service-acc
         initContainers:
           - name: alpine
             image: alpine:3.12.0
             command: ["/bin/sh"]
             args: ["-c", "cp /root/ca-certrequester/cert.pem /root/certs/root.pem"]
             imagePullPolicy: IfNotPresent
             securityContext:
               runAsUser: 0
               runAsGroup: 0
             resources:
               requests:
                 cpu: "0.1"
               limits:
                 cpu: "0.1"
                 memory: "128Mi"
             volumeMounts:
               - name: ca-certrequester
                 mountPath: /root/ca-certrequester
               - name: certs
                 mountPath: /root/certs
           - name: certrequester
             image: certrequester:1.0
             args: ["--cfg", "/home/certrequester/config/certrequest.json"]
             imagePullPolicy: Never
             resources:
               requests:
                 cpu: "0.1"
               limits:
                 cpu: "0.1"
                 memory: "128Mi"
             volumeMounts:
               - name: config
                 mountPath: /home/certrequester/config/
               - name: certs
                 mountPath: /home/certrequester/certs/
         containers:
           - name: service
             image: service:1.0
             imagePullPolicy: Never
             volumeMounts:
               - name: certs
                 mountPath: /home/sample/certs/
             ports:
               - containerPort: 443
         volumes:
           - name: config
             configMap:
               name: service-csr-config
           - name: ca-certrequester
             secret:
               secretName: ca-certrequester
           - name: certs
             emptyDir: {}
   ```
   After applying such deployment we can check the Pod and CSR status:

   ```bash
   $ kubectl get pods
   NAME                        READY   STATUS     RESTARTS   AGE
   service-7b6b4c7bdf-4xv6g    0/1     Init:1/2   0          9s
   $ kubectl get csr
   NAME       AGE   SIGNERNAME                REQUESTOR                                CONDITION
   service    11s   openness.org/certsigner   system:serviceaccount:default:service    Pending
   ```

   To approve the CSR and start the Service:

   ```
   $ kubectl certificate approve service
   certificatesigningrequest.certificates.k8s.io/service approved
   $ kubectl get csr
   NAME       AGE   SIGNERNAME                REQUESTOR                                CONDITION
   service    82m   openness.org/certsigner   system:serviceaccount:default:service    Approved,Issued
   $ kubectl get pods
   NAME                        READY   STATUS     RESTARTS   AGE
   service-7b6b4c7bdf-4xv6g    1/1     Running    0          54s
   ```

4. Cleanup can be perfomed by:
   -  deleting the entities defined in a YAML file in the previous step: `kubectl delete -f <deployment_file_path>`
   -  deleting the CSR: `kubectl delete csr service`
