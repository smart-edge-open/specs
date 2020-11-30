```text
SPDX-License-Identifier: Apache-2.0       
Copyright (c) 2020 Intel Corporation
```
# Multiple Clusters Orchestration(EMCO) support in OpenNESS

- [Multiple Clusters Orchestration(EMCO) support in OpenNESS](#emco-support-in-openness)
  - [Background](#background)
  - [EMCO Introduction](#emco-introduction)
    - [EMCO Architecture](#emco-architecture)
    - [EMCO API](#emco-api)
    - [EMCO Installation](#emco-installation)
  - [Practice with EMCO: SmartCityp Deployment](#smartcity-deployment-with-emco)

## Background
EMCO(Edge Multiple Clusters Orchestration) is Geo distributed application orchestrator for Kubernetes\*. The main objective of EMCO is automation of the deployment of applications and services across clusters. It acts as a central orchestrator that can manage edge services and network functions across geographically distributed edge clusters from different 3rd parties. Finally, the resource orchestration within a cluster of nodes will leverage Kubernetes and Helm charts.

It address the need for deploying 'composite applications' in multiple geographical locations. Few industry communities started to use the term 'composite application' to represent these complex applications & deployments.
> **NOTE**: Composite application is combination of multiple applications. Based on the deployment intent, various applications of the composite application get deployed at various locations,  and get replicated in multiple locations.

Compared with other multipe-clusters orchestration, EMCO focuses on the below functionalies:
- Enroll multiple geographically distributed OpenNESS Clusters and 3rd party Cloud Clusters.
- Orchestrate composite applications (composed of multiple individual applications) across the edge clusters
- Deploy edge services and network functions on to different nodes spread across these different clusters.
- Monitor the health of the deployed edge services/network functions across these clusters.
- Orchestrate edge services and network functions with deployment intents based on compute, acceleration, and storage requirements.
- Support onboard multiple tenants from different enterprises while ensuring confidentiality and full isolation across the tenants.


The below figure shows the topology overview for the OpenNESS EMCO orchestration with edge and multiple clusters .
![OpenNESS EMCO](openness-emco-images/openness-emco-topology.png)

_Figure - Topology Overview with OpenNESS EMCO_

All the manged edge clusters and cloud clusters will be connected with EMCO cluster through WAN network. 
- The central orchestration (EMCO) cluster installation can use [OpenNESS Central Orchestrator Flavor](https://github.com/otcshare/specs/blob/master/doc/flavors.md). 
- The edge clusters in the diagram can be installed and provisioned by using [OpenNESS Media Analytics Flavor](https://github.com/otcshare/specs/blob/master/doc/flavors.md)
- The cloud cluster in the diagram can be any types of cloud clusters, for example: Azure Cloud.
- The composite application - SmartCity is composed of two parts: edge applications and web applications. 
  - The edge application executes media processing and analytics on the multiple edge clusters to reduce latency.
  - The web application is kinds of cloud application for additional post-processing such as calculating statistics and display/visualization on the cloud cluster side.
  - EMCO user can deploy the smart city applications across the clusters. Besides that, EMCO supports override values profiles for operator to satisfy the need of deployments. 
  - More details about refer to [SmartCity Deployment Practise with EMCO](#smartcity-deployment-with-emco).

This document aims to familiarize the user with [OpenNESS deployment flavor](https://github.com/otcshare/specs/blob/master/doc/flavors.md) for EMCO installation and provsion, and provide instructions accordingly.
## EMCO Introduction
### EMCO Architecture
The following diagram depicts a high level overview of the EMCO architecture.
![OpenNESS EMCO](openness-emco-images/openness-emco-arch.png)
  - Cluster Registration Controller registers clusters by cluster owners.
  - Distributed Application Scheduler provides simplified, and extensible placement.
  - Network Configuration Management handles creation/management of virtual and provider networks.
  - Hardware Platform Aware Controller enables scheduling with auto-discovery of platform features/ capabilities.
  - Distributed Cloud Manager presents a single logical cloud from multiple edges.
  - Secure Mesh Controller auto-configures both service mesh (ISTIO) and security policy (NAT, firewall).
  - Secure WAN Controller automates secure overlays across edge groups.
  - Resource Syncronizer manages instantiation of resources to clusters.
  - Monitoring covers distributed application.
 
#### Cluster Registration
s micro-service exposes RESTful API. One can register Cluster providers and clusters of those providers via these APIs. After preparation of edge clusters and cloud clusters which can be any kubernetes clusters, user can onboard those clusters to EMCO by creating a Cluster Provider and then adding Clusters to the Cluster Provider. After cluster providers creation, the KubeConfig files of edge and cloud clusters should be provided to EMCO as part of the multi-part POST call to the Cluster API. 

Additionally, once a Cluster is created, labels and key value pairs may be added to the Cluster via the EMCO API.  Clusters can be specified by label when preparing placement intents.
> **NOTE**: The cluster provider is somebody who owns clusters and registers them to EMCO. If an Enterprise has clusters from say AWS, then the cluster provider for those clusters from AWS is still considered as from that Enterprise. AWS is not the provider. Here, the provider is somebody who owns clusters and registers them here. Since, AWS does not register their clusters here, AWS is not considered as Cluster provider in this context.
 
#### Distributed Application Scheduler
The distrbuted application scheduler microservice provides functionalities:
- Project Management provides multi-tenancy in the application from a user perspective
- Composite App Management  manages composite apps that are collections of Helm Charts one per application
- Composite Profile Management  manages composite profiles that are collections of profile one per application
- Deployment Intent Group Management manages Intents for composite Applications
- Controller Registration manages placement and action controller registration, priorities etc.
- Status Notifier framework allows user to get on-demand status updates or notifications on status updates
- Scheduler 
  - Placement Controllers: Generic Placement Controller 
  - Action Controllers

#### Network Configuration Management
The network configuratin mangement(NCM) microservice provdes functionalities:
- Provider Network Management to create provider networks 
- Virtual Network Management to create dynamic virtual networks 
- Controller Registration manages network plugin controllers, priorities etc.
- Status Notifier framework allows user to get on-demand status updates or notifications on status updates
- Scheduler with Built in Controller - OVN-for-K8s-NFV Plugin Controller


#### Resource Syncronizer
This micro-services is the one which deploys the resources in edge/cloud clusters. 'Resource contexts' created by various micro-services are used by this micro-service. It will take care of retrying in case the remote clusters are not reachable temporarily. 


### EMCO API
For user interaction, EMCO provides [RESTAPI](https://github.com/otcshare/EMCO/blob/main/docs/emco_apis.yaml). Apart from that, EMCO also provides CLI. For the detailed usage, refer to [EMCO CLI](https://github.com/otcshare/EMCO/tree/main/src/tools/emcoctl)
> **NOTE**: The EMCO REST API is the foundation for the other interaction facilities like the EMCO CLI and even EMCO GUI (3rd party developed right now)

### EMCO Installation
The first step is to prepare one server envionment which need to fulfill the [Preconditions](https://github.com/otcshare/specs/blob/master/doc/getting-started/network-edge/controller-edge-node-setup.md#preconditions).

Then Place the EMCO server hostname in `[controller_group]` group in `inventory.ini` file of openness-experience-kit. 
> **NOTE**: `[edgenode_group]` and `[edgenode_vca_group]` are not required for configuration, since EMCO micro services just need to deployed on the kubernetes control plane node.

Run script `./deploy_ne.sh -f central_orchestrator`. Deployment should complete successfully. In the flavor, harbor registry will be deployed to provide images services as well.

## Practice with EMCO: SmartCityp Deployment
One OpenNESS edge nodes (representing regional office) and One legacy K8s Cluster (repsenting cloud) are connected to the OpenNESS EMCO cluster. Smart City application is a sample application that is built on top of the OpenVINO & Open Visual Cloud software stacks for media processing and analytics. The whole application is composed of two parts: EdgeApp(multiple OpenNESS edge clusters) and WebApp(cloud application for additional post-processing such as calculating statistics and display/visualization) as shown as below diagram.
![OpenNESS EMCO](openness-emco-images/openness-emco-smtc.png)

The following are the typical steps involved in the cluster registration and deployment of the application using OpenNESS EMCO.
- Prerequisites
  - Make One OpenNESS Edge Cluster Ready with any OpenNESS Flavor (OpenNESS Application Node Flavor is proposed)
  - Make One Legacy K8s Cluster Ready (Simualte cloud cluster)
  - Prepare One Server with a Vanilla CentOS for EMCO (Only one server is required for EMCO cluster)
- EMCO Configuration
- Create Cluster Provider
- Clusters Registration
- Create Project
- DeploySmartCity Application

### EMCO Configuration
After [EMCO Installation](#emco-installation), logon the EMCO server, and prepare EMCO CLI `local-cfg.yaml` file as below
```yaml
  orchestrator:
    host: localhost
    port: 31298
  clm:
    host: localhost
    port: 31856
  ncm:
    host: localhost
    port: 32737
  ovnaction:
    host: localhost
    port: 31072
  dcm:
    host: localhost
    port: 31877
```

Prepared EMCO controller resource files for resource synchronization - 'controller.yaml' file as below
```yaml
---
version: emco/v2
resourceContext:
   anchor: controllers
metadata :
   name: rsync
spec:
   host: "192.168.121.103"
   port: 30546
```
> **NOTE**: `192.168.121.103` is example IP address of EMCO server.

Use EMCO CLI to create the controller entry with expected result as below:
```shell
# /opt/emco/bin/emcoctl/emcoctl --config local-cfg.yaml apply -f controllers.yaml
Using config file: local-cfg.yaml
http://192.168.121.103:31298/v2URL: controllers Response Code: 201
``` 

### Create Cluster Provider
