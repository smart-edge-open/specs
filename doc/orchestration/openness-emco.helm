```text
SPDX-License-Identifier: Apache-2.0       
Copyright (c) 2020 Intel Corporation
```
# Multiple Clusters Orchestration(EMCO) support in OpenNESS

- [Multiple Clusters Orchestration(EMCO) support in OpenNESS](#emco-support-in-openness)
  - [Introduction](#introduction)
  - [Overall Architecture](#architecture)
  - [Installation for EMCO cluster with OpenNESS Flavor](#emco-installation)


## Introduction
EMCO(Edge Multiple Clusters Orchestration) is Geo distributed application orchestrator for Kubernetes\*. It acts as a central orchestrator that can manage edge services and network functions across geographically distributed edge clusters from different 3rd parties. Thus it address the need for deploying 'composite applications' in multiple geographical locations. Few industry communities started to use the term 'composite application' to represent these complex applications & deployments.
> **NOTE**: Composite application is combination of multiple applications. Based on the deployment intent, various applications of the composite application get deployed at various locations,  and get replicated in multiple locations.

Compared with other multipe-clusters orchestration, EMCO focuses on the below functionalies:
- Enroll multiple geographically distributed OpenNESS Clusters and 3rd party Cloud Clusters.
- Orchestrate composite applications (composed of multiple individual applications) across the edge clusters
- Deploy edge services and network functions on to different nodes spread across these different clusters.
- Monitor the health of the deployed edge services/network functions across these clusters.
- Orchestrate edge services and network functions with deployment intents based on compute, acceleration, and storage requirements.
- Support onboard multiple tenants from different enterprises while ensuring confidentiality and full isolation across the tenants.

This document aims to familiarize the user with [OpenNESS deployment flavor](https://github.com/otcshare/specs/blob/master/doc/flavors.md) for EMCO installation and provsion, and provide instructions accordingly.

## Overall Architecture 
The below figure shows the architecture for the OpenNESS EMCO with an SmartCity applications example in this document.
![OpenNESS EMCO](openness-emco-images/openness-emco-arch.png)

_Figure - EMCO Architecture in OpenNESS_

## Installation for EMCO cluster with OpenNESS Flavor
The first step is to prepare one server envionment which should fulfill the [Preconditions](https://github.com/otcshare/specs/blob/master/doc/getting-started/network-edge/controller-edge-node-setup.md#preconditions).

Then Place the EMCO server hostname in `[controller_group]` group in `inventory.ini` file of openness-experience-kit. `[edgenode_group]` and `[edgenode_vca_group]` are not required for configuration.

Run script `./deploy_ne.sh -f central_orchestrator`. Deployment should complete successfully.

## xxx
