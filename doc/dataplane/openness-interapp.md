```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```
<!-- omit in toc -->
# InterApp Communication support in OpenNESS
- [Overview](#overview)
- [InterApp Communication support in OpenNESS Network Edge](#interapp-communication-support-in-openness-network-edge)

## Overview

Multi-core edge cloud platforms typically host multiple containers or virtual machines as PODs. These applications sometimes need to communicate with each other as part of a service or consuming services from another application instance. This means that an edge cloud platform should provide not just the Dataplane interface but also the infrastructure to enable applications communicate with each other whether they are on the same platform or spanning across multiple platform. OpenNESS provides the infrastructure for Network edge mode.

> Note: InterApps Communication mentioned here are not just for applications but also applicable for Network functions like Core Network User plane, Base station and so on.


## InterApp Communication support in OpenNESS Network Edge
InterApp communication on the OpenNESS Network edge version is supported using OVN/OVS as the infrastructure. OVN/OVS in the network edge is supported through the Kubernetes kube-OVN Container Network Interface (CNI).

OVN/OVS is used as default networking infrastructure for:
- Dataplane Interface: UE's to edge applications
- InterApp Interface : Communication infrastructure for applications to communicate
- Default Interface: Interface for managing the Application POD (e.g. ssh to application POD)
- Cloud/Internet Interface: Interface for Edge applications to communicate with the cloud/Internet

![OpenNESS Network Edge Interfaces](iap-images/iap2.png)

 _Figure - OpenNESS Network Edge Interfaces_
