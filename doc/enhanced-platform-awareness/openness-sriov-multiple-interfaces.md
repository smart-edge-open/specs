```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# Multiple Interface and PCIe SRIOV support in OpenNESS 

- [Multiple Interface and PCIe SRIOV support in OpenNESS](#multiple-interface-and-pcie-sriov-support-in-openness)
  - [Overview](#overview)
    - [Overview of Multus](#overview-of-multus)
    - [Overview of SR-IOV CNI](#overview-of-sr-iov-cni)
    - [Overview of SR-IOV Device Plugin](#overview-of-sr-iov-device-plugin)
  - [Details - Multiple Interface and PCIe SRIOV support in OpenNESS](#details---multiple-interface-and-pcie-sriov-support-in-openness)
    - [Multus usage](#multus-usage)
    - [SRIOV](#sriov)
      - [Edgecontroller setup](#edgecontroller-setup)
      - [Edgenode setup](#edgenode-setup)
      - [Usage](#usage)
  - [Reference](#reference)

## Overview 

Edge deployments consist of both Network Functions and Applications. Cloud Native solutions like Kubernetes typically expose only one interface to the Application or Network function PODs. These interfaces are typically bridged interfaces. This means that Network Functions like Base station or Core network User plane functions and Applications like CDN etc. are limited by the default interface.

To address this we need to enable two key networking features: 
1) Enable a Kubernetes like orchestration environment to provision more than one interface to the application and Network function PODs 
2) Enable the allocation of dedicated hardware interfaces to application and Network Function PODs 

### Overview of Multus 

To enable multiple interface support in PODs, OpenNESS Network Edge uses the Multus container network interface. Multus CNI is a container network interface (CNI) plugin for Kubernetes that enables the attachment of multiple network interfaces to pods. Typically, in Kubernetes each pod only has one network interface (apart from a loopback) – with Multus you can create a multi-homed pod that has multiple interfaces. This is accomplished by Multus acting as a “meta-plugin”, a CNI plugin that can call multiple other CNI plugins. Multus CNI follows the Kubernetes Network Custom Resource Definition De-facto Standard to provide a standardized method by which to specify the configurations for additional network interfaces. This standard is put forward by the Kubernetes Network Plumbing Working Group.

Below is an illustration of the network interfaces attached to a pod, as provisioned by the Multus CNI. The diagram shows the pod with three interfaces: eth0, net0 and net1. eth0 connects to the Kubernetes cluster network to connect with the Kubernetes server/services (e.g. kubernetes api-server, kubelet and so on). net0 and net1 are additional network attachments and connect to other networks by using other CNI plugins (e.g. vlan/vxlan/ptp). 

![Multus overview](multussriov-images/multus-pod-image.svg)

_Figure - Multus Overview_

### Overview of SR-IOV CNI

The Single Root I/O Virtualization (SR-IOV) feature provides the ability to partition a single physical PCI resource into virtual PCI functions that can be allocated to application and network function PODs. To enable SR-IOV device resource allocation and CNI, OpenNESS Network Edge uses the SR-IOV CNI and SR-IOV Device Plugin. The SR-IOV CNI plugin enables the Kubernetes pod to be attached directly to an SR-IOV virtual function (VF) using the standard SR-IOV VF driver in the container host’s kernel.

![SR-IOV CNI](multussriov-images/sriov-cni.png)

_Figure - SR-IOV CNI_

### Overview of SR-IOV Device Plugin

The Intel SR-IOV Network device plugin discovers and exposes SR-IOV network resources as consumable extended resources in Kubernetes. This works with SR-IOV VFs in both Kernel drivers and DPDK drivers. When a VF is attached with a kernel driver, then the SR-IOV CNI plugin can be used to configure this VF in the Pod. When using the DPDK driver, a VNF application configures this VF as required.


![SR-IOV Device plugin](multussriov-images/sriov-dp.png)

_Figure - SR-IOV Device plugin_

## Details - Multiple Interface and PCIe SRIOV support in OpenNESS

The Multus role is enabled by default in ansible(`ne_controller.yml`):

```
    - role: multus
```

>NOTE: Multus is installed only for Network Edge mode.

### Multus usage

[Custom resource definition](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#custom-resources) (CRD) is used to define additional network that can be used by Multus.

1. The following example creates a `NetworkAttachmentDefinition` that can be used to provide an additional macvlan interface to a POD:
```bash
cat <<EOF | kubectl create -f -
apiVersion: "k8s.cni.cncf.io/v1"
kind: NetworkAttachmentDefinition
metadata:
  name: macvlan
spec:
  config: '{
    "name": "mynet",
    "type": "macvlan",
    "master": "virbr0",
    "ipam": {
      "type": "host-local",
      "subnet": "192.168.1.0/24",
      "rangeStart": "192.168.1.200",
      "rangeEnd": "192.168.1.216"
    }
  }'
EOF
```
2. To list defined configurations use:
```bash
  kubectl get network-attachment-definitions
```
3. To create a pod that uses the previously created interface add an annotation to pod definition:
```yaml
  apiVersion: v1
  kind: Pod
  metadata:
    name: samplepod
    annotations:
      k8s.v1.cni.cncf.io/networks: macvlan
```
> NOTE: More networks can be added after a coma in the same annotation
4. To verify that the additional interface was configured run `ip a` in the deployed pod. The output should look similar to the following:
```bash
  1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
  2: net1@if178: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state LOWERLAYERDOWN
    link/ether 06:3d:10:e3:34:a4 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 192.168.1.200/24 scope global net1
       valid_lft forever preferred_lft forever
  308: eth0@if309: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc noqueue state UP
    link/ether 0a:00:00:10:00:12 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.16.0.17/16 brd 10.16.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

### SRIOV

#### Edgecontroller setup
To install the OpenNESS controller with SR-IOV support please uncomment `role: sriov/master` in `ne_controller.yml` of Ansible scripts. Please also remember, that `role: multus` has to be enabled as well.

```yaml
- role: sriov/master
```

#### Edgenode setup
To install the OpenNESS node with SR-IOV support please uncomment `role: sriov/worker` in `ne_node.yml` of Ansible scripts.

```yaml
- role: sriov/worker
```

For the installer to turn on the specified number of SR-IOV VFs for selected network interface of node, please provide that information in format `{interface_name: VF_NUM, ...}` in `sriov.network_interfaces` variable inside config files in `host_vars` ansible directory. 
Due to the technical reasons, each node has to be configured separately. Copy the example file `host_vars/node1.yml` and then create a similar one for each node being deployed.

Please also remember, that each node must be added to Ansible inventory file `inventory.ini`.

For example providing `host_vars/node1.yml` with:

```yaml
sriov:
  network_interfaces: {ens787f0: 4, ens787f1: 8}
```

will enable 4 VFs for network interface (PF) `ens787f0` and 8 VFs for network interface `ens787f1` of `node1`.

#### Usage
SRIOV plugins use [Multus](#multus-plugin), the usage is very similar to the one described above. By default OpenNESS will create network `sriov-openness` which can be used to attach VFs. You can find the `sriov-openness` network's CRD below:

```yaml
apiVersion: "k8s.cni.cncf.io/v1"
kind: NetworkAttachmentDefinition
metadata:
  name: sriov-openness
  annotations:
    k8s.v1.cni.cncf.io/resourceName: intel.com/intel_sriov_netdevice
spec:
  config: '{
  "type": "sriov",
  "cniVersion": "0.3.1",
  "name": "sriov-openness-network",
  "ipam": {
    "type": "host-local",
    "subnet": "192.168.2.0/24",
    "routes": [{
      "dst": "0.0.0.0/0"
    }],
    "gateway": "192.168.2.1"
  }
}'
```

> Note: Users can create network with different CRD if they need to.

1. To create a POD with an attached SR-IOV device, add the network annotation to the POD definition and `request` access to the SR-IOV capable device (`intel.com/intel_sriov_netdevice`):
```yaml
  apiVersion: v1
  kind: Pod
  metadata:
    name: samplepod
    annotations:
      k8s.v1.cni.cncf.io/networks: sriov-openness
  spec:
    containers:
    - name: samplecnt
      image: centos/tools
      resources:
        requests:
          intel.com/intel_sriov_netdevice: "1"
```

2. To verify that the additional interface was configured run `ip a` in the deployed pod. The output should look similar to the following:
```bash
  1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
  41: net1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
      link/ether aa:37:23:b5:63:bc brd ff:ff:ff:ff:ff:ff
      inet 192.168.2.2/24 brd 192.168.2.255 scope global net1
        valid_lft forever preferred_lft forever
  169: eth0@if170: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc noqueue state UP group default 
      link/ether 0a:00:00:10:00:0b brd ff:ff:ff:ff:ff:ff link-netnsid 0
      inet 10.16.0.10/16 brd 10.16.255.255 scope global eth0
        valid_lft forever preferred_lft forever
```

## Reference 
For further details 
- SR-IOV CNI: https://github.com/intel/sriov-cni
- Multus: https://github.com/Intel-Corp/multus-cni
- SR-IOV network device plugin: https://github.com/intel/intel-device-plugins-for-kubernetes


