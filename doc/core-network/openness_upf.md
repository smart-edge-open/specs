```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
- [Introduction](#introduction)
- [How to build](#how-to-build)
- [UPF configure](#upf-configure)
  - [Platform specific information:](#platform-specific-information)
  - [UPF application specific information:](#upf-application-specific-information)
- [How to start](#how-to-start)
  - [Deploy UPF POD from OpenNESS controller](#deploy-upf-pod-from-openness-controller)
  - [To start UPF](#to-start-upf)

# Introduction

The User Plane Function (UPF) is the evolution of the Control and User Plane Separation (CUPS) which part of the Rel.14 in Evolved Packet core (EPC). CUPS enabled PGW to be split in to PGW-C and PGW-U. By doing this PGW-U can be distributed and could be used for Edge Cloud deployment. 

Defined in 3GPP technical specification 23.501, the UPF provides:

-	Anchor point for Intra-/Inter-RAT mobility (when applicable).
-	External PDU Session point of interconnect to Data Network.
-	Packet routing & forwarding (e.g. support of Uplink classifier to route traffic flows to an instance of a data network, support of Branching point to support multi-homed PDU Session).
-	Packet inspection (e.g. Application detection based on service data flow template and the optional PFDs received from the SMF in addition).
-	User Plane part of policy rule enforcement, e.g. Gating, Redirection, Traffic steering).
-	Lawful intercept (UP collection).
-	Traffic usage reporting.
-	QoS handling for user plane, e.g. UL/DL rate enforcement, Reflective QoS marking in DL.
-	Uplink Traffic verification (SDF to QoS Flow mapping).
-	Transport level packet marking in the uplink and downlink.
-	Downlink packet buffering and downlink data notification triggering.
-	Sending and forwarding of one or more "end marker" to the source NG-RAN node.
-	Functionality to respond to Address Resolution Protocol (ARP) requests and / or IPv6 Neighbor Solicitation requests based on local cache information for the Ethernet PDUs. The UPF responds to the ARP and / or the IPv6 Neighbor Solicitation Request by providing the MAC address corresponding to the IP address sent in the request.

As part of the end-to-end integration of the Edge cloud deployment using OpenNESS a reference 5G Core network is used along with reference RAN (FlexRAN). The diagram below shows UPF and NGC Control plane deployed on the OpenNESS platform with the necessary microservice and Kubernetes enhancements required for high throughput user plane workload deployment. 

![UPF and NGC Control plane deployed on OpenNESS](openness-core.png)

> Note: UPF source or binary is not released as part of the OpenNESS. 

This document aims to provide the steps involved in deploying UPF on the OpenNESS platform. 4G/LTE or 5G User Plane Functions (UPF) can run as network functions on Edge node in a virtualized environment.  The reference [Dockerfile](https://github.com/otcshare/edgeapps/blob/master/network-functions/core-network/5G/UPF/Dockerfile) and [5g-upf.yaml](https://github.com/otcshare/edgeapps/blob/master/network-functions/core-network/5G/UPF/5g-upf.yaml) provide refrence on how to deploy UPF as a Container Networking function (CNF) in a K8s pod on OpenNESS edge node using OpenNESS Enhanced Platform Awareness (EPA) features.  

These scripts are validated through a reference UPF solution (implementation based Vector Packet Processing (VPP)), is not part of OpenNESS release. 

> Note: AF and NEF dockerfile and pod specification can be found here 
> - AF - [dockerfile](https://github.com/otcshare/epcforedge/blob/master/ngc/build/networkedge/af/Dockerfile). [Pod Specification](https://github.com/otcshare/epcforedge/blob/master/ngc/scripts/networkedge/ngctest/podAF.yaml)
> - NEF - [dockerfile](https://github.com/otcshare/epcforedge/blob/master/ngc/build/networkedge/nef/Dockerfile). [Pod Specification](https://github.com/otcshare/epcforedge/blob/master/ngc/scripts/networkedge/ngctest/podNEF.yaml)
> - OAM - [dockerfile](https://github.com/otcshare/epcforedge/blob/master/ngc/build/networkedge/oam/Dockerfile). [Pod Specification](https://github.com/otcshare/epcforedge/blob/master/ngc/scripts/networkedge/ngctest/podOAM.yaml)

# How to build

To keep the build and deploy process simple for reference, docker build and image are stored on the Edge node itself.  

```code
ne-node02# cd <5g-upf-binary-package>
```

Copy Dockerfile and 5g-upf.yaml files 

```code 
ne-node02# docker build --build-arg http_proxy=$http_proxy --build-arg https_proxy=$https_proxy --build-arg no_proxy=$no_proxy -t 5g-upf:1.0 .
```

# UPF configure 

To keep the bring-up setup simple and to the point, UPF configuration was made static through config files placed inside the UPF binary package.  However one can think of ConfigMaps and/or Secrets services in Kubernetes to provide configuration information to UPF workloads.  

Below are the list of minimal configuration parameters that one can think of for a VPP based applications like UPF, 

## Platform specific information:

- SR-IOV PCIe interface(s) bus address
- CPU core dedicated for UPF workloads
- Amount of Huge pages 

## UPF application specific information:
- N3, N4, N6 and N9 Interface IP addresses 

# How to start 

Ensure all the EPA microservice and Enhancements (part of OpenNESS play book) are deployed `kubectl get po --all-namespaces` 
  ```yaml
  NAMESPACE     NAME                                      READY   STATUS    RESTARTS   AGE
  kube-ovn      kube-ovn-cni-8x5hc                        1/1     Running   17         7d19h
  kube-ovn      kube-ovn-cni-p6v6s                        1/1     Running   1          7d19h
  kube-ovn      kube-ovn-controller-578786b499-28lvh      1/1     Running   1          7d19h
  kube-ovn      kube-ovn-controller-578786b499-d8d2t      1/1     Running   3          5d19h
  kube-ovn      ovn-central-5f456db89f-l2gps              1/1     Running   0          7d19h
  kube-ovn      ovs-ovn-56c4c                             1/1     Running   17         7d19h
  kube-ovn      ovs-ovn-fm279                             1/1     Running   5          7d19h
  kube-system   coredns-6955765f44-2lqm7                  1/1     Running   0          7d19h
  kube-system   coredns-6955765f44-bpk8q                  1/1     Running   0          7d19h
  kube-system   etcd-silpixa00394960                      1/1     Running   0          7d19h
  kube-system   kube-apiserver-silpixa00394960            1/1     Running   0          7d19h
  kube-system   kube-controller-manager-silpixa00394960   1/1     Running   0          7d19h
  kube-system   kube-multus-ds-amd64-bpq6s                1/1     Running   17         7d18h
  kube-system   kube-multus-ds-amd64-jf8ft                1/1     Running   0          7d19h
  kube-system   kube-proxy-2rh9c                          1/1     Running   0          7d19h
  kube-system   kube-proxy-7jvqg                          1/1     Running   17         7d19h
  kube-system   kube-scheduler-silpixa00394960            1/1     Running   0          7d19h
  kube-system   kube-sriov-cni-ds-amd64-crn2h             1/1     Running   17         7d19h
  kube-system   kube-sriov-cni-ds-amd64-j4jnt             1/1     Running   0          7d19h
  kube-system   kube-sriov-device-plugin-amd64-vtghv      1/1     Running   0          7d19h
  kube-system   kube-sriov-device-plugin-amd64-w4px7      1/1     Running   0          4d21h
  openness      eaa-78b89b4757-7phb8                      1/1     Running   3          5d19h
  openness      edgedns-mdvds                             1/1     Running   16         7d18h
  openness      interfaceservice-tkn6s                    1/1     Running   16         7d18h
  openness      nfd-master-82dhc                          1/1     Running   0          7d19h
  openness      nfd-worker-h4jlt                          1/1     Running   37         7d19h
  openness      syslog-master-894hs                       1/1     Running   0          7d19h
  openness      syslog-ng-n7zfm                           1/1     Running   16         7d19h
  ```

## Deploy UPF POD from OpenNESS controller

```code
ne-controller# kubectl create -f 5g-upf.yaml 
```

## To start UPF
- In this reference validation, UPF application will be started manually after UPF POD deployed successfully. 
```code
ne-controller# kubectl exec -it test1-app -- /bin/bash

5g-upf# cd /root/upf
5g-upf# ./start_upf.sh
```

- Verify UPF pod is up and running `kubectl get po`
```code
[root@ne-controller ~]#  kubectl get po
NAME             READY   STATUS    RESTARTS   AGE
udp-server-app   1/1     Running   0          6d19h
upf              1/1     Running   0          6d19h
```

- Verify AF, NEF and OAM pods are running `kubectl get po -n ngc`
```code
[root@ne-controller ~]#  kubectl get po -n ngc
NAME   READY   STATUS    RESTARTS   AGE
af     1/1     Running   0          172m
nef    1/1     Running   0          173m
oam    1/1     Running   0          173m
```