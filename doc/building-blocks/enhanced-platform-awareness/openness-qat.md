```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2021 Intel Corporation
```
<!-- omit in toc -->
# Using Intel® QuickAssist Adapter in OpenNESS: Resource Allocation, and Configuration
- [Overview](#overview)
- [Intel QuickAssist Adapter CU/DU Host Interface Overview](#intel-quickassist-adapter-cudu-host-interface-overview)
- [Intel QuickAssist Adapter Device Plugin Deployment with Kubernetes\* for CU/DU](#intel-quickassist-adapter-device-plugin-deployment-with-kubernetes-for-cudu)
- [Using the Intel QuickAssist Adapter on OpenNESS](#using-the-intel-quickassist-adapter-on-openness)
  - [Intel QuickAssist Adapter for OpenNESS Network Edge](#intel-quickassist-adapter-for-openness-network-edge)
    - [Converged Edge Experience Kits (CEEK)](#converged-edge-experience-kits-ceek)
  - [Requesting Resources and Running Pods for OpenNESS Network Edge](#requesting-resources-and-running-pods-for-openness-network-edge)
  - [Verification of the QAT and the Device Plugin](#verification-of-the-qat-and-the-device-plugin)
- [Reference](#reference)

## Overview

Intel® QuickAssist Adapter plays a key role in accelerating cryptographic operations in 5G networking. 

Intel® QuickAssist Adapter provides the following features:

- Symmetric (Bulk) Cryptography:
  - Ciphers (AES, 3DES/DES, RC4, KASUMI, ZUC, Snow 3G)
  - Message digset/hash (MD5, SHA1, SHA2, SHA3) and authentcation (HMAC, AES-XCBC)
  - Algorithm chaining (one cipher and one hash in a sigle operation)
  - Authenticated encription (AES-GCM, AES-CCM)
- Asymmetric (Public Key) Cryptography:
  - Modular exponentation for Diffie-Hellman (DH)
  - RSA key generation, encryption/decryption and digital signature generation/verification
  - DSA parameter generation and digital signature generation/verification
  - Elliptic Curve Cryptography: ECDSA, ECDHE, Curve25519

Intel® QuickAssist Adapter benefits include:
- Reduced platform power, E2E latency and Intel® CPU core count requirements
- Accelerates wireless data encryption and authentication
- Accommodates space-constrained implementations via a low-profile PCIe* card form factor

For more information, see product brief in [Intel® QuickAssist Adapter](https://www.intel.com/content/dam/www/public/us/en/documents/product-briefs/quickassist-adapter-8960-8970-brief.pdf).

This document explains how the Intel® QuickAssist (QAT) device plugin is enabled and used on the Open Network Edge Services Software (OpenNESS) platform for accelerating network functions and edge application workloads. The Intel® QuickAssist Adapter is used to accelerate the LTE/5G encryption tasks in the CU/DU.

## Intel QuickAssist Adapter CU/DU Host Interface Overview
Intel® QuickAssist Adapter used in the CU/DU solution exposes the following Physical Functions (PF) to the CPU host:
- Three interfaces, that can provide 16 Virtual Functions each.

## Intel QuickAssist Adapter Device Plugin Deployment with Kubernetes\* for CU/DU
CU/DU applications use the `qat.intel.com/generic` resources from the Intel® QuickAssist Adapter using POD resource allocation and the Kubernetes\* device plugin framework. Kubernetes* provides a device plugin framework that is used to advertise system hardware resources to the Kubelet. Instead of customizing the code for Kubernetes* (K8s) itself, vendors can implement a device plugin that can be deployed either manually or as a DaemonSet. The targeted devices include GPUs, high-performance NICs, FPGAs, InfiniBand\* adapters, and other similar computing resources that may require vendor-specific initialization and setup.

## Using the Intel QuickAssist Adapter on OpenNESS
Further sections provide instructions on how to use the Intel® QuickAssist Adapter features: configuration and accessing from an application on the OpenNESS Network Edge.

When the Intel® QuickAssist Adapter is available on the Edge Node platform it exposes three Root I/O Virtualization (SRIOV) Physical Functions (PF) devices which can be used to create Virtual Functions. To take advantage of this functionality for a cloud-native deployment, the PF (Physical Function) of the device must be bound to the DPDK IGB_UIO userspace driver to create several VFs (Virtual Functions). Once the VFs are created, they must also be bound to a DPDK userspace driver to allocate them to specific K8s pods running the vRAN workload.

The full pipeline of preparing the device for workload deployment and deploying the workload can be divided into the following stages:

- Enabling SRIOV, binding devices to appropriate drivers, and the creation of VFs: delivered as part of the Edge Nodes Ansible automation.
- QAT Device Plugin deployment.
- Queue configuration of QAT's PFs/VFs.
- Binding QAT's PFs/VFs to igb_uio driver.

### Intel QuickAssist Adapter for OpenNESS Network Edge
To run the OpenNESS package with Intel® QuickAssist Adapter Device Plugin functionality, the feature needs to be enabled on both Edge Controller and Edge Node. It can be deployed by setting the following variable in the flavor or *group_vars/all* file in Converged Edge Experience Kits:
```yaml
qat_device_plugin_enable: true
```

#### Converged Edge Experience Kits (CEEK)
To enable Intel® QuickAssist Adapter Device Plugin support from CEEK, SRIOV must be enabled in OpenNESS:
```yaml
kubernetes_cnis:
- <primary CNI>
- sriov
```

> **NOTE**: `sriov` cannot be the primary CNI.

Intel® QuickAssist Adapter Device Plugin is enabled by default in the `cera_5g_on_prem` flavor:

After a successful deployment, the following pods will be available in the cluster:
```shell
kubectl get pods -n kube-system

NAME                        READY   STATUS    RESTARTS   AGE
intel-qat-plugin-dl42c      1/1     Running   0          7d9h
```

### Requesting Resources and Running Pods for OpenNESS Network Edge
As part of the OpenNESS Ansible automation, a K8s SRIOV device plugin to orchestrate the Intel® QuickAssist Adapter VFs (bound to the userspace driver) is deployed and running. This enables the scheduling of pods requesting this device. To check the number of devices available on the Edge Node from Edge Controller, run:

```shell
kubectl get node $(hostname) -o json | jq '.status.allocatable'
```
Sample output:
```shell
[...]
"qat.intel.com/generic": "48"
[...]
```

To request the QAT VFs as a resource in the pod, add the request for the resource into the pod specification file by specifying its name and the amount of resources required. If the resource is not available or the amount of resources requested is greater than the number of resources available, the pod status will be “Pending” until the resource is available.

A sample pod requesting the Intel® QuickAssist Adapter VF may look like this:

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: qat-dpdk
spec:
  containers:
  - name: crypto-perf
    image: intel/crypto-perf:devel
    imagePullPolicy: IfNotPresent
    command: [ "/bin/bash", "-c", "--" ]
    args: [ "while true; do sleep 300000; done;" ]
    volumeMounts:
    - name: hugepages
      mountPath: /hugepages
    - name: varvol
      mountPath: /var/run
      readOnly: false
    resources:
      requests:
        cpu: 3
        memory: 1Gi
        qat.intel.com/generic: 4
        hugepages-1Gi: 1Gi
      limits:
        cpu: 3
        memory: 1Gi
        qat.intel.com/generic: 4
        hugepages-1Gi: 1Gi
    securityContext:
      readOnlyRootFilesystem: true
      capabilities:
        add:
        - IPC_LOCK
        - SYS_NICE
        - SYS_ADMIN
        - NET_ADMIN
  restartPolicy: Never
  volumes:
  - name: hugepages
    emptyDir:
      medium: HugePages
  - name: varvol
    hostPath:
      path: /var/run

```

To test the resource allocation to the pod, save the above code snippet to the `sample.yaml` file and create the pod.
```
kubectl create -f sample.yaml
```

### Verification of the QAT and the Device Plugin
Once the pod is in the 'Running' state, check that the device was allocated to the pod (a uioX device and an environmental variable with a device PCI address should be available):
```shell
kubectl exec qat-dpdk -- ls -l /dev/vfio | grep -P '^c.*\d$'
```
Sample output:
```shell
crw------- 1 root root 244,  18 Apr  9 17:05 108
crw------- 1 root root 244,  22 Apr  9 17:05 112
crw------- 1 root root 244,  31 Apr  9 17:05 121
crw------- 1 root root 244,   8 Apr  9 17:05 98
```
```shell
kubectl exec qat-dpdk -- env | grep QAT
```
Sample output:
```shell
QAT2=0000:b1:02.0
QAT1=0000:b3:01.2
QAT0=0000:b3:01.6
QAT3=0000:b3:02.7
```
To check the number of devices currently allocated to pods, run (and search for 'Allocated Resources'):

```shell
kubectl describe node $(hostname)
```

To test pod QAT resources allocation by QAT device plugin, run dpdk-test-crypto-perf application:
> **NOTE**: At least one free 1Gi hugepage is needed on the system to run this application successfully.

```shell
kubectl exec qat-dpdk -- bash -c 'dpdk-test-crypto-perf -a $QAT0 -- --ptest throughput --devtype crypto_qat --optype cipher-only --cipher-algo aes-cbc --cipher-op encrypt --cipher-key-sz 16 --total-ops 10000000 --burst-sz 32 --buffer-sz 64'
```

Sample output:

```shell
EAL: Detected 96 lcore(s)
EAL: Detected 2 NUMA nodes
EAL: Detected static linkage of DPDK
EAL: Multi-process socket /var/run/dpdk/rte/mp_socket
EAL: Selected IOVA mode 'PA'
EAL: Probing VFIO support...
EAL: VFIO support initialized
EAL:   using IOMMU type 1 (Type 1)
EAL: Probe PCI driver: qat (8086:37c9) device: 0000:b3:01.6 (socket 1)
CRYPTODEV: Creating cryptodev 0000:b3:01.6_qat_sym

CRYPTODEV: Initialisation parameters - name: 0000:b3:01.6_qat_sym,socket id: 1, max queue pairs: 0
CRYPTODEV: Creating cryptodev 0000:b3:01.6_qat_asym

CRYPTODEV: Initialisation parameters - name: 0000:b3:01.6_qat_asym,socket id: 1, max queue pairs: 0
Allocated pool "priv_sess_mp_1" on socket 1
CRYPTODEV: elt_size 0 is expanded to 240

Allocated pool "sess_mp_1" on socket 1
# Crypto Performance Application Options:
#
# cperf test: throughput
#
# size of crypto op / mbuf pool: 8192
# total number of ops: 10000000
# buffer sizes: 64 
# burst sizes: 32 

# segment size: 64
#
# cryptodev type: crypto_qat
#
# number of queue pairs per device: 2
# crypto operation: cipher-only
# sessionless: no
# out of place: no
#
# cipher algorithm: aes-cbc
# cipher operation: encrypt
# cipher key size: 16
# cipher iv size: 16
#
    lcore id    Buf Size  Burst Size    Enqueued    Dequeued  Failed Enq  Failed Deq        MOps        Gbps  Cycles/Buf

          72          64          32    10000000    10000000    40671829    37530011      3.2557      1.6669      703.38
          25          64          32    10000000    10000000    62127666    58085366      3.2539      1.6660      703.78
```

## Reference
- [Intel® QuickAssist Adapter](https://www.intel.com/content/dam/www/public/us/en/documents/product-briefs/quickassist-adapter-8960-8970-brief.pdf)
