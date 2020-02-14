SPDX-License-Identifier: Apache-2.0    
Copyright © 2019 Intel Corporation

# OpenNESS Interface Service
  - [Overview](#overview)
  - [Traffic from external host](#traffic-from-external-host)
  - [Usage](#usage)
    - [Example usage](#example-usage)

## Overview 

Interface service is an application running in K8s pod on each worker node of OpenNESS K8s cluster. It allows to attach additional network interfaces of the worker host to `br-local` OVS bridge, enabling external traffic scenarios for applications deployed in K8s pods. Services on each worker can be controlled from master node using kubectl plugin.

## Traffic from external host

When a machine is physically connected to an OpenNESS edge node over a cable would be able to communicate its pods when this physical network interface is attached to the cluster. This network interface can be attached by providing its PCI ID or MAC address to the `interfaceservice` kubectl plugin.

The machine which is connected to the edge node must be configured as shown below in order to allow the traffic directed to the kubernetes cluster (example: `10.16.0.0/16` subnet) to go through `192.168.1.1` gateway. Update the physical ethernet interface and the Linux IP routing table as:

```bash 
  ip a a 192.168.1.5/24 dev eth1
  route add -net 10.16.0.0/16 gw 192.168.1.1 dev eth1
```
> **NOTE:** Default OpenNESS network policy applies to pods in `default` namespace and blocks all ingress traffic. Refer to [Kubernetes NetworkPolicies](https://github.com/otcshare/specs/blob/master/doc/applications-onboard/network-edge-applications-onboarding.md#applying-kubernetes-network-policies) for example policy allowing ingress traffic from `192.168.1.0/24` subnet on specific port. 

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
* `kubectl interfaceservice attach <node_hostname> <pci_addr1,pci_addr2,...>` to attach interfaces to OVS br_local bridge
* `kubectl interfaceservice detach <node_hostname> <pci_addr1,pci_addr2,...>` to detach interfaces from OVS br_local bridge

> NOTE: `node_hostname` must be valid worker node name - can be found using `kubectl get nodes`

> NOTE: Invalid/non-existent PCI addreses passed to attach/detach requests will be ignored

### Example usage

```bash
  [root@master1 ~] kubectl interfaceservice get worker1
  0000:86:00.0  |  3c:fd:fe:b2:42:d0  |  detached
  0000:86:00.1  |  3c:fd:fe:b2:42:d1  |  detached
  0000:86:00.2  |  3c:fd:fe:b2:42:d2  |  detached
  0000:86:00.3  |  3c:fd:fe:b2:42:d3  |  detached


  [root@master1 ~] kubectl interfaceservice attach worker1 0000:86:00.0,0000:86:00.1,0000:86:00.4,00:123:123
  Invalid PCI address: 00:123:123. Skipping...
  Interface: 0000:86:00.4 not found. Skipping...
  Interface: 0000:86:00.0 successfully attached
  Interface: 0000:86:00.1 successfully attached


  [root@master1 ~] kubectl interfaceservice get worker1
  0000:86:00.0  |  3c:fd:fe:b2:42:d0  |  attached
  0000:86:00.1  |  3c:fd:fe:b2:42:d1  |  attached
  0000:86:00.2  |  3c:fd:fe:b2:42:d2  |  detached
  0000:86:00.3  |  3c:fd:fe:b2:42:d3  |  detached
```
