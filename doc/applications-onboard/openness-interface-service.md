SPDX-License-Identifier: Apache-2.0    
Copyright © 2019 Intel Corporation

# OpenNESS Interface Service

  - [Overview](#overview)
  - [Traffic from external host](#traffic-from-external-host)
  - [Usage](#usage)
  - [Default parameters](#default-parameters)
  - [Supported drivers](#supported-drivers)
  - [Hugepages (DPDK)](#hugepages-dpdk)
  - [Examples](#examples)
    - [Getting information about node's interfaces](#getting-information-about-nodes-interfaces)
    - [Attaching kernel interfaces](#attaching-kernel-interfaces)
    - [Attaching DPDK interfaces](#attaching-dpdk-interfaces)
    - [Detaching interfaces](#detaching-interfaces)

## Overview 

Interface service is an application running in K8s pod on each worker node of OpenNESS K8s cluster. It allows to attach additional network interfaces of the worker host to provided OVS bridge, enabling external traffic scenarios for applications deployed in K8s pods. Services on each worker can be controlled from master node using kubectl plugin.

Interface service can attach both kernel and userspace (DPDK) network interfaces to OVS bridges of suitable type.

## Traffic from external host

When a machine is physically connected to an OpenNESS edge node over a cable would be able to communicate its pods when this physical network interface is attached to the cluster. This network interface can be attached by providing its PCI ID or MAC address to the `interfaceservice` kubectl plugin.

The machine which is connected to the edge node must be configured as shown below in order to allow the traffic directed to the kubernetes cluster (example: `10.16.0.0/16` subnet) to go through `192.168.1.1` gateway. Update the physical ethernet interface and the Linux IP routing table as:

```bash 
  ip a a 192.168.1.5/24 dev eth1
  route add -net 10.16.0.0/16 gw 192.168.1.1 dev eth1
```

> **NOTE:** Default OpenNESS network policy applies to pods in `default` namespace and blocks all ingress traffic. Refer to [Kubernetes NetworkPolicies](https://github.com/otcshare/specs/blob/master/doc/applications-onboard/network-edge-applications-onboarding.md#applying-kubernetes-network-policies) for example policy allowing ingress traffic from `192.168.1.0` subnet on specific port.

> **NOTE:** The subnet `192.168.1.0/24` is allocated by Ansible playbook to the physical interface which is attached to the first edge node. The second edge node joined to the cluster is allocated the next subnet `192.168.2.0/24` and so on.

> **NOTE:** To identify which subnet is allocated to which node, use this command:
>  ```shell
>  $ kubectl get subnets
>  NAME             PROTOCOL   CIDR             PRIVATE   NAT     DEFAULT   GATEWAYTYPE   USED   AVAILABLE
>  jfsdm001-local   IPv4       192.168.1.0/24   false     false   false     distributed   0      255
>  jfsdm002-local   IPv4       192.168.2.0/24   false     false   false     distributed   0      255
>  ...
>  ```
>
> The list of subnets represents which edgenode is allocated to which subnet (CIDR), e.g: node `jfsdm002` is allocated to subnet `192.168.2.0/24`.

## Usage

* `kubectl interfaceservice --help` to learn about usage
* `kubectl interfaceservice get <node_hostname>` to list network interfaces of node
* `kubectl interfaceservice attach <node_hostname> <pci_addr1,pci_addr2,...> <ovs_bridge> <driver>` to attach interfaces to OVS bridge `<ovs_bridge>` using specified `driver`. 
* `kubectl interfaceservice detach <node_hostname> <pci_addr1,pci_addr2,...>` to detach interfaces from OVS br_local bridge

> NOTE: `node_hostname` must be valid worker node name - can be found using `kubectl get nodes`

> NOTE: Invalid/non-existent PCI addresses passed to attach/detach requests will be ignored

## Default parameters

Parameters `<ovs_bridge>` and `<driver>` are optional for `attach` command. The defaults values are respectively `br-local` for OVS bridge and `kernel` for driver. User can omit both values or driver only if they like to.

## Supported drivers

Currently interface service supports following values of `driver` parameter:
- `kernel` - this will use default kernel driver
- `dpdk` - userspace driver `igb_uio` will be used 

> NOTE: Please remember that `dpdk` devices can be only attached to DPDK-enabled bridges, and `kernel` devices can be only attached to OVS `system` bridges.

## Hugepages (DPDK)

Please be aware that DPDK apps will require specific amount of HugePages enabled. By default the ansible scripts will enable 1024 of 2M HugePages in system, and then start OVS-DPDK with 1GB of those HugePages reserved for NUMA node 0. If you would like to change this settings to reflect your specific requirements please set ansible variables as defined in the example below. This example enables 4 of 1GB HugePages and appends 2GB to OVS-DPDK leaving 2 pages for DPDK applications that will be running in the pods. This example uses Edge Node with 2 NUMA nodes, each one with 1GB of HugePages reserved.

```yaml
# network_edge.yml
- hosts: controller_group
  vars:
    hugepage_amount: "4"

- hosts: edgenode_group
  vars:
    hugepage_amount: "4"
```

```yaml
# roles/machine_setup/grub/defaults/main.yml
hugepage_size: "1G"
```

>The variable `hugepage_amount` that can be found in `roles/machine_setup/grub/defaults/main.yml` can be left at default value of `5000` as this value will be overridden by values of `hugepage_amount` variables that were set earlier in `network_edge.yml`.

```yaml
# roles/kubernetes/cni/kubeovn/common/defaults/main.yml
ovs_dpdk_socket_mem: "1024,1024" # Will reserve 1024MB of hugepages for NUNA node 0 and NUMA node 1 respectively.
ovs_dpdk_hugepage_size: "1Gi" # This is the size of single hugepage to be used by DPDK. Can be 1Gi or 2Mi.
ovs_dpdk_hugepages: "2Gi" # This is overall amount of hugepags available to DPDK.
```

> NOTE: DPDK PCI device connected to specific NUMA node cannot be attached to OVS if hugepages for this NUMA node will not be reserved with `ovs_dpdk_socket_mem` variable.

## Examples

### Getting information about node's interfaces
```shell
[root@master1 ~] kubectl interfaceservice get worker1
  
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
[root@master1 ~] kubectl interfaceservice attach worker1 0000:07:00.2,0000:99:00.9,0000:07:00.3,00:123:123 br-local kernel
Invalid PCI address: 00:123:123. Skipping...
Interface: 0000:99:00.9 not found. Skipping...
Interface: 0000:07:00.2 successfully attached
Interface: 0000:07:00.3 successfully attached
```

Attaching to kernel-spaced bridges can be shortened to:

```shell
kubectl interfaceservice attach worker1 0000:07:00.2
```
or:

```shell
kubectl interfaceservice attach worker1 0000:07:00.2 bridge-name
```

### Attaching DPDK interfaces

> NOTE: Please remember, that the device that is intended to be attached to DPDK bridge, should initially use kernel-space driver and should be not attached to any bridges.
```shell
[root@master1 ~] kubectl interfaceservice attach worker1 0000:07:00.2,0000:07:00.3 br-userspace dpdk
Interface: 0000:07:00.2 successfully attached
Interface: 0000:07:00.3 successfully attached
```

### Detaching interfaces
```shell
[root@master1 ~] kubectl interfaceservice detach worker1 0000:07:00.2,0000:07:00.3
Interface: 0000:07:00.2 successfully detached
Interface: 0000:07:00.3 successfully detached
```
