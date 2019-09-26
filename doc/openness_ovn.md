SPDX-License-Identifier: Apache-2.0    
Copyright © 2019 Intel Corporation Inc.    

# OpenNESS Support for OVS as dataplane with OVN 
  - [OpenNESS Introduction](#openness-introduction)
  - [OVN Introduction](#ovn-introduction)
  - [OVN/OVS support in OpenNESS](#ovnovs-support-in-openness)
  - [Summary](#summary)

## OpenNESS Introduction
OpenNESS is an open source software toolkit to enable easy orchestration of edge services across diverse network platform and access technologies in multi-cloud environments. It is inspired by the edge computing architecture defined by the ETSI Multi-access Edge Computing standards (e.g., [ETSI_MEC 003]), as well as the 5G network architecture ([3GPP_23501]).

It leverages major industry edge orchestration frameworks, such as Kubernetes and OpenStack, to implement a cloud-native architecture that is multi-platform, multi-access, and multi-cloud. It goes beyond these frameworks, however, by providing the ability for applications to publish their presence and capabilities on the platform, and for other applications to subscribe to those services. Services may be very diverse, from providing location and radio network information, to operating a computer vision system that recognize pedestrians and cars, and forwards metadata from those objects to to downstream traffic safety applications.

OpenNESS is access network agnostic, as it provides an architecture that interoperates with LTE, 5G, WiFi, and wired networks. In edge computing, dataplane flows must be routed to edge nodes with regard to physical location (e.g., proximity to the endpoint, system load on the edge node, special hardware requirements). OpenNESS provides APIs that allow network orchestrators and edge computing controllers to configure routing policies in a uniform manner.

## OVN Introduction
Open Virtual Network (OVN) is an open source solution based on Open vSwitch-based (OVS) software-defined networking (SDN) solution for providing network services to instances. OVN adds to the capabilities of OVS to provide native support for virtual network abstractions, such as virtual L2 and L3 overlays and security groups. More about OVN architecture can be found [here](https://www.openvswitch.org/support/dist-docs/ovn-architecture.7.html)

## OVN/OVS support in OpenNESS   
The primary objective of supporting OVN/OVS in OpenNESS is to demonstrate the capability of microservices architecture. This means customers can easily replace the exisitng microservice with another one providing similar functionality. OVN/OVS support shows replacing of NTS as dataplane and Flannel as network overlay with OVN/OVS as network overlay OVS as dataplane.  

The diagram below shows NTS as dataplane and Flannel as overlay. This mode of deployment is recommended when the Edge node terminates S1u (GTP-U) and IP traffic (Wireline, Wireless, LTE CUPS, SGi)

![OpenNESS with NTS as dataplane overview](ovn_images/openness_nts.png)

The diagram below shows OVS as datapalne and OVN overlay. This mode of deployment is recommended when the Edge node terminates IP traffic (Wireline, Wireless, LTE CUPS, SGi)

![OpenNESS with NTS as dataplane overview](ovn_images/openness_ovn.png)

[Kube-OVN](https://github.com/alauda/kube-ovn) has been chosen as CNI implementation for OpenNESS. As k8s Network Policy support is provided, it replaces Traffic Rule management known from NTS. Additionally, in following configuration OpenNESS applications on Edge Node are deployed as DaemonSet Pods (in separate "openness" namespace) and exposed to client applications by k8s services.
It should be noted that the current release does not support OVS-DPDK as dataplane, but it's planned to be added in the future.

## Summary 
OpenNESS is built with microservices architecture. Depending on the deployment there might requirement to service pure IP traffic and configure the dataplane using standard SDN based tools. OpenNESS demonstrates such requirement this by providing OVS as dataplane in the place of NTS without changing the APIs from end user perspective. 