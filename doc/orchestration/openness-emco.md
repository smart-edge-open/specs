```text
SPDX-License-Identifier: Apache-2.0       
Copyright (c) 2020 Intel Corporation
```
# Multiple Clusters Orchestration(EMCO) support in OpenNESS

- [Multiple Clusters Orchestration(EMCO) support in OpenNESS](#emco-support-in-openness)
  - [Introduction](#introduction)
  - [Overall Architecture](#architecture)
  - [Installation for EMCO cluster with OpenNESS Flavor](#emco-installation)
  - [Cluster Registration with EMCO](#cluster-registration)

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

All the manged edge clusters and cloud clusters will be connected with EMCO cluster through WAN network. 
- The central EMCO cluster installation can use [OpenNESS Central Orchestrator Flavor](https://github.com/otcshare/specs/blob/master/doc/flavors.md). The EMCO includes micro services as below:
  - Cluster Registration Controller registers clusters by cluster owners.
  - Network Configuration Management handles creation/management of virtual and provider networks.
  - Distributed Application Scheduler provides simplified, and extensible placement.
  - Hardware Platform Aware Controller enables scheduling with auto-discovery of platform features/ capabilities.
  - Distributed Cloud Manager presents a single logical cloud from multiple edges.
  - Secure Mesh Controller auto-configures both service mesh (ISTIO) and security policy (NAT, firewall).
  - Secure WAN Controller automates secure overlays across edge groups.
  - Resource Syncronizer manages instantiation of resources to clusters.
  - Monitoring covers distributed application.
- The edge clusters in the diagram can be installed and provisioned by using [OpenNESS Media Analytics Flavor](https://github.com/otcshare/specs/blob/master/doc/flavors.md)
- As for cloud clusters, they can be any types of cloud clusters, for example: Azure Cloud.

The example composite application - smart city is composed of two parts: edge applications and cloud applications. By using EMCO RESTAPI or CLI , operator can deploy the smart city services across the clusters. Besides that, EMCO supports override values profiles for operator to satisfy the need of deployments.

For user interaction, EMCO provides [RESTAPI](https://github.com/otcshare/EMCO/blob/main/docs/emco_apis.yaml). Apart from that, EMCO also provides CLI. For the detailed usage, refer to [EMCO CLI](https://github.com/otcshare/EMCO/tree/main/src/tools/emcoctl)
> **NOTE**: The EMCO REST API is the foundation for the other interaction facilities like the EMCO CLI and even EMCO GUI (3rd party developed right now)

## Installation for EMCO cluster with OpenNESS Flavor
The first step is to prepare one server envionment which need to fulfill the [Preconditions](https://github.com/otcshare/specs/blob/master/doc/getting-started/network-edge/controller-edge-node-setup.md#preconditions).

Then Place the EMCO server hostname in `[controller_group]` group in `inventory.ini` file of openness-experience-kit. 
> **NOTE**: `[edgenode_group]` and `[edgenode_vca_group]` are not required for configuration, since EMCO micro services just need to deployed on the kubernetes control plane node.

Run script `./deploy_ne.sh -f central_orchestrator`. Deployment should complete successfully. In the flavor, harbor registry will be deployed to provide images services as well.

## Cluster Registration with EMCO
After preparation of edge clusters and cloud clusters which can be any kubernetes clusters, user can onboard those clusters to EMCO by creating a Cluster Provider and then adding Clusters to the Cluster Provider. After cluster providers creation, the KubeConfig files of edge and cloud clusters should be provided to EMCO as part of the multi-part POST call to the Cluster API. 

Additionally, once a Cluster is created, labels and key value pairs may be added to the Cluster via the EMCO API.  Clusters can be specified by label when preparing placement intents.
> **NOTE**: The cluster provider is somebody who owns clusters and registers them to EMCO.


##
 
 
