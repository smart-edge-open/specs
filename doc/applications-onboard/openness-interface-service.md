```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```
<!-- omit in toc -->
# OpenNESS Interface Service
- [Overview](#overview)
- [Traffic from the external host](#traffic-from-the-external-host)
- [Usage](#usage)
- [Default parameters](#default-parameters)
- [Supported drivers](#supported-drivers)
- [Userspace (DPDK) bridge](#userspace-dpdk-bridge)
- [HugePages (DPDK)](#hugepages-dpdk)
- [Examples](#examples)
	- [Getting information about node interfaces](#getting-information-about-node-interfaces)
	- [Attaching kernel interfaces](#attaching-kernel-interfaces)
	- [Attaching DPDK interfaces](#attaching-dpdk-interfaces)
	- [Detaching interfaces](#detaching-interfaces)

## Overview

Interface service is an application running in the Kubernetes\* pod on each node of the OpenNESS Kubernetes cluster. It allows users to attach additional network interfaces of the node to the provided OVS bridge, enabling external traffic scenarios for applications deployed in the Kubernetes\* pods. Services on each node can be controlled from the control plane using kubectl plugin.

Interface service can attach both kernel and user space (DPDK) network interfaces to the appropriate OVS bridges. To perform that operation Kube-OVN needs to be set as main CNI.

## Traffic from the external host

A machine (client-sim) that is physically connected to the OpenNESS edge node over a cable can communicate to the pods in the Kubernetes cluster when the physical network interface (through which the cable is attached) is bridged over to the Kubernetes cluster subnet. This is done by providing the PCI ID or MAC address to the `interfaceservice` kubectl plugin.

The machine that is connected to the edge node must be configured as described below to allow the traffic originating from the client-sim (`192.168.1.0/24` subnet) to be routed over to the Kubernetes cluster (`10.16.0.0/16` subnet).

Update the physical Ethernet interface with an IP from the `192.168.1.0/24` subnet and the Linux\* IP routing table with the routing rule as:
```bash
  ip a a 192.168.1.10/24 dev eth1
  route add -net 10.16.0.0/16 gw 192.168.1.1 dev eth1
```

> **NOTE**: The default OpenNESS network policy applies to pods in a `default` namespace and blocks all ingress traffic. Refer to [Kubernetes NetworkPolicies](https://github.com/open-ness/specs/blob/master/doc/applications-onboard/network-edge-applications-onboarding.md#applying-kubernetes-network-policies) for an example policy allowing ingress traffic from the `192.168.1.0/24` subnet on a specific port.

> **NOTE**: The subnet `192.168.1.0/24` is allocated by the Ansible\* playbook to the physical interface, which is attached to the first edge node. The second edge node joined to the cluster is allocated to the next subnet `192.168.2.0/24` and so on.

> **NOTE**: To identify which subnet is allocated to which node, use the following command:
>  ```shell
>  $ kubectl get subnets
>  NAME             PROTOCOL   CIDR             PRIVATE   NAT     DEFAULT   GATEWAYTYPE   USED   AVAILABLE
>  jfsdm001-local   IPv4       192.168.1.0/24   false     false   false     distributed   0      255
>  jfsdm002-local   IPv4       192.168.2.0/24   false     false   false     distributed   0      255
>  ...
>  ```
>
> The list presents which subnet (CIDR) is bridged to which edgenode. For example, node `jfsdm001` is bridged to subnet `192.168.1.0/24` and node `jfsdm002` is bridged to subnet `192.168.2.0/24`.

> **NOTE**: Ingress traffic originating from `192.168.1.0/24` can only reach the pods deployed on `jfsdm001`. Similarly, `192.168.2.0/24` can reach the pods deployed on `jfsdm002`.

## Usage

* Use `kubectl interfaceservice --help` to learn about usage.
* Use `kubectl interfaceservice get <node_hostname>` to list network interfaces of node.
* Use `kubectl interfaceservice attach <node_hostname> <pci_addr1,pci_addr2,...> <ovs_bridge> <driver>` to attach interfaces to the OVS bridge `<ovs_bridge>` using a specified `driver`.
* Use `kubectl interfaceservice detach <node_hostname> <pci_addr1,pci_addr2,...>` to detach interfaces from `OVS br_local` bridge.

>**NOTE**: `node_hostname` must be a valid node name and can be found using `kubectl get nodes`.

>**NOTE**: Invalid/non-existent PCI addresses passed to attach/detach requests will be ignored

## Default parameters

The parameters `<ovs_bridge>` and `<driver>` are optional for the `attach` command. The default values are `br-local` for OVS bridge and `kernel` for driver. User can omit both values or driver only if they like to.
<!-- fix last sentence above. Make it more clear. Driver only? or driver, as needed?. -->

## Supported drivers 

Currently, interface service supports the following values of the `driver` parameter:
- `kernel`: uses the default kernel driver
- `dpdk`: uses the userspace driver `igb_uio`

>**NOTE**: `dpdk` devices can only be attached to DPDK-enabled bridges, and `kernel` devices can only be attached to OVS `system` bridges.

## Userspace (DPDK) bridge

The default DPDK-enabled bridge `br-userspace` is only available if OpenNESS is deployed with support for [Userspace CNI](https://github.com/open-ness/specs/blob/master/doc/building-blocks/dataplane/openness-userspace-cni.md) and at least one pod was deployed using the Userspace CNI. You can check if the `br-userspace` bridge exists by running the following command on your node:

```shell
ovs-vsctl list-br
```

The output may be similar to:

```shell
[root@node01 ~]# ovs-vsctl list-br
br-int
br-local
br-userspace
```

If `br-userspace` does not exist, you can create it manually by running the following command on your node:

```shell
ovs-vsctl add-br br-userspace -- set bridge br-userspace datapath_type=netdev
```

## HugePages (DPDK)

DPDK apps require a specific amount of HugePages\* enabled. By default, the Ansible scripts will enable 1024 of 2M HugePages in a system, and then start OVS-DPDK with 1GB of those HugePages reserved for NUMA node 0. To change this setting to reflect specific requirements, set the Ansible variables as defined in the following example. This example enables four of 1GB HugePages and appends 2GB to OVS-DPDK, leaving two pages for DPDK applications that run in the pods. This example uses the Edge Node with 2 NUMA nodes, each one with 1GB of HugePages reserved.

```yaml
# inventory/default/group_vars/controller_group/10-default.yml
hugepage_size: "1G"
hugepage_amount: "4"
```

```yaml
# inventory/default/group_vars/edgenode_group/10-default.yml
hugepage_size: "1G"
hugepage_amount: "4"
```

```yaml
# inventory/default/group_vars/all/10-default.yml
kubeovn_dpdk_socket_mem: "1024,1024" # Will reserve 1024MB of hugepages for NUNA node 0 and NUMA node 1, respectively.
kubeovn_dpdk_hugepage_size: "1Gi" # This is the size of single hugepage to be used by DPDK. Can be 1Gi or 2Mi.
kubeovn_dpdk_hugepages: "2Gi" # This is overall amount of hugepags available to DPDK.
```

>**NOTE**: DPDK PCI device connected to a specific NUMA node cannot be attached to OVS if HugePages for this NUMA node is not reserved with the `kubeovn_dpdk_socket_mem` variable.

## Examples

### Getting information about node interfaces
```shell
[root@controlplane1 ~] kubectl interfaceservice get node1

Kernel interfaces:
	0000:02:00.0  |  00:1e:67:d2:f2:06  |  detached
	0000:02:00.1  |  00:1e:67:d2:f2:07  |  detached
	0000:04:00.0  |  a4:bf:01:02:20:c4  |  detached
	0000:04:00.3  |  a4:bf:01:02:20:c5  |  detached
	0000:07:00.0  |  3c:fd:fe:a1:34:c8  |  attached  | br-local
	0000:07:00.2  |  3c:fd:fe:a1:34:ca  |  detached
	0000:07:00.3  |  3c:fd:fe:a1:34:cb  |  detached
	0000:82:00.0  |  68:05:ca:3a:a7:1c  |  detached
	0000:82:00.1  |  68:05:ca:3a:a7:1d  |  detached

DPDK interfaces:
	0000:07:00.1  |  attached  | br-userspace
```

### Attaching kernel interfaces
```shell
[root@controlplane1 ~] kubectl interfaceservice attach node1 0000:07:00.2,0000:99:00.9,0000:07:00.3,00:123:123 br-local kernel
Invalid PCI address: 00:123:123. Skipping...
Interface: 0000:99:00.9 not found. Skipping...
Interface: 0000:07:00.2 successfully attached
Interface: 0000:07:00.3 successfully attached
```

Attaching to kernel-spaced bridges can be shortened to:

```shell
kubectl interfaceservice attach node1 0000:07:00.2
```
or:

```shell
kubectl interfaceservice attach node1 0000:07:00.2 bridge-name
```

### Attaching DPDK interfaces

>**NOTE**: The device to be attached to DPDK bridge should initially use kernel-space driver and should be not be attached to any bridges.
```shell
[root@controlplane1 ~] kubectl interfaceservice attach node1 0000:07:00.2,0000:07:00.3 br-userspace dpdk
Interface: 0000:07:00.2 successfully attached
Interface: 0000:07:00.3 successfully attached
```

### Detaching interfaces
```shell
[root@controlplane1 ~] kubectl interfaceservice detach node1 0000:07:00.2,0000:07:00.3
Interface: 0000:07:00.2 successfully detached
Interface: 0000:07:00.3 successfully detached
```
