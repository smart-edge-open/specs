```text
SPDX-License-Identifier: Apache-2.0       
Copyright (c) 2020 Intel Corporation
```
# Edge Multi-Cloud Orchestrator (EMCO) Support in OpenNESS

- [Edge Multi-Cloud Orchestrator (EMCO) Support in OpenNESS](#edge-multi-cloud-orchestrator-emco-support-in-openness)
  - [Background](#background)
  - [EMCO Introduction](#emco-introduction)
    - [EMCO Architecture](#emco-architecture)
    - [EMCO API](#emco-api)
    - [EMCO Authentication](#emco-authentication)
    - [EMCO Installation](#emco-installation)
  - [Practise with EMCO: SmartCity Deployment](#practise-with-emco-smartcity-deployment)

## Background
EMCO (Edge Multi-Cloud Orchestration) is a Geo-distributed application orchestrator for Kubernetes\*. The main objective of EMCO is automation of the deployment of applications and services across clusters. It acts as a central orchestrator that can manage edge services and network functions across geographically distributed edge clusters from different third parties. Finally, the resource orchestration within a cluster of nodes will leverage Kubernetes* and Helm charts.

EMCO addresses the need for deploying 'composite applications' in multiple geographical locations. Few industry communities started to use the term 'composite application' to represent these complex applications and deployments.
> **NOTE**: A 'composite application' is a combination of multiple applications. Based on the deployment intent, various applications of the composite application get deployed at various locations, and get replicated in multiple locations.

Compared with the other multipe-clusters orchestration, EMCO focuses on the following functionalies:
- Enrolling multiple geographically distributed OpenNESS Clusters and third party Cloud Clusters.
- Orchestrating composite applications (composed of multiple individual applications) across the edge clusters.
- Deploying edge services and network functions on to different nodes spread across the different clusters.
- Monitoring the health of the deployed edge services/network functions across the clusters.
- Orchestrating edge services and network functions with deployment intents based on compute, acceleration, and storage requirements.
- Supporting onboard for multiple tenants from different enterprises while ensuring confidentiality and full isolation across the tenants.


The following figure shows the topology overview for the OpenNESS EMCO orchestration with edge and multiple clusters.
![OpenNESS EMCO](openness-emco-images/openness-emco-topology.png)

_Figure - Topology Overview with OpenNESS EMCO_

All the managed edge clusters and cloud clusters are connected with EMCO cluster through the WAN network. 
- The central orchestration (EMCO) cluster installation can use [OpenNESS Central Orchestrator Flavor](../../flavors.md). 
- The edge clusters in the diagram can be installed and provisioned by using [OpenNESS Media Analytics Flavor](../../flavors.md). 
- The cloud cluster in the diagram can be any type of cloud cluster, for example: Azure Cloud.
- The composite application - SmartCity is composed of two parts: edge applications and cloud (web) applications. 
  - The edge application executes media processing and analytics on the multiple edge clusters to reduce latency.
  - The cloud application is like a web application for additional post-processing, such as calculating statistics and display/visualization on the cloud cluster side.
  - EMCO user can deploy the  SmartCity applications across the clusters. Besides that, EMCO supports override values, profiles for operator to satisfy the need of deployments. 
  - For more details, refer to [SmartCity Deployment Practise with EMCO](#smartcity-deployment-practise-with-emco).

This document aims to familiarize the user with [OpenNESS deployment flavor](../../flavors.md) for EMCO installation and provision, and provide instructions accordingly.
## EMCO Introduction
### EMCO Architecture
The following diagram depicts a high level overview of the EMCO architecture.
![OpenNESS EMCO](openness-emco-images/openness-emco-arch.png)
_Figure - EMCO Architecture_
  - Cluster Registration Controller registers clusters by cluster owners.
  - Distributed Application Scheduler provides a simplified and extensible placement.
  - Network Configuration Management handles creation/management of virtual and provider networks.
  - Hardware Platform Aware Controller enables scheduling with auto-discovery of platform features/ capabilities.
  - Distributed Cloud Manager presents a single logical cloud from multiple edges.
  - Secure Mesh Controller auto-configures both service mesh (ISTIO) and security policy (NAT, firewall).
  - Secure WAN Controller automates secure overlays across edge groups.
  - Resource Syncronizer manages instantiation of resources to clusters.
  - Monitoring covers distributed application.
 
#### Cluster Registration
A micro-service exposes RESTful API. User can register Cluster providers and clusters of those providers via these APIs. After preparing edge clusters and cloud clusters, which can be any kubernetes* clusters, user can onboard those clusters to EMCO by creating a Cluster Provider and then adding Clusters to the Cluster Provider. After cluster providers are created, the KubeConfig files of edge and cloud clusters should be provided to EMCO as part of the multi-part POST call to the Cluster API. 

Additionally, after a Cluster is created, labels and key value pairs can be added to the Cluster via the EMCO API. Clusters can be specified by label when preparing placement intents.
> **NOTE**: The cluster provider is someone who owns clusters and registers them to EMCO. If an Enterprise has clusters, for example from AWS, then the cluster provider for those clusters from AWS is still considered as from that Enterprise. AWS is not the provider. Here, the provider is someone who owns clusters and registers them here. Since, AWS does not register their clusters here, AWS is not considered as Cluster provider in this context.
 
#### Distributed Application Scheduler
The distributed application scheduler microservice provides functionalities:
- Project Management provides multi-tenancy in the application from a user perspective.
- Composite App Management manages composite apps that are collections of Helm Charts, one per application.
- Composite Profile Management manages composite profiles that are collections of profile, one per application.
- Deployment Intent Group Management manages Intents for composite applications.
- Controller Registration manages placement and action controller registration, priorities etc.
- Status Notifier framework allows user to get on-demand status updates or notifications on status updates.
- Scheduler: 
  - Placement Controllers: Generic Placement Controller. 
  - Action Controllers.

#### Network Configuration Management
The network configuration management (NCM) microservice provides functionalities:
- Provider Network Management to create provider networks 
- Virtual Network Management to create dynamic virtual networks 
- Controller Registration manages network plugin controllers, priorities etc.
- Status Notifier framework allows user to get on-demand status updates or notifications on status updates
- Scheduler with Built in Controller - OVN-for-K8s-NFV Plugin Controller


#### Resource Syncronizer
This micro-service is the one which deploys the resources in edge/cloud clusters. 'Resource contexts' created by various micro-services are used by this micro-service. It takes care of retrying in case the remote clusters are not reachable temporarily. 


### EMCO API
For user interaction, EMCO provides [RESTAPI](https://github.com/otcshare/EMCO/blob/main/docs/emco_apis.yaml). Apart from that, EMCO also provides CLI. For the detailed usage, refer to [EMCO CLI](https://github.com/otcshare/EMCO/tree/main/src/tools/emcoctl)
> **NOTE**: The EMCO REST API is the foundation for the other interaction facilities like the EMCO CLI and even EMCO GUI (third party developed right now)

### EMCO Authentication
(FFS - Ritu)
EMCO uses Istio and other open source solutions to provide Multi-tenancy solution leveraging Istio Authorization and Authentication frameworks. This is achieved without adding any logic in EMCO microservices.
- Authentication for the EMCO users are done at the Isito Gateway, where all the traffic enters the cluster. 
- Istio along with autherservice (istio ecosystem project) enables request-level authentication with JSON Web Token (JWT) validation. 
- This can be achieved using a custom authentication provider or any OpenID Connect providers like KeyCloak, Auth0 etc. 

Steps for EMCO Authentication Setup:
- step1 FFS
- step2 FFS

### EMCO Installation
The first step is to prepare one server environment which needs to fulfill the [Preconditions](../../getting-started/network-edge/controller-edge-node-setup.md#preconditions).

Then Place the EMCO server hostname in `[controller_group]` group in `inventory.ini` file of openness-experience-kit. 
> **NOTE**: `[edgenode_group]` and `[edgenode_vca_group]` are not required for configuration, since EMCO micro services just need to be deployed on the kubernetes* control plane node.

Run script `./deploy_ne.sh -f central_orchestrator`. Deployment should complete successfully. In the flavor, harbor registry is deployed to provide images services as well.

## Practise with EMCO: SmartCity Deployment
- One OpenNESS edge cluster (representing regional office) and One legacy K8s Cluster (representing cloud) are connected to the OpenNESS EMCO cluster. 
- SmartCity application is a sample application that is built on top of the OpenVINO™ and Open Visual Cloud software stacks for media processing and analytics. 
  - The whole application is composed of two parts: 
    - EdgeApp (multiple OpenNESS edge clusters) 
    - WebApp (cloud application for additional post-processing such as calculating statistics and display/visualization) 
- The whole deployment architecture diagram is as shown below:
![OpenNESS EMCO](openness-emco-images/openness-emco-smtc.png)

_Figure - SmartCity Deployment Architecture Overview_

The typical steps involved in the cluster registration and deployment of the application using OpenNESS EMCO are as following:
- Prerequisites
  - Make One OpenNESS Edge Cluster Ready with any OpenNESS Flavor (OpenNESS Application Node Flavor is proposed)
  - Make One Legacy K8s Cluster Ready (Simualte cloud cluster)
  - Prepare One Server with a Vanilla CentOS for EMCO (Only one server is required for EMCO cluster)
- EMCO Configuration
- Create Cluster Provider
- Clusters Registration
- Create Project
- Deploy SmartCity Application

### EMCO Configuration
(SunHui TBD)

1. After [EMCO Installation](#emco-installation), logon to the EMCO server, and check ports used by EMCO micro services(SunHui TBD):
```shell

```

2. To allow EMCO CLI to communicate with EMCO microservices, open firewall port for the EMCO micro services(SunHui TBD, can it be automated by emco flavor??):
```shell
firewall-cmd --zone=public --permanent --add-port xxx/tcp
firewall-cmd --reload
```

3. Prepare EMCO CLI configuration file - `remote.yaml` file:
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
    port: 31181
  dcm:
    host: localhost
    port: 31877
```

4. Prepare EMCO CLI values file - `values.yaml` file:
```yaml
ProjectName: project_smtc
ClusterProvider: smartcity-cluster-provider
ClusterEdge: edge01
ClusterCloud: cloud01
ClusterLogicEdge: lc-edge01
ClusterLogicCloud: lc-cloud01
AdminCloud: default
ComposteApp: composite_smtc
AppEdge: smtc_edge
AppCloud: smtc_cloud
KubeConfigEdge: /opt/clusters_config/edgecluster_config
KubeConfigCloud: /opt/clusters_config/cloudcluster_config
HelmEdgeApp: /opt/smtc_edge_helmchart.tar.gz
HelmCloudApp: /opt/smtc_cloud_helmchart.tar.gz
ProfileEdgeApp: /opt/smtc_edge_profile.tar.gz
ProfileCloudApp:  /opt/smtc_cloud_profile.tar.gz
DeploymentIntent: smtc-deployment-intent-group
RsyncHost: 192.168.121.103
RsyncPort: 32389
```
> **NOTE:**  RsyncHost IP address should be real IP address of EMCO host server.


5. Prepare EMCO controller resource files for resource synchronization - 'controllers_template.yaml' file:
```yaml
---
version: emco/v2
resourceContext:
   anchor: controllers
metadata:
   name: rsync
spec:
   host: {{ .RsyncHost }}
   port: {{ .RsyncPort }}
```

6. Use EMCO CLI to create the controller entry with expected result:
```shell
# /opt/emco/bin/emcoctl/emcoctl --config remote.yaml apply -v values.yaml -f controllers_template.yaml
Using config file: remote.yaml
http://192.168.121.103:31298/v2URL: controllers Response Code: 201
``` 

### Creating Cluster Provider and Registering Clusters
Prepare resource yaml file - `clusters_template.yaml`:
```yaml
---
#clusters provider
version: emco/v2
resourceContext:
  anchor: cluster-providers
metadata:
  name: {{ .ClusterProvider }}

---
#edge cluster
version: emco/v2
resourceContext:
  anchor: cluster-providers/{{ .ClusterProvider }}/clusters
metadata:
  name: {{ .ClusterEdge }}
file: {{ .KubeConfigEdge }}

---
#Add label to the edge cluster
version: emco/v2
resourceContext:
  anchor: cluster-providers/{{ .ClusterProvider }}/clusters/{{ .ClusterEdge }}/labels
label-name: LabelSmartCityEdge

---
#cloud cluster
version: emco/v2
resourceContext:
  anchor: cluster-providers/{{ .ClusterProvider }}/clusters
metadata:
  name: {{ .ClusterCloud }}
file: {{ .KubeConfigCloud }}

---
#Add label to the cloud cluster
version: emco/v2
resourceContext:
  anchor: cluster-providers/{{ .ClusterProvider }}/clusters/{{ .ClusterCloud }}/labels
label-name: LabelSmartCityCloud

```

Use EMCO CLI to apply the resource yaml file with expected result:

```shell
# /opt/emco/bin/emcoctl/emcoctl --config remote.yaml apply -v values.yaml -f clusters_template.yaml

```

### SmartCity Projects and Creating Logical Clouds
Prepare resource yaml file - `projects_template.yaml` and apply it as mentioned below:
```yaml
#create project
version: emco/v2
resourceContext:
  anchor: projects
metadata:
  name: {{ .ProjectName }}

#create default logical cloud with admin permissions
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/logical-clouds
metadata:
  name: {{ .AdminCloud }}
spec:
  level: "0"

#add cluster reference to logical cloud
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/logical-clouds/{{ .AdminCloud }}/cluster-references
metadata:
  name: {{ .ClusterLogicEdge }}
spec:
  cluster-provider: {{ .ClusterProvider }}
  cluster-name: {{ .ClusterEdge }}
  loadbalancer-ip: "0.0.0.0"

#instantiate logical cloud
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/logical-clouds/{{ .AdminCloud }}/instantiate

```

```shell
# /opt/emco/bin/emcoctl/emcoctl --config remote.yaml apply -v values.yaml -f projects_template.yaml

```

### Creating SmartCity Composite Application Entry
Prepare resource yaml file - `composite_apps_template.yaml` and apply it as mentioned below:
```yaml
#creating smartcity composite app entry
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps
metadata:
  name: {{ .ComposteApp }}
spec:
  version: v1
```


### SmartCity Application Deployment
#### Preparing SmartCity Images, Helm Chart and Overriding Profiles
On the OpenNESS EMCO cluster. follow the guidance and commands as mentioned below:
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

Make sure the following images list is existing in the harbor registry project - `library`
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

Pack the helm chart files used by SmartCity `edge` application and put them under `/opt`.
   ```shell
   cd Smart-City-Sample/deployment/kubernetes/helm
   cp -r smtc smtc_edge
   rm smtc_edge/templates/cloud* -rf
   tar -zcvf smtc_edge.tar.gz smtc_edge
   mv smtc_edge.tar.gz /opt
   ```

Pack the helm chart files used by SmartCity `cloud` application and put them under `/opt`.
   ```shell
   cp -r smtc smtc_cloud
   rm smtc_cloud/templates/* -rf
   cp smtc/templates/*.tpl smtc_cloud/templates/
   cp smtc/templates/cloud* smtc_cloud/templates/
   tar -zcvf smtc_cloud.tar.gz smtc_cloud
   mv smtc_cloud.tar.gz /opt
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


#### Onboarding Helm Chart and Overriding Profiles

Prepare resource - `helmcharts_profiles_template.yaml` file and apply it as below:
```yaml
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/apps
metadata:
  name: smtc_edge
file: {{ .HelmEdgeApp }}

---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/apps
metadata:
  name: smtc_cloud
file: {{ .HelmCloudApp }}

#creating smtc composite profile entry
# version: emco/v2
# resourceContext:
#   anchor: projects/project_smtc/composite-apps/composite_smtc/v1/composite-profiles
# metadata :
#   name: smtc_composite-profile
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/composite-profiles
metadata:
  name: smtc_composite-profile

---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/composite-profiles/smtc_composite-profile/profiles
metadata:
  name: smtc_edge-profile
spec:
  app-name: {{ .AppEdge }}
file: {{ .ProfileEdgeApp }}

---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/composite-profiles/smtc_composite-profile/profiles
metadata:
  name: smtc_cloud-profile
spec:
  app-name: {{ .AppCloud }}
file: {{ .ProfileCloudApp }}

```

```shell
# /opt/emco/bin/emcoctl/emcoctl --config remote.yaml apply -v values.yaml -f projects_template.yaml

```

#### Setting Deployment Intent

Prepare resource - `intents_template.yaml` file and apply it as below:
```yaml
#create the deployment intent group
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/deployment-intent-groups
metadata:
  name: {{ .DeploymentIntent }}
  description: "smtc deployment intent group"
  userData1: test1
  userData2: test2
spec:
  profile: smtc_composite-profile
  version: r1
  logical-cloud: {{ .AdminCloud }}
  override-values: []

#create the intent in  deployment intent group
---
version: emco/v2
resourceContext:
  anchor: projects/{{.ProjectName}}/composite-apps/{{.ComposteApp}}/v1/deployment-intent-groups/{{.DeploymentIntent}}/intents
metadata:
  name: {{ .DeploymentIntent }}
  description: "smtc deployment intent"
  userData1: test1
  userData2: test2
spec:
  intent:
    genericPlacementIntent: smtc-placement-intent

# generic placement intent
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/deployment-intent-groups/{{ .DeploymentIntent }}/generic-placement-intents
metadata:
  name: smtc-placement-intent
  description: "smtc generic placement intent"
  userData1: test1
  userData2: test2

#add edge app placement intent
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/deployment-intent-groups/{{ .DeploymentIntent }}/generic-placement-intents/smtc-placement-intent/app-intents
metadata:
  name: smtcedge-placement-intent
  description: "smtc edge app placement intent"
  userData1: test1
  userData2: test2
spec:
  app-name: smtc_edge
  intent:
    allOf:
      - provider-name: {{ .ClusterProvider }}
        cluster-label-name: LabelSmartCityEdge

#add cloud app placement intent
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/deployment-intent-groups/{{ .DeploymentIntent }}/generic-placement-intents/smtc-placement-intent/app-intents
metadata:
  name: smtccloud-placement-intent
  description: "smtc cloud app placement intent"
  userData1: test1
  userData2: test2
spec:
  app-name: smtc_cloud
  intent:
    allOf:
      - provider-name: {{ .ClusterProvider }}
        cluster-label-name: LabelSmartCityCloud

```

```shell
# /opt/emco/bin/emcoctl/emcoctl --config remote.yaml apply -v values.yaml -f projects_template.yaml

```

#### Approving and Instantiating
Prepare resource - `instantiate_template.yaml` file and apply it as below:

```yaml
#Approve
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/deployment-intent-groups/{{ .DeploymentIntent }}/approve

#Instantiate
---
version: emco/v2
resourceContext:
  anchor: projects/{{ .ProjectName }}/composite-apps/{{ .ComposteApp }}/v1/deployment-intent-groups/{{ .DeploymentIntent }}/instantiate

```
