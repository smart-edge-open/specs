# OpenNESS Architecture

* [Overview](#overview)
  * [OpenNESS Controller Community Edition](#openness-controller-community-edition)
  * [OpenNESS Edge Node](#openness-edge-node)
    * [Edge Cloud Applications: Native](#edge-cloud-applications-native)
    * [Edge Cloud Applications: Local Breakout](#edge-cloud-applications-local-breakout)
  * [Multi Access Support](#multi-access-support)
* [On-Premise Edge cloud](#on-premise-edge-cloud)
* [Network Edge cloud](#network-edge-cloud)
* [OpenNESS API](#openness-api)
  * [Edge Application APIs](#edge-application-apis)
  * [Edge Application Authentication APIs](#edge-application-authentication-apis)
  * [Edge Lifecycle Management APIs](#edge-lifecycle-management-apis)
  * [Edge Virtualization Infrastructure APIs](#edge-virtualization-infrastructure-apis)
  * [EPC Configuration APIs for edge cloud](#epc-configuration-apis-for-edge-cloud)
* [Edge cloud applications](#edge-cloud-applications)
  * [Producer Application](#producer-application)
  * [Consumer Application](#consumer-application)
  * [Cloud Adapter Edge cloud Application](#cloud-adapter-edge-cloud-application)
* [OpenNESS OS environment](#openness-os-environment)
* [OpenNESS steps to get started](#openness-steps-to-get-started)


## Overview
OpenNESS is a opensource Edge cloud reference stack. It enables provides edge cloud reference deployments for Network edge and On-Premise Edge. OpenNESS is intended for Customers like Operators to conduct lab/field trials of edge cloud in Network edge and On-Premise Edge, ISVs or OSVs to develop edge cloud infrastructure solution that takes advantages of goodness of Intel Architecture and Application developers who intend to develop application for the edge, port the applications from public cloud to edge to take advantage of being closer to user. OpenNESS drives inspiration from ETSI MEC architecture addressing both Network edge and On-Premise Edge cloud deployments.

OpenNESS based edge cloud reference stack consists of one or more OpenNESS Edge node that hosts edge cloud applications or serve local breakout servers and an edge cloud OpenNESS controller (Community edition) that manages the OpenNESS edge cloud nodes. 

![OpenNESS Architecture overview](arch-images/openness_overview.png)

OpenNESS reference edge stack combines the NFV infrastructure optimizations for Virtual machine and Container cloud on Intel Architecture (CPU,Memory,IO and Acceleration) from various opensource projects with right amount of Edge cloud specific APIs and network abstraction on to provide a unique and one window development solution for edge cloud. 

### OpenNESS Controller Community Edition
OpenNESS Controller Community edition consists of set of microservices that implement the following functionality to enable edge cloud node and application management. Community edition implements the right set of functions needed for a reference Edge cloud controller.
- Web UI front end: HTML5 based web frontend for managing edge cloud.
- User account management: Create administrator user for the edge cloud management. 
- Edge cloud application image repository: Provide edge cloud application image (VM/Container image) upload capability to the controller. 
- Configure CUPS EPC: Using reference REST API to configure 4G EPC control plane 
- Edge application life cycle management: Support set of APIs that enable
  - Enrolling OpenNESS edge node
  - Configure the interfaces and OpenNESS edge node microservices 
  - Configure the Local break out interfaces and policy 
  - Deploy edge cloud applications from the image repository 
  - Configure the Edge cloud application specific Traffic policy 
  - Configure the Edge cloud application specific DNS policy 
- Edge virtualization infrastructure management: Use the existing industry standard NFV infrastructure API to stacks like Kubernetes or Libvert or Docker to start and stop edge cloud applications on the Edge node
- Telemetry: Get basic edge cloud microservices telemetry from connected Edge nodes. 

Most of the microservices on controller are written in Go lang. OpenNESS Controller Community Edition addresses the essential functionalities of Multi-access edge orchestrator and MEC Platform manger as defined in the ETSI MEC Multi-access Edge Computing (MEC): Framework and Reference Architecture. 

### OpenNESS Edge Node
OpenNESS Edge Node consists of set of microservices that implement the following functionality to enable execution of edge cloud applications natively on the edge node or forward required user traffic to application running on connected local breakout. 
- Edge Application Enrolling: During the first boot connect to the designated OpenNESS Controller Community Edition and request for enrolling.This functionality is implemented in the ELA (Edge Lifecycle Agent) microservice and is implemented in Go lang. As part of enrolling Edge node is provided TLS based certificate. Which is used for further API communication. 

![OpenNESS Edge Node Autentication](arch-images/openness_nodeauth.png)

- Edge node interface configuration: During the first boot sent the map of the existing Network interfaces to the Controller to be configured as Upstream, Downstream or local breakout. This functionality is implemented in the ELA microservice. 
- DNS service: Support DNS resolution and forwarding services for the application deployed on the edge cloud. DNS server is implemented based on Go DNS library. 
- Edge Node Virtualization infrastructure: Receive commands from the controller/NFV infrastructure mangers to start and stop Applications. This functionality is implemented in the EVA (Edge virtualization Agent) microservice and is implemented in Go lang. 
- Edge application traffic policy: Interface to set traffic policy for application deployed on the edge node. This functionality is implemented in the EDA (Edge Dataplane Agent) microservice and is implemented in Go lang. 
- Dataplane: Provide application specific traffic steering towards the Edge cloud application running on the edge node or on connected Local break out port. Note Datapalne NTS (Network Transport Service) is running on every Edge node instance. It is implemented in C lang using DPDK for high performance IO.
  - Provide Reference ACL based Application specific packet tuple filtering 
  - Provide reference GTPU base packet learning for S1 deployment 
  - Provide reference Simultaneous IP and S1 deployment 
  - Provide Reference API for REST/grpc to C API 
  - Future enhancement of UE based traffic steering for authentication (not there now)
  - Reference implementation which does not depend on EPC implementation 
  - Reference Packet forwarding decision independent of IO
  - Implement KNI based interface to Edge applications running as Containers/POD 
  - Implement DPDK vHost user based interface to Edge applications running as Virtual Machine 
  - Implement Scatter and Gather in upstream and downstream 
- Application Authentication: Ability to authenticate Edge cloud application deployed from Controller so that application can avail/call Edge Application APIs. Only application that intends to call the Edge Application APIs need to be authenticated. TLS certificate based Authentication is implemented. 

![OpenNESS Application Authentication](arch-images/openness_appauth.png)

- Edge Application API support: Provide API endpoint for edge applications to avail edge services. This functionality is implemented in the EAA (Edge Application Agent) microservice and is implemented in Go lang.APIs are classified into:
  - Edge Service Activation/Deactivation
  - Edge Service Discovery 
  - Edge Service Subscription/Unsubscription 
  - Edge Service Notification update (using web socket)
  - Edge Service data update 
  - Edge Service list subscription 
- Edge Node telemetry: Utilizing the rsyslog all the OpenNESS microservices send the telemetry update which includes the logging and packet forwarding statistics data from dataplane. 

Resource usage: OpenNESS Edge node run all the non-critical/non-realtime microservices on the OS core, Dataplane NTS and DPDK PMD thread would need dedicated core/thread for high performance. Since DPDK library is used for the dataplane implementation 1G/2M hugepages support is required on the host. 

#### Edge Cloud Applications: Native
OpenNESS supports execution of application on the Edge node as a VM/Container instance. This is typically the case when customers are looking for high density edge cloud platforms with expectation of resource pooling across Edge Applications and services. OpenNESS supports both native edge cloud apps and IOT Gateways to run as edge cloud applications or services co-existing on the same platform and sharing resources. 

#### Edge Cloud Applications: Local Breakout
OpenNESS supports steering traffic to the applications that are already running on the customer IT infrastructure. Such applications are referred to as Applications on LBP (Local Breakout Port). 

![OpenNESS Native and LBP Applications](arch-images/openness_lbp.png)

### Multi Access Support
OpenNESS Supports edge cloud deployment on LTE S1, SGi, LTE CUPS and IP. These different type of user traffic can be simultaneously deployed on the OpenNESS solution because of the Network abstraction built into the Dataplane NTS and Traffic policy APIs. The network abstraction also extends to Edge application as they need not be aware if they are deployed on the LTE/IP/Wireleine network. All the Edge application receive pure IP traffic. OpenNESS supports IPv4 Traffic. 

![OpenNESS Multi-access support](arch-images/openness_multiaccess.png)

## On-Premise Edge cloud
OpenNESS solution support On-Premise Edge cloud deployment. This is deployment is applicable in a Enterprise Edge cloud deployment scenario. Enterprise customers typically have pre-existing IT infrastructure that hosts all the enterprise application and is managed by a existing NFV infrastructure. In such deployments OpenNESS Controller Community edition provides a mechanism to directly manage the virtualization infrastructure (using Libvirt/Docker containers) on the Edge node instead of creating a requirement of Kubernetes or Openstack. This type of deployment is also typical when Edge cloud solution vendor wants to host the Edge cloud controller in the cloud and have multiple Edge Cloud nodes in individual customer premise spanning across different enterprises. 

OpenNESS support both Native and Local break out application for this deployment model.

![On-Premise Edge cloud](arch-images/openness_onprem.png)

## Network Edge cloud
OpenNESS solution support Network Edge cloud deployment. This is deployment is applicable in a telco-operator deployment scenario where the operator controls the entire RAN, Edge and Core network infrastructure. In such deployments OpenNESS Controller Community edition provides a mechanism to call the industry standard API to the NFVi manager like Kubernetes to manage the applications on the the Edge node. The Kubernetes master is assumed to be part of the exisitng infrastrucre and Edge node is added to the Kubernetes cluster. 

OpenNESS support both Native and Local break out application for this deployment model.

![Network Edge cloud](arch-images/openness_onprem.png)

## OpenNESS API

OpenNESS solution supports following APIs:
- Edge Application APIs
- Edge Application Authentication APIs
- Edge Lifecycle Management APIs
- Edge Virtualization Infrastructure APIs
- EPC Configuration APIs for edge cloud 

### Edge Application APIs
Edge Application APIs are important APIs for Edge application developers. There are two types of use cases here. 
1. Porting of existing pubic cloud application to the edge cloud based on OpenNESS: This is the scenario when customers just want to run the existing apps in public cloud on OpenNESS edge without calling any APIs or changing code. In this case the only requirement is Application image (VM/Container) should be uploaded to the controller and provisioned on the Edge node using OpenNESS Controller. In this case the Application can not call any EAA APIs and consume services on the edge cloud. It just services the end-user traffic. 
2. Native Edge cloud Application calling EAA APIs: This is the scenario where customer want to develop Edge cloud applications that take advantages of the Edge cloud services resulting in more tactile application that responds to the changing user, network or resource scenarios. 

OpenNESS support deployment both types of applications. EAA APIs are implemented as HTTPS REST. Edge Application APIs is implemented by the EAA. The Edge Application Agent is a service that runs on the edge node and operates as a discovery service and basic message bus between applications via pubsub. The connectivity and discoverability of applications by one another is governed by an entitlement system and is controlled by policies set with the OpenNESS Controller. The entitlement system is still in its infancy, however, and currently allows all applications on the executing edge node to discover one another as well as publish and subscribe to all notifications. The sequence diagram below show the supported APIs for the application 

More details about the APIs can be found here [Edge Application APIs](https://www.openness.org/resources) 

![Edge Application APIs](arch-images/openness_eaa.png)

### Edge Application Authentication APIs
OpenNESS supports authentication of Edge cloud apps that intend to call EAA APIs. Applications are authenticated by Edge node microservice issuing the requesting application a valid TLS certificate after validating the identity of the application. It is to be noted that in OpenNESS solution Application can only be provisioned by the OpenNESS controller. There are two catagories of Applications as discussed above and here is the implication for the authentication. 
1. Existing pubic cloud application ported to OpenNESS: This is the scenario when customers just want to run the existing apps in public cloud on OpenNESS edge without calling any APIs or changing code. In this case the Application can not call any EAA APIs and consume services on the edge cloud. It just services the end-user traffic. So the Application will not call authentication API to acquire a TLS certificate. 
2. Native Edge cloud Application calling EAA APIs: This is the scenario where customer want to develop Edge cloud applications that take advantages of the Edge cloud services resulting in more tactile application that responds to the changing user, network or resource scenarios. Suck Application should first call authentication APIs and acquire TLS certificate. Authentication of Applications that provide services to other Applications on the edge cloud (Producer Apps) is  mandatory.

For applications executing on the Local breakout the Authentication is not applicable since its not provisioned by the OpenNESS controller. 

Authentication APIs are implemented as HTTP REST APIs. 

More details about the APIs can be found here [Application Authentication APIs](https://www.openness.org/resources) 

### Edge Lifecycle Management APIs
ELA APIs are implemented by the ELA microservice on the edge node. The ELA runs on the Edge node and operates as a deployment and lifecycle service for applications and VNFs (Virtual Network Functions). It also provides network interface, network zone, and application/interface policy services.

ELA APIs are implemented over gRPC. For the purpose of visualization they are converted to json and can be found here [Edge Lifecycle Management APIs](https://www.openness.org/resources) 


### Edge Virtualization Infrastructure APIs
EVA APIs are implemented by the EVA microservice on the edge node. The EVA operates as a mediator between the infrastructure that the apps run on and the other edge components.

The EVA abstracts how applications were deployed, whether with native calls to the edge node or through an external orchestrator, such as Kubernetes for containerized apps. In order to achieve this, there is also a complementary EVA service running on the Controller that the edge node EVA service can call when the edge node was configured as a node/slave of an external orchestrator.

As an example, an RPC to list the running containers on the node can take two paths:

1. If the node is unorchestrated, then it can call the Docker daemon to get its response data.
2. If the node is orchestrated, then it can call the Controller EVA service which in turn will query the orchestrator for a list of containers on the requesting edge node.

EVA APIs are implemented over gRPC. For the purpose of visualization they are converted to json and can be found here [Edge Virtualization Infrastructure APIs](https://www.openness.org/resources) 

### EPC Configuration APIs for edge cloud 
As part of the OpenNESS reference edge stack the OpenNESS controller community edition is used for configuring the traffic policy for CUPS EPC to steer traffic towards the edge cloud, This API is based on HTTP REST. Since 3GPP or ETSI MEC does not provide reference for these APIs various implementation of this Edge Controller to CUPS EPC might exist. OpenNESS has tried to take the approach of minimal changes to 3GPP CUPS EPC to achieve the edge cloud deployment. OpenNESS and HTTP REST APIs to the EPC CUPS is a reference implementation so customers using OpenNESS can integrate their own HTTP REST APIs to the EPC CUPS into the OpenNESS Controller. Special care has been taken to make these components Modular microservices. The diagram below show the LTE environment that was used for testing OpenNESS edge cloud end-to-end. 

![LTE end-to-end setup](arch-images/openness_epc.png)

OpenNESS Reference solution provides framework for managing multiple Edge nodes through centralized OpenNESS controller. In case of co-located EPC userplane and edge node deployment models, LTE user plane elements can be controlled through VIM infrastructure provided by OpenNESS reference solution. OpenNESS suggests HTTP based REST APIs to configure and manage the LTE userplane components through the centralized Edge controller. LTE network Operator’s Operation and Maintenance (OAM) elements can consume these APIs to open an interface for the Edge controllers to communicate for the management of userplane nodes launched at the Edge nodes. It is being implicitly understood that OAM agent communication with EPC core components is always an implementation dependent from vendor to vendor in different operator’s environments. 

![LTE EPC Configuration](arch-images/openness_epcconfig.png)

More details about the APIs can be found here [Edge Application APIs](https://www.openness.org/resources). 

Whitepaper describing the details of the CUPS support in EPC can be found here [Edge Application APIs](https://www.openness.org/resources).

## Edge cloud applications
OpenNESS Applications can onboarded and provisioned on the edge node only through OpenNESS Controller. The first step in Onboarding involves uploading the application image to the controller through the web interface. Both VM and Container images are supported. 

OpenNESS application can be categorised in different ways depending on the scenarios. 

- Depending on the OpenNESS APIs support 
  - Applications calling EAA APIs for providing or consuming service on the edge cloud along with servicing end-users traffic 
  - Applications not availing any services on the edge cloud just servicing end-user traffic 

- Depending on the Application Execution platform 
  - Application running natively on Edge node in a VM/Container provisioned by the OpenNESS controller 
  - Application running on Local breakout not provisioned by the OpenNESS controller 

- Depending on the servicing the end-user traffic
  - Producer Application
  - Consumer Application 

### Producer Application
OpenNESS Producer application are edge cloud application that provide services to other applications running on the edge cloud platform. Producer applications do not serve end users traffic directly. They are sometime also referred to as Edge services. Here are some of the characteristics of a producer app.
- It is mandatory for all producer apps to authenticate and acquire TLS 
- All producer apps need to activate if the service provided by them needs to be discoverable by other edge applications 
- A producer application can have one or more fields for which it will provide notification update 

### Consumer Application 
OpenNESS Consumer application are edge cloud application that serve end users traffic directly. Consumer applications might or might not subscribe to the services from other producer applications on the edge node. Here are some of the characteristics of a consumer app.
- It is not mandatory for consumer apps to authenticate if they don't wish to call EAA APIs.  
- A consumer application can subscribe to any number of services from producer apps. Future extension can implement entitlements to consumer apps to create access control lists. 
- Producer to Consumer update will use web socket for notification. If there is further data to be shared between producer and consumer other NFVi components like OVS/VPP/NIC-VF can be used for data transfer. 

As part of the OpenNESS reference application there is a producer and consumer application. 

![OpenNESS Reference Application](arch-images/openness_apps.png)

The consumer application is based on OpenVINO [OpenVINO] (https://software.intel.com/en-us/openvino-toolkit)

- OpenVINO consumer app executes inference on input video stream
- OpenVINO producer app generates notifications to the consumer app for changing the inference model
- Video input stream is captured from a webcam installed on an Embedded Linux client device
- The annotated video is streamed out of the OpenNESS edge node back to the client device for further data analysis

## OpenNESS OS environment
OpenNESS Controller and Edge Node are developed and tested on CentOS 7.6. 

## OpenNESS steps to get started
1. Go through the overview of the OpenNESS solution 
2. Acquire the supported hardware components 
3. Clone the Controller, Edge Node, Application and Common github repos
4. Follow the README to build and set up Edge node 
5. Follow the README to build and set up Controller
6. Follow the README to build the reference Application 
7. Connect required Upstream, Downstream and Local breakout devices
8. Start the Controller and create Administrator user 
9. Start the Edge node and complete enrolment and Interface configuration 
10. Upload the Reference application image to the controller 
11. Provision the reference applications (Producer and Consumer) from the controller to the Edge node
12. Configure the traffic and DNS policy for the reference application
13. Check for traffic being served on the edge cloud - monitor the telemetry for configured policy and packets in/out of the dataplane and application
