```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```

# OpenNESS Support for OVS as dataplane with OVN

- [OpenNESS Support for OVS as dataplane with OVN](#openness-support-for-ovs-as-dataplane-with-ovn)
  - [OVN Introduction](#ovn-introduction)
  - [OVN/OVS support in OpenNESS Network Edge](#ovnovs-support-in-openness-network-edge)
  - [OVS/OVN support in OpenNESS On Premises (OVN CNI)](#ovsovn-support-in-openness-on-premises-ovn-cni)
    - [Enable OVNCNI](#enable-ovncni)
    - [CNI Implementation](#cni-implementation)
    - [The Network](#the-network)
  - [Summary](#summary)

## OVN Introduction
Open Virtual Network (OVN) is an open source solution based on the Open vSwitch-based (OVS) software-defined networking (SDN) solution for providing network services to instances. OVN adds to the capabilities of OVS to provide native support for virtual network abstractions, such as virtual L2 and L3 overlays and security groups. Further information about the OVN architecture can be found [here](https://www.openvswitch.org/support/dist-docs/ovn-architecture.7.html)

## OVN/OVS support in OpenNESS Network Edge
The primary objective of supporting OVN/OVS in OpenNESS is to demonstrate the capability of using a standard dataplane like OVS for an Edge Compute platform. Using OVN/OVS further provides standard SDN based flow configuration for the edge Dataplane.

The diagram below shows OVS as a dataplane and OVN overlay. This mode of deployment is recommended when the Edge node terminates IP traffic (Wireline, Wireless, LTE CUPS, SGi)

![OpenNESS with NTS as dataplane overview](ovn_images/openness_ovn.png)

[Kube-OVN](https://github.com/alauda/kube-ovn) has been chosen as the CNI implementation for OpenNESS. Additionally, in the following configuration, OpenNESS applications on Edge Nodes are deployed as DaemonSet Pods (in separate "openness" namespace) and exposed to client applications by k8s services.

OVN/OVS is used as the default networking infrastructure for:
- Dataplane Interface: UE's to edge applications 
- InterApp Interface: Communication infrastructure for applications to communicate 
- Default Interface: Interface for managing the Application POD (e.g. ssh to application POD)
- Cloud/Internet Interface: Interface for Edge applications to communicate with the Cloud/Internet

The platform supports OVS-DPDK as a dataplane. OVS-DPDK can be used to high-performance data transmission scenarios in userspace. More about OVS-DPDK can be found [here](http://docs.openvswitch.org/en/latest/howto/dpdk/).

## OVS/OVN support in OpenNESS On Premises (OVN CNI)
For On Premises mode OVS/OVN can be used in place of the default On Premises dataplane which is NTS.
To distinguish it from OVS InterApp this dataplane is often referred to as OVN CNI.
OVN CNI supports both virtual machines and docker containers.

For information on deploying On Premises mode with OVS/OVN instead of NTS refer to [On Premises setup guide](../getting-started/on-premises/controller-edge-node-setup.md#dataplanes).

OVNCNI plugin has been implemented as the CNI for OpenNESS in On-Premises mode. The plugin has been developed based on the specifications provided as part of the [CNCF](https://www.cncf.io/) project. OVNCNI provides network connectivity for Edge applications on the OpenNESS Edge nodes. The applications can be deployed as Docker containers or VMs and are exposed to client applications by Docker services.

The OpenNESS platform supports OVN/OVS-DPDK as a dataplane. However, it is a work in progress. OVN dataplane implementation is not complete, thus, it is not the default networking infrastructure and [NTS](openness-nts.md) still works as such.

OVN/OVS can be used as:
- InterApp Interface: Communication infrastructure for applications to communicate 
- Default Interface: Interface for managing the application container and VM  (e.g. ssh to application container or VM)
- Cloud/Internet Interface: Interface for Edge applications to communicate with the Cloud/Internet

### Enable OVNCNI
To enable OVNCNI instead of NTS, "onprem_dataplane" variable needs to be set to "ovncni", before executing deploy_onprem.yml file to start OpenNESS installation. 
  
```yaml
# group_vars/all.yml
onprem_dataplane: "ovncni"
```
The ansible scripts configure the OVN infrastructure to be used by OpenNNESS. OVN-OVS container is created on each controller and Edge node where OVS is installed and configured to use DPDK. Network connectivity is set for the controller and all the nodes in the OpenNESS cluster. On each Edge node the CNI plugin is built which can be later used to add and delete OVN ports to connect/dicsonnect Edge applications to/from the cluster.

CNI configuration is retrieved from roles/openness/onprem/dataplane/ovncni/master/files/cni.conf file. Additional arguments used by CNI are stored in roles/openness/onprem/dataplane/ovncni/master/files/cni_args.json file. The user is not expected to modify the files.

### CNI Implementation 
OpenNESS EdgeNode has two built-in packages that are used for handling OVN:

"cni" package is implemented based on a CNI skeleton available as a GO package [here](https://godoc.org/github.com/containernetworking/cni/pkg/skel). OpenNESS adds its own implementations of functions the skeleton calls to ADD, DELETE and CHECK OVN ports to existing OVS bridges for connecting applications.

"ovncni" package provides OVN client implementation used to add, delete and get OVN ports. This client is part of the CNI context used for ADD, DELETE and GET commands issued towards OVN. Additionally, the package provides helper functions used by EVA to deploy application VMs and containers.

### The Network
The Controller node acts as the OVN-Central node. The OVN-OVS container deployed on the Controller contains ovn-northd server with north and south databases that store the information on logical ports, switches and routes as well as the physical network components spread across all the connected nodes. The OVN-OVS container deployed on each node runs ovn-controller that connects the node to the south DB on the Controller, and ovs-vswitch daemon that manages the switches on the node.

OVNCNI plugin is installed on each node to provide networking connectivity for its application containers and VMs, keeping their deployment differences transparent to the user and providing homogenous networks in terms of IP addressing.
   
## Summary
OpenNESS is built with a microservices architecture. Depending on the deployment, there may be a requirement to service pure IP traffic and configure the dataplane using standard SDN based tools. OpenNESS demonstrates such a requirement this by providing OVS as a dataplane in the place of NTS without changing the APIs from an end user perspective.

