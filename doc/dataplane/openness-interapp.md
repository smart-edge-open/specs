```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```
<!-- omit in toc -->
# InterApp Communication Support in OpenNESS
- [Overview](#overview)
- [InterApp Communication support in OpenNESS Network Edge](#interapp-communication-support-in-openness-network-edge)

## Overview

Multi-core edge cloud platforms typically host multiple containers or virtual machines as PODs. These applications sometimes need to communicate with each other as part of a service or consuming services from another application instance. This means that an edge cloud platform should provide not just the data plane interface (to enable user data transfer to and from clients) but also the infrastructure to enable applications to communicate with each other whether they are on the same platform or spanning across multiple platforms. OpenNESS provides the infrastructure for both in the network edge mode.

>**NOTE**: The InterApps Communication mentioned here is not just for applications but it is also applicable for Network functions (Core Network User plane, Base station, etc.).

## InterApp Communication support in OpenNESS Network Edge

InterApp communication on the OpenNESS Network Edge is supported using Open Virtual Network for Open vSwitch [OVN/OVS](https://github.com/open-ness/x-specs/blob/master/doc/dataplane/openness-ovn.md) as the infrastructure. OVN/OVS in the network edge is supported through the Kubernetes kube-OVN Container Network Interface (CNI).

OVN/OVS is used as a default networking infrastructure for:
- Data plane interface: User data transmission between User Equipment (UE) and edge applications
- InterApp interface : Communication infrastructure for applications to communicate
- Default interface: Interface for managing the application POD (e.g., SSH to application POD)
- Cloud/Internet interface: Interface for edge applications to communicate with the cloud/Internet

![Data Plane Interfaces in OpenNESS Network Edge](iap-images/iap2.png)

 _Figure - OpenNESS Network Edge Interfaces_
