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
    - [EMCO Authentication](#emco-auth)
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
- The central orchestration (EMCO) cluster installation can use [OpenNESS Central Orchestrator Flavor](../../flavors.md). 
- The edge clusters in the diagram can be installed and provisioned by using [OpenNESS Media Analytics Flavor](../../flavors.md)
- The cloud cluster in the diagram can be any types of cloud clusters, for example: Azure Cloud.
- The composite application - SmartCity is composed of two parts: edge applications and cloud (web) applications. 
  - The edge application executes media processing and analytics on the multiple edge clusters to reduce latency.
  - The cloud application is kind of web application for additional post-processing such as calculating statistics and display/visualization on the cloud cluster side.
  - EMCO user can deploy the smart city applications across the clusters. Besides that, EMCO supports override values profiles for operator to satisfy the need of deployments. 
  - More details about refer to [SmartCity Deployment Practise with EMCO](#smartcity-deployment-with-emco).

This document aims to familiarize the user with [OpenNESS deployment flavor](../../flavors.md) for EMCO installation and provsion, and provide instructions accordingly.
## EMCO Introduction
### EMCO Architecture
The following diagram depicts a high level overview of the EMCO architecture.
![OpenNESS EMCO](openness-emco-images/openness-emco-arch.png)
_Figure - EMCO Architecture_
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
The distributed application scheduler microservice provides functionalities:
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
The network configuratin management (NCM) microservice provides functionalities:
- Provider Network Management to create provider networks 
- Virtual Network Management to create dynamic virtual networks 
- Controller Registration manages network plugin controllers, priorities etc.
- Status Notifier framework allows user to get on-demand status updates or notifications on status updates
- Scheduler with Built in Controller - OVN-for-K8s-NFV Plugin Controller


#### Resource Syncronizer
This micro-service is the one which deploys the resources in edge/cloud clusters. 'Resource contexts' created by various micro-services are used by this micro-service. It will take care of retrying in case the remote clusters are not reachable temporarily. 


### EMCO API
For user interaction, EMCO provides [RESTAPI](https://github.com/otcshare/EMCO/blob/main/docs/emco_apis.yaml). Apart from that, EMCO also provides CLI. For the detailed usage, refer to [EMCO CLI](https://github.com/otcshare/EMCO/tree/main/src/tools/emcoctl)
> **NOTE**: The EMCO REST API is the foundation for the other interaction facilities like the EMCO CLI and even EMCO GUI (3rd party developed right now)

### EMCO Authentication (FFS - Ritu)
EMCO uses Istio and other open source solutions to provide Multi-tenancy solution leveraging Istio Authorization and Authentication frameworks. This is achieved without adding any logic in EMCO microservices.
- Authentication for the EMCO users are done at the Isito Gateway, where all the traffic enters the cluster. 
- Istio along with autherservice (istio ecosystem project) enables request-level authentication with JSON Web Token (JWT) validation. 
- This can be achieved using a custom authentication provider or any OpenID Connect providers like KeyCloak, Auth0 etc. 

Steps for EMCO Authentication Setup:
- step1 FFS
- step2 FFS

### EMCO Installation
The first step is to prepare one server envionment which need to fulfill the [Preconditions](../../getting-started/network-edge/controller-edge-node-setup.md#preconditions).

Then Place the EMCO server hostname in `[controller_group]` group in `inventory.ini` file of openness-experience-kit. 
> **NOTE**: `[edgenode_group]` and `[edgenode_vca_group]` are not required for configuration, since EMCO micro services just need to deployed on the kubernetes control plane node.

Run script `./deploy_ne.sh -f central_orchestrator`. Deployment should complete successfully. In the flavor, harbor registry will be deployed to provide images services as well.

## Practice with EMCO: SmartCity Deployment
- One OpenNESS edge cluster (representing regional office) and One legacy K8s Cluster (representing cloud) are connected to the OpenNESS EMCO cluster. 
- Smart City application is a sample application that is built on top of the OpenVINO & Open Visual Cloud software stacks for media processing and analytics. 
  - The whole application is composed of two parts: 
    - EdgeApp (multiple OpenNESS edge clusters) 
    - WebApp (cloud application for additional post-processing such as calculating statistics and display/visualization) 
- The whole deployment architecture diagram is shown as below:
![OpenNESS EMCO](openness-emco-images/openness-emco-smtc.png)

_Figure - SmartCity Deployment Architecture Overview_

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

### Cluster Provider Creation and Clusters Registration



### SmartCity Application Deployment
#### Step1: Prepare SmartCity Images, Helm Chart and Override Profiles
On the OpenNESS EMCO cluster. follow the guidance and commands as below:
   ```shell
   #Install cmake and m4 tools if not installed already
   yum install cmake m4 -y

   #On the OpenNESS EMCO cluster, clone the Smart City Reference Pipeline source code from GitHub and checkout the 577d483635856c1fa3ff0fbc051c6408af725712 commits
   git clone https://github.com/OpenVisualCloud/Smart-City-Sample.git
   cd Smart-City-Sample
   git checkout 577d483635856c1fa3ff0fbc051c6408af725712
   
   #build the SmartCity images
   mkdir build
   cd build
   cmake -DNOFFICES=2 -DREGISTRY=<harbor_registry_endpoint>/library # if you leave DREGISTRY empty, you need to follow the tag and push steps below
   ../deployment/kubernetes/helm/build.sh    
   make
   make tunnels
 
   # docker tag above image and push them to harbor registry(manually push images to registry when DREGISTRY empty)
   docker tag smtc_database_tunnelled:latest <harbor_registry_endpoint>/library/smtc_database_tunnelled:latest
   docker tag smtc_storage_manager_tunnelled:latest <harbor_registry_endpoint>/library/smtc_storage_manager_tunnelled:latest
   docker tag smtc_smart_upload_tunnelled:latest <harbor_registry_endpoint>/library/smtc_smart_upload_tunnelled:latest
   docker tag smtc_sensor_simulation:latest <harbor_registry_endpoint>/library/smtc_sensor_simulation:latest
   docker tag smtc_onvif_discovery:latest <harbor_registry_endpoint>/library/smtc_onvif_discovery:latest
   docker tag smtc_db_init:latest <harbor_registry_endpoint>/library/smtc_db_init:latest
   docker tag smtc_alert:latest <harbor_registry_endpoint>/library/smtc_alert:latest
   docker tag smtc_analytics_object_xeon_gst:latest <harbor_registry_endpoint>/library/smtc_analytics_object_xeon_gst:latest
   docker tag smtc_mqtt2db:latest <harbor_registry_endpoint>/library/smtc_mqtt2db:latest
   docker tag smtc_certificate:latest <harbor_registry_endpoint>/library/smtc_certificate:latest
   docker tag smtc_web_cloud_tunnelled:latest <harbor_registry_endpoint>/library/smtc_web_cloud_tunnelled:latest
   docker tag smtc_common:latest <harbor_registry_endpoint>/library/smtc_common:latest
   docker tag eclipse-mosquitto:1.5.8 <harbor_registry_endpoint>/library/eclipse-mosquitto:1.5.8
   # push all images to harbor registry after tagging them with 'docker push' command, as follows:
   docker push <harbor_registry_endpoint>/library/<image_name>
   ```

Make sure the following images list exsiting in the harbor registry project - `library`
   ```text
   - smtc_database_tunnelled:latest
   - smtc_storage_manager_tunnelled:latest
   - smtc_smart_upload_tunnelled:latest
   - smtc_sensor_simulation:latest
   - smtc_onvif_discovery:latest
   - smtc_db_init:latest
   - smtc_alert:latest
   - smtc_analytics_object_xeon_gst:latest
   - smtc_mqtt2db:latest
   - smtc_certificate:latest
   - smtc_web_cloud_tunnelled:latest
   - smtc_common:latest
   - eclipse-mosquitto:1.5.8 
   ```

Packing the helm chart files used by SmartCity `edge` application and put them under `/opt`.
   ```shell
   cd Smart-City-Sample/deployment/kubernetes/helm
   cp -r smtc smtc_edge_helmchart
   rm smtc_edge_helmchart/templates/cloud* -rf
   tar -zcvf smtc_edge_helmchart.tar.gz smtc_edge_helmchart
   mv smtc_edge_helmchart.tar.gz /opt
   ```

Packing the helm chart files used by SmartCity `cloud` application and put them under `/opt`.
   ```shell
   cp -r smtc smtc_cloud_helmchart
   rm smtc_cloud_helmchart/templates/* -rf
   cp smtc/templates/*.tpl smtc_cloud_helmchart/templates/
   cp smtc/templates/cloud* smtc_cloud_helmchart/templates/
   tar -zcvf smtc_cloud_helmchart.tar.gz smtc_cloud_helmchart
   mv smtc_cloud_helmchart.tar.gz /opt
   ```

Prepare Override Profiles - `manifest.yaml` file as below:
```yaml
---
version: v1
type:
  values: "override_values.yaml"
```

Prepare Override Profiles - `override_values.yaml` file with empty content, 
Pack the two files together as two tarball: `smtc_edge_profile.tar.gz` and `smtc_cloud_profile.tar.gz`.


#### Step2: Onboard Helm Chart and Override Profiles


#### Step3: Set Deployment Intent

#### Step4: Approve and Instantiate
