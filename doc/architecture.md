```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```
<!-- omit in toc -->
# OpenNESS Architecture and Solution overview
- [OpenNESS Overview](#openness-overview)
- [OpenNESS Distributions](#openness-distributions)
- [Deployment based on Location](#deployment-based-on-location)
- [Architecture overview](#architecture-overview)
  - [Logical](#logical)
  - [Architecture](#architecture)
- [Microservices, Kubernetes extensions and Enhancements](#microservices-kubernetes-extensions-and-enhancements)
    - [Platform Pods - Enhanced Platform Awareness](#platform-pods---enhanced-platform-awareness)
    - [System Pods](#system-pods)
    - [Container Networking](#container-networking)
    - [Telemetry](#telemetry)
  - [Software Development Kits](#software-development-kits)
- [Edge Services and Network Functions](#edge-services-and-network-functions)
- [OpenNESS Experience Kit](#openness-experience-kit)
  - [Minimal flavor](#minimal-flavor)
  - [RAN node flavor](#ran-node-flavor)
  - [Application node flavor](#application-node-flavor)
  - [Microsoft Azure OpenNESS](#microsoft-azure-openness)
  - [Converged Edge Reference Architecture (CERA) Flavor](#converged-edge-reference-architecture-cera-flavor)
- [Other References](#other-references)
- [List of Abbreviations](#list-of-abbreviations)

## OpenNESS Overview 
![](arch-images/modular.png)

OpenNESS is a software toolkit that enables highly optimized and performant edge platforms to on-board and manage applications and network functions with cloud-like agility. OpenNESS is a modular, microservice oriented architecture which can be consumed by a customer as whole solution or in parts. 

OpenNESS is intended for the following types of users:

![](arch-images/customers.png)

OpenNESS eases edge platform development and deployment:
- <b>Abstracts Network Complexity</b>: Choose across many data planes, container network interfaces and access technologies
- <b>Cloud Native Capabilities</b>: Support for Cloud native ingredients for resource orchestration, telemetry and service mesh
- <b>Hardware/Software Optimizations for Best Performance and ROI</b>: Dynamic discovery and optimal placement of apps/services. Expose underlying edge hardware and enables control/management of hardware accelerators

OpenNESS provides three easy steps to get to deployment:

![](arch-images/start.png)


## OpenNESS Distributions
OpenNESS is released as two distributions:
1. <b>OpenNESS </b>: A full Open Source distribution of OpenNESS
2. <b>Intel Distribution of OpenNESS </b>: A licensed distribution from Intel that includes all the features in OpenNESS along with additional microservices, Kubernetes extensions, enhancements and optimizations for Intel Architecture. 

The Intel Distribution of OpenNESS requires a secure login to the OpenNESS Github. To gain access to the Intel Distribution of OpenNESS, please contact your Intel support representative. 

## Deployment based on Location
OpenNESS supports deployment of edge nodes that host Applications and Network functions at following locations. 

![](arch-images/locations.png)

<b>On-Premises </b> : The Edge Computing resources are located in the customer premises (e.g. Industrial, Retail, Healthcare) and managed by the Communication Service Provider (CoSP) or by the Enterprise customer as a Private network (Private 4G/5G, uCPE/SDWAN). These deployments retain the sensitive data generated on-premises. 

<b>Network Edge </b>: The Edge compute resources are typically spread across the CoSP network (e.g. Access Edge - Cell site, Near Edge - Aggregation Sites and Central Office - Regional Data Center) and managed by the CoSP. Adoption of 5G has paved the way for cloud native COTS deployments that host Network Functions and Applications.  

Most of these deployments are fully virtualized and moving towards cloud native platforms for agility and elasticity. 

## Architecture overview 

Before we look at the detailed Architecture overview of OpenNESS, let's look at a logical overview of how the OpenNESS microservices are laid out. 

### Logical 
The OpenNESS solution is built on top of Kubernetes which is a production grade container orchestration environment. A typical OpenNESS based deployment consists of an OpenNESS Kubernetes Master Node and OpenNESS Edge node.

![](arch-images/openness_overview.png)

The OpenNESS Kubernetes Master node consists of microservices and Kubernetes extensions, enhancements/optimizations that provide functionality to configure one or more OpenNESS Edge nodes and the application services that run on those nodes. E.g. Application Pod Placement, Configuration of Core Network, etc. 

The OpenNESS Edge node consists of microservices, and Kubernetes extensions, enhancements/optimizations that are needed for Edge Application and Network function deployment. It also consists of APIs that are typically used for discovery of Application services. 

Another key ingredient is the 4G/5G Core network functions that enable Private or Public edge. OpenNESS uses reference network functions to validate this end-to-end edge deployment. This is key to understating and measuring the Edge Key Performance Indicators (KPI).  

### Architecture 

![](arch-images/openness-arc.png)

The OpenNESS Kubernetes Master node consists of vanilla Kubernetes Master node components along with OpenNESS microservices that interact with the Kubernetes Master node using Kubernetes defined APIs. The following are the high level functionalities of the OpenNESS Kubernetes Master microservice:
- Configuration of the hardware platform that hosts applications and network functions 
- Configuration of the Network functions (4G, 5G, Wifi)
- Detection of various hardware and software capabilities of the edge cluster and using for scheduling applications and network functions 
- Setup of network and DNS policies for applications and network functions 
- Enable collection of hardware infrastructure, software and application monitoring 
- Expose edge cluster capabilities northbound to a controller

The OpenNESS Edge node consists of vanilla Kubernetes node components along with OpenNESS microservices that interact with Kubernetes node using Kubernetes defined APIs. The following are the high level functionalities of the OpenNESS Kubernetes node microservice:
- Container runtime (docker), Virtualization infrastructure (libvirt, OVS, etc.) support 
- Platform Pods consisting of services that enables configuration of a node for a particular deployment, device plugins enabling hardware resources allocation to an application pod and detection of interfaces and reporting to the Master node.
- System Pods consisting of services that enable reporting the hardware and software features of each node to the master, resource isolation service for pods and providing a DNS service to the cluster 
- Telemetry consisting of services that enable hardware, operating system, infrastructure and application level telemetry for the edge node 
- Support for real-time kernel for low latency applications and network functions like 4G and 5G base station and non-real time kernel 
 
The OpenNESS Network functions are the key 4G and 5G functions that enable edge cloud deployment. OpenNESS provides these key reference network functions and the configuration agent in the Intel Distribution of OpenNESS.  

The OpenNESS solution validates functionality and performance of key Software Development Kits used for applications and network functions at the edge. This spans across edge applications that use Media SDK, AI/ML SDK, Math SDKs etc. and Network functions that use DPDK, Intel Performance Primitives, Math SDK, OpenMP, OpenCL, etc.

## Microservices, Kubernetes extensions and Enhancements  

OpenNESS Microservices and Enhancements can be understood under the following sub-classification. All OpenNESS microservices are provided as Helm charts. 

#### Platform Pods - Enhanced Platform Awareness 
Enhanced Platform Awareness (EPA) represents a methodology and a related set of enhancements across multiple layers of the orchestration stack, targeting intelligent platform capabilities, configuration & capacity consumption. EPA features include Huge Pages support, NUMA topology awareness, CPU pinning, integration with OVS-DPDK, support for I/O Pass-through via SR-IOV, HDDL support, FPGA resource allocation support and many others. 

So why should one consider using EPA? To achieve the optimal performance and efficiency characteristics, EPA extensions to Data Models, Orchestrators and VIMs facilitates the automation of an advanced selection of capabilities and tuning parameters during the deployment of NFV solutions. EPA also enables service providers to offer differentiating and/or revenue generating services that require leveraging of specific hardware features.

OpenNESS provides a one-stop solution to integrate key EPA features that are critical for Applications (CDN, AI Inference, Transcoding, Gaming etc.) and CNFs (RAN DU, CU and Core) to work optimally for edge deployments. 
du
The following are the EPA microservices supported by OpenNESS. They typically span across System and Platform pods discussed above. 
- <b>Intel High Density Deep Learning (HDDL)</b>: Software that enables OpenVINO based AI apps to run on Intel VPUs. It consists of following components:
  - HDDL device plug-in for K8s
  - HDDL service for scheduling jobs on VPU
- <b>Visual Compute Acceleration - Analytics (VCAC-A)</b>: Software that enables OpenVINO based AI apps and media apps to run on Intel Visual Compute cards. It is composed of following components: 
  - VPU device plug-in for K8s
  - HDDL service for scheduling jobs on VPU
  - GPU device plugin for K8s
- <b>FPGA/eASIC/NIC</b>: Software that enables AI inferencing for applications, High performance low latency packet pre-processing on the Network Cards, Offload for Network functions like eNB/gNB offloading Forward Error Correction (FEC). It consists of: 
  - FPGA device plugin for inferencing
  - SR-IOV device plugin for FPGA/eASIC
  - Dynamic Device Profile for Network Interface Cards (NIC)
- <b>Intel Resource Management Daemon (RMD)</b>: uses Intel RDT technology to implement Cache allocation and Memory Bandwidth allocation to the application pods. This is a key technology for achieving resource isolation and achieving determinism on a cloud native platform. 
- <b>Node Feature Discovery (NFD)</b>: Software that enables node feature discovery for Kubernetes. It detects hardware features available on each node in a Kubernetes cluster, and advertises those features using node labels. 
- <b>Topology Manager </b> This component allows users to align their CPU and peripheral device allocations by NUMA node.
- <b>Kubevirt </b> Support for running legacy applications in VM mode and allocation of SR-IOV ethernet interfaces to VMs. 

#### System Pods 
  
- <b>Edge Interface Service</b>: Interface service is an application running in a Kubernetes pod on each worker node of the OpenNESS Kubernetes cluster. It allows attachment of additional network interfaces of the worker host to provide an OVS bridge, enabling external traffic scenarios for applications deployed in Kubernetes pods. Services on each worker can be controlled from the master node using kubectl plugin. 
The Interface service can attach both kernel and userspace (DPDK) network interfaces to OVS bridges of a suitable type.
- <b>BIOS/Firmware Configuration service </b>: Uses the  Intel syscfg tool to build a pod that is scheduled by K8s as a job that configures the BIOS/FW with the given specification
- <b>DNS service</b>: Supports DNS resolution and forwarding services for the application deployed on the edge compute. DNS server is implemented based on the Go DNS library. DNS service supports resolving DNS requests from User Equipment (UE) and Applications on the edge cloud.
- <b>Video Transcode Service</b>: An application microservice that exposes a REST API for transcoding on CPU or GPU    
- <b>Edge Application Agent</b>: Edge Application APIs are implemented by the EAA. Edge Application APIs are important APIs for Edge application developers. EAA APIs provide APIs for service discovery, subscription and update notification. 

#### Container Networking 

OpenNESS provide flexible and high performance set of Container networking using Container Networking Interface (CNIs). Some of the high-performance opensource CNIs are also supported. Container Networking support in OpenNESS is intended to address the following: 
- Highly-coupled container-to-container communications.
- Pod-to-Pod communications on the same node and across the nodes 

The following are the CNIs supported in OpenNESS:
- <b>SRIOV CNI</b>: CNI that works with the SR-IOV device plugin for VF allocation for a container. 
- <b>User Space CNI</b>: CNI designed to implement userspace networking (as opposed to kernel space networking). 
- <b>Bond CNI</b>: Bonding CNI provides a method for aggregating multiple network interfaces into a single logical "bonded" interface.
- <b>Multus CNI</b>: CNI that enables attaching multiple network interfaces to pods in Kubernetes.
- <b>Weave CNI</b>: Weave Net creates a virtual network that connects Docker containers across multiple hosts and enables their automatic discovery.  
- <b>Kube-OVN CNI</b>: Kube-OVN integrates the OVN-based Network Virtualization with Kubernetes. It offers an advanced Container Network Fabric for Enterprises with the most functions and the easiest operation.
- <b>Calico CNI/eBPF</b>: CNI support applications with higher performance using eBPF and IPv4 IPv6 dual-stack
 
####  Telemetry 
Edge builders need a comprehensive Telemetry framework that combines Application Telemetry, Hardware Telemetry, and Events to create a heat-map across the edge cluster and enables the Orchestrator to make scheduling decisions.
Industry leading cloud native Telemetry and Monitoring frameworks are supported on OpenNESS:
- <b>Prometheus/Grafana</b>: Cloud native industry standard Framework that provides monitoring system and time series database. 
- <b>Telegraf </b> Cloud native industry standard agent for collecting, processing, aggregating, and writing metrics.
- <b>Open Telemetry </b>: Open Consensus, Open Tracing  - CNCF project that provides the libraries, agents, and other components that you need to capture telemetry from your services so that you can better observe, manage, and debug them.

Hardware Telemetry support 
- CPU: Supported metrics - cpu, cpufreq, load, hugepages, intel_pmu, intel_rdt, ipmi 
- Dataplane: Supported metrics - ovs_stats and ovs_pmd_stats
- Accelerator: Supported Metrics from - FPGA–PAC-N3000, VCAC-A, HDDL-R, eASIC, GPU and NIC 

OpenNESS also supports a reference application of using telemetry to take actions using Kubernetes APIs. This reference is provided to the Telemetry Aware Scheduler project. 

### Software Development Kits 
OpenNESS supports leading SDKs for edge services (applications) and network function development. As part of the development of OpenNESS, applications developed using these SDKs are optimized to provide best performance using the SDK. This is to ensure that when customers develop applications using these SDK they can achieve the optimal performance. 
- <b> OpenVINO SDK </b>: The OpenVINO™ toolkit is composed of a variety of Intel tools that work together to provide a complete computer vision pipeline solution that is optimized on Intel® architecture. This article will focus on the Intel® Media SDK component of the toolkit. The Intel Media SDK is a high level API for specific video processing operations: decode, process, and encode. It supports H.265, H.264, MPEG-2, and more codecs. Video processing can be used to resize, scale, de-interlace, color conversion, de-noise, sharpen, and more. The Intel Media SDK works in the background to leverage hardware acceleration on Intel® architecture with optimized software fallback for each individual hardware platform. Hence, developers do not need to change the code from platform to platform, and can focus more on the application itself rather than on hardware optimization.
- <b> Intel Media SDK </b>: SDK used for developing video applications with state-of-the-art libraries, tools, and samples. They are all accessible via a single API that enables hardware acceleration for fast video transcoding, image processing, and media workflows.The two main paths for application developers to access GPU media processing capabilities are
  - Intel® Media SDK
  - Intel® SDK for OpenCL™ applications
- <b> DPDK </b>: DPDK is the Data Plane Development Kit that consists of libraries to accelerate packet processing workloads running on a wide variety of CPU architectures.
- <b> Intel IPP </b>: Intel® Integrated Performance Primitives (Intel® IPP) is an extensive library of ready-to-use, domain-specific functions that are highly optimized for diverse Intel® architectures.
- <b>Intel MKL </b>: Intel® Math Kernel Library (Intel® MKL) optimizes code with minimal effort for future generations of Intel® processors. It is compatible with your choice of compilers, languages, operating systems, and linking and threading models.

## Edge Services and Network Functions  

OpenNESS supports a rich set of reference and commercial real world edge services (applications) and network functions. These applications and network functions are a vehicle for validating functionality and performance KPIs for Edge. 

Here is the sub set of edge applications supported: 
- <b>Smart city App</b>: The end-to-end sample app that implements aspects of smart city sensing, analytics and management, utilizing CPU or VCA.
- <b>CDN Transcode and Content Delivery App</b>: The CDN Transcode sample app is an Open Visual Cloud software stack with all the required open source ingredients well integrated to provide an out-of-the-box CDN media transcode service, including live streaming and video on demand. It also provides a Docker-based media delivery software development environment upon which a developer can easily build their specific applications.
- <b>Edge Insights</b>: Edge Insights application is designed to enable secure ingestion, processing, storage and management of data, and near real-time (~10mS) event-driven control, across a diverse set of industrial protocols. 

Here is the sub set of reference Network Functions supported:  
- <b>gNodeB or eNodeB</b>: 5G or 4G Base station implementation on Intel architecture based on Intel FlexRAN.

## OpenNESS Experience Kit 

OpenNESS Experience Kit is an Ansible playbook which acts a single interface for users to deploy OpenNESS. The Experience Kit organizes all of the above microservices, Kubernetes extensions, enhancements and optimizations under easy to deploy node types called <b>Flavors</b>, implemented as Ansible Roles.

For example, a user deploying a network edge at cell site can choose the RAN flavor to deploy a node with all the microservices, Kubernetes extensions, enhancements and optimizations required for a RAN node. 

### Minimal flavor  
This flavor supports the installation of the minimal set of components from OpenNESS. Typically used as a starting point for creating custom node. 

### RAN node flavor 
RAN node here typically refers to RAN DU and CU 4G/5G nodes deployed on the edge or far edge. In some cases DU may be integrated in to the radio. The example RAN deployment flavor uses FlexRAN as a reference DU. 

![RAN node flavor](arch-images/openness-flexran.png)

### Application node flavor 
Application nodes here typically refer to nodes running edge applications and services. The Applications can be Smart City, CDN, AR/VR, Cloud Gaming, etc. In the example flavor below, the Smart City application pipeline is used.  

Under the Application node the following Flavors are supported: 
- Media Analytics Flavor
- Media Analytics Flavor with VCAC-C
- CDN Transcode 
- CDN Content Delivery 

![Application node flavor](arch-images/openness-ovc.png)

### Microsoft Azure OpenNESS
This flavor supports the installation of an OpenNESS Kubernetes cluster on a Microsoft Azure VM. This is typically used by a customer who requires the same Kubernetes cluster service on multiple clouds.

### Converged Edge Reference Architecture (CERA) Flavor 

The Converged Edge Reference Architecture (CERA) from Intel provides foundational recipes that converge IT, OT & NT workloads on various on-premise & network edge platforms. 

In future OpenNESS releases, various CERA flavor will be available. Each of these recipes would include combinations of other OpenNESS flavor (e.g. RAN + UPF + Apps)

In future OpenNESS releases, various CERA flavor may be available. 

## Other References
- [3GPP_23401]	3rd Generation Partnership Project; Technical Specification Group Services and System Aspects; General Packet Radio Service (GPRS) enhancements for Evolved Universal Terrestrial Radio Access Network  (E-UTRAN) access.     
- [3GPP_23214]	3rd Generation Partnership Project; Technical Specification Group Services and System Aspects; Architecture enhancements for control and user plane separation of EPC nodes; Stage 2.
- [ETSI_MEC_003] ETSI GS MEC 003 V2.1.1 Multi-access Edge Computing (MEC): Framework and Reference Architecture     
- [ETSI_23501] 5G; System Architecture for the 5G System (3GPP TS 23.501 version 15.2.0 Release 15), ETSI TS 123 501.
- [OpenVINO toolkit](https://software.intel.com/en-us/openvino-toolkit).
- [Intel® Math Kernel Library](https://software.intel.com/content/www/us/en/develop/tools/math-kernel-library.html)
- [Intel® Media SDK](https://software.intel.com/content/www/us/en/develop/tools/media-sdk.html)
- [DPDK](https://www.dpdk.org/)
- [FlexRAN](https://github.com/intel/FlexRAN)
- [Enabling 5G Wireless Acceleration in FlexRAN: for the Intel® FPGA Programmable Acceleration Card N3000](https://www.intel.com/content/www/us/en/programmable/documentation/ocl1575542673666.html)

## List of Abbreviations
- 3GPP: Third Generation Partnership Project
- CUPS: Control and User Plane Separation of EPC Nodes
- AF: Application Function
- API: Application Programming Interface
- APN: Access Point Name
- EPC: Evolved Packet Core
- ETSI: European Telecommunications Standards Institute
- FQDN: Fully Qualified Domain Name
- HTTP: Hyper Text Transfer Protocol
- IMSI: International Mobile Subscriber Identity
- JSON:	JavaScript Object Notation
- MEC: Multi-Access Edge Computing
- OpenNESS: Open Network Edge Services Software
- LTE: Long-Term Evolution
- MCC: Mobile Country Code
- MME: Mobility Management Entity
- MNC: Mobile Network Code
- NEF: Network Exposure Function
- OAM: Operations, Administration and Maintenance
- PDN: Packet Data Network
- PFCP: Packet Forwarding Control Protocol- SGW: Serving Gateway- PGW: PDN Gateway
- PGW-C: PDN Gateway - Control Plane Function
- PGW-U: PDN Gateway - User Plane Function
- REST: REpresentational State Transfer
- SGW-C: Serving Gateway - Control Plane Function
- SGW-U: Serving Gateway - User Plane Function
- TAC: Tracking Area Code
- UE: User Equipment (in the context of LTE)
- VIM: Virtual Infrastructure Manager 
- UUID: Universally Unique IDentifier 
- AMF: Access and Mobility Mgmt Function
- SMF: Session Management Function
- AUSF: Authentication Server Function
- NEF: Network Exposure Function
- NRF: Network function Repository Function
- UDM: Unified Data Management
- PCF: Policy Control Function
- UPF: User Plane Function
- DN: Data Network
- AF: Application Function
- SR-IOV: Single Root I/O Virtualization
- NUMA: Non-Uniform Memory Access
- COTS: Commercial Off-The-Shelf 
- DU: Distributed Unit of RAN
- CU: Centralized Unit of RAN