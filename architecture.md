# OpenNESS Architecture

* [Overview](#overview)
  * [OpenNESS Controller Community Edition](#openness-controller-community-edition)
  * [OpenNESS Edge Node](#openness-edge-node)
    * [Edge Cloud Applications - Native](#edge-cloud-applications-native)
    * [Edge Cloud Applications - Local Breakout](#edge-cloud-applications-local-breakout)
  * [Multi Access Support](#multi-access-support)
* [On-Premise Edge cloud](#on-premise-edge-cloud)
* [Network Edge cloud](#network-edge-cloud)
* [OpenNESS API](#api)
  * [Edge Application APIs](#eaa)
  * [Edge Application Authentication APIs](#auth)
  * [Edge Lifecycle Management APIs](#ela)
  * [Edge Virtualization Infrastructure APIs](#eva)
  * [EPC Configuration APIs for edge cloud](#epc)
* [Edge cloud applications](#edgeapps)
  * [Producer Application](#prod)
  * [Consumer Application](#cons)
  * [Cloud Adapter Edge cloud Application](#cons)
* [OpenNESS OS environment](#testdrive)
* [OpenNESS steps to get started](#testdrive)


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

####Edge Cloud Applications - Native
OpenNESS supports execution of application on the Edge node as a VM/Container instance. This is typically the case when customers are looking for high density edge cloud platforms with expectation of resource pooling across Edge Applications and services. OpenNESS supports both native edge cloud apps and IOT Gateways to run as edge cloud applications or services co-existing on the same platform and sharing resources. 

####Edge Cloud Applications - Local Breakout
OpenNESS supports steering traffic to the applications that are already running on the customer IT infrastructure. Such applications are referred to as Applications on LBP (Local Breakout Port). 

![OpenNESS Native and LBP Applications](arch-images/openness_lbp.png)

  






