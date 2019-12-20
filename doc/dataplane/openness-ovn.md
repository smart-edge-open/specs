```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# OpenNESS Support for OVS as dataplane with OVN 

- [OpenNESS Support for OVS as dataplane with OVN](#openness-support-for-ovs-as-dataplane-with-ovn)
  - [OVN Introduction](#ovn-introduction)
  - [OVN/OVS support in OpenNESS](#ovnovs-support-in-openness)
  - [Summary](#summary)

## OVN Introduction
Open Virtual Network (OVN) is an open source solution based on the Open vSwitch-based (OVS) software-defined networking (SDN) solution for providing network services to instances. OVN adds to the capabilities of OVS to provide native support for virtual network abstractions, such as virtual L2 and L3 overlays and security groups. Further information about the OVN architecture can be found [here](https://www.openvswitch.org/support/dist-docs/ovn-architecture.7.html)

## OVN/OVS support in OpenNESS   
The primary objective of supporting OVN/OVS in OpenNESS is to demonstrate the capability of using a standard dataplane like OVS for an Edge Compute platform. Using OVN/OVS further provides standard SDN based flow configuration for the edge Dataplane. 

The diagram below shows OVS as a dataplane and OVN overlay. This mode of deployment is recommended when the Edge node terminates IP traffic (Wireline, Wireless, LTE CUPS, SGi)

![OpenNESS with NTS as dataplane overview](ovn_images/openness_ovn.png)

[Kube-OVN](https://github.com/alauda/kube-ovn) has been chosen as the CNI implementation for OpenNESS. Additionally, in the following configuration, OpenNESS applications on Edge Nodes are deployed as DaemonSet Pods (in separate "openness" namespace) and exposed to client applications by k8s services.

OVN/OVS is used as the default networking infrastructure for:
- Dataplane Interface: UE's to edge applications 
- InterApp Interface : Communication infrastructure for applications to communicate 
- Default Interface: Interface for managing the Application POD (e.g. ssh to application POD)
- Cloud/Internet Interface: Interface for Edge applications to communicate with the Cloud/Internet  

> Note: It should be noted that the current release does not support OVS-DPDK as a dataplane, but it is planned to be added in the future.

## Summary 
OpenNESS is built with a microservices architecture. Depending on the deployment, there may be a requirement to service pure IP traffic and configure the dataplane using standard SDN based tools. OpenNESS demonstrates such a requirement this by providing OVS as a dataplane in the place of NTS without changing the APIs from an end user perspective.

