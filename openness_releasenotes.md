```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# Release Notes 
This document provides high level system features, issues and limitations information for OpenNESS. 
- [Release Notes](#release-notes)
- [Release history](#release-history)
- [Features for Release](#features-for-release)
- [Changes to Existing Features](#changes-to-existing-features)
- [Fixed Issues](#fixed-issues)
- [Known Issues and Limitations](#known-issues-and-limitations)
- [Release Content](#release-content)
- [Hardware and Software Compatibility](#hardware-and-software-compatibility)
  - [Intel® Xeon® D Processor](#intel%c2%ae-xeon%c2%ae-d-processor)
  - [2nd Generation Intel® Xeon® Scalable Processors](#2nd-generation-intel%c2%ae-xeon%c2%ae-scalable-processors)
  - [Intel® Xeon® Scalable Processors](#intel%c2%ae-xeon%c2%ae-scalable-processors)
- [Supported Operating Systems](#supported-operating-systems)

# Release history 
1. OpenNESS - 19.06
2. OpenNESS - 19.06.01 
3. OpenNESS - 19.09 
4. OpenNESS - 19.12

# Features for Release 
1. <b>OpenNESS - 19.06 </b>
   - Edge Cloud Deployment options  
      - Controller based deployment of Applications in Docker Containers/VM–using-Libvirt
      - Controller + Kubernetes based deployment of Applications in Docker Containers
   - OpenNESS Controller 
      - Support for Edge Node Orchestration 
      - Support for Web UI front end 
   - OpenNESS APIs 
      - Edge Application APIs 
      - Edge Virtualization Infrastructure APIs 
      - Edge Application life cycle APIs 
      - Core Network Configuration APIs 
      - Edge Application authentication APIs 
      - OpenNESS Controller APIs
    - Platform Features 
      - Microservices based Appliance and Controller agent deployment 
      - Support for DNS for the edge 
      - CentOS 7.6 / CentOS 7.6 + RT kernel
      - Basic telemetry support
    - Sample Reference Applications 
      - OpenVino based Consumer Application 
      - Producer Application supporting OpenVino 
    - Dataplane 
      - DPDK/KNI based Dataplane – NTS 
      - Support for deployment on IP, LTE (S1, SGi and LTE CUPS)
    - Cloud Adapters 
      - Support for running Amazon Green grass cores as an OpenNESS application 
      - Support for running Baidu Cloud as an OpenNESS application 
    - Documentation 
      - User Guide Enterprise and Operator Edge 
      - OpenNESS Architecture
      - Swagger/Proto buff  External API Guide 
      - 4G/CUPS API whitepaper 
      - Cloud Connector App note
      - Openvino on OpenNESS App note
2. <b>OpenNESS - 19.09</b>
    - Edge Cloud Deployment options  
      - Asyn method for image download to avoid timeout. 
    - Dataplane 
      - Support for OVN/OVS based Dataplane and network overlay for Network Edge (based on Kubernetes) 
    - Cloud Adapters 
      - Support for running Amazon Green grass cores as an OpenNESS application with OVN/OVS as Dataplane and network overlay
    - Support for Inter-App comms 
      - Support for OVS-DPDK or Linux bridge or Default interface for inter-Apps communication for OnPrem deployment
    - Accelerator support 
      - Support for HDDL-R acclerator for interference in container environment for OnPrem deployment   
    - Edge Applications 
      - Early Access Support for Open Visual Cloud (OVC) based Smart City App on OpenNESS OnPrem 
      - Support for Dynamic use of VPU or CPU for Inference
    - Gateway
      - Support for Edge node and OpenNESS Controller gate way to support route-ability  
    - Documentation 
      - OpenNESS Architecture (update)
      - OpenNESS Support for OVS as dataplane with OVN
      - Open Visual Cloud Smart City Application on OpenNESS - Solution Overview
      - Using Intel® Movidius™ Myriad™ X High Density Deep Learning (HDDL) solution in OpenNESS
      - OpenNESS How-to Guide (update)
3. <b>OpenNESS – 19.12 </b>
    - Hardware
      - Support for Cascade lake 6252N
      - Support for Intel FPGA PAC N3000
    - Edge Application
      - Fully Cloudnative Open Visual Cloud Smart City Application pipeline on OpenNESS Network edge.
    - Edge cloud 
      - EAA and CNCA microservice as native Kubernetes managed services
      - Support for Kubernetes version 1.16.2 
    - Edge Compute EPA features support for Network Edge 
      - CPU Manager: Support deployment of POD with dedicated pinning 
      - SRIOV NIC: Support deployment of POD with dedicated SRIOV VF from NIC
      - SRIOV FPGA: Support deployment of POD with dedicated SRIOV VF from FPGA 
      - Topology Manager: Support k8s to manage the resources allocated to workloads in a NUMA topology-aware manner
      - BIOS/FW Configuration service - Intel SysCfg based BIOS/FW management service 
      - Hugepages: Support for allocation of 1G/2M huge pages to the Pod.
      - Multus: Support for Multiple network interface in the PODs deployed by Kubernetes
      - Node Feature discovery: Support detection of Silicon and Software features and automation of deployment of CNF and Applications
      - FPGA Remote System Update service: Support Intel OPAE (fpgautil) based image update service for FPGA.
      - Non-Privileged Container: Support deployment of non-privileged pods (CNFs and Applications as reference)
    - Edge Compute EPA features support for OnPremises 
      - Using Intel® Movidius™ Myriad™ X High Density Deep Learning (HDDL) solution in OpenNESS
    - OpenNESS Experience Kit for Network and OnPremises edge
      - Offline Release Package: Customers should be able to create an installer package that can be used to install OnPremises version of OpenNESS without the need for Internet access.
    - 5G NR Edge Cloud deployment support
      - 5G NR edge cloud deployment support with SA mode 
      - AF: Support for 5G NGC Application function as a microservice
      - NEF: Support for 5G NGC Network Exposure function as a microservice
      - Support for 5G NR UDM, UPF, AMF, PCF and SCF (not part of the release)
    - DNS support
      - DNS support for UE
      - DNS Support for Edge applications
    - Documentation
      - Completely reorganized documentation structure for ease of navigation 
      - 5G NR Edge Cloud deployment Whitepaper
      - EPA application note for each of the features

# Changes to Existing Features
 - **OpenNESS 19.06** There are no unsupported or discontinued features relevant to this release.
 - **OpenNESS 19.06.01** There are no unsupported or discontinued features relevant to this release.
 - **OpenNESS 19.09** There are no unsupported or discontinued features relevant to this release.
 - **OpenNESS 19.12** : 
   - NTS Dataplane support for Network edge is discontinued. 
   - Controller UI for Network edge has be discontinued except for the CNCA configuration. Customers can optionally leverage Kubernetes dashboard to onboard applications. 
   - Edge node only supports non-realtime kernel. 

# Fixed Issues
- **OpenNESS 19.06** There are no non-Intel issues relevant to this release.
- **OpenNESS 19.06.01** There are no non-Intel issues relevant to this release.
- **OpenNESS 19.06.01** 
   - VHOST HugePages dependency
   - Bug in getting appId by IP address for container
   - Wrong value of appliance verification key printed by ansible script
   - NTS is in hanging state when trying to add same traffic policy to multiple interfaces
   - Application in VM cannot be started
   - Bug in libvirt deployment
   - Invalid status after app undeployment
   - Application memory field is in MB
- **OpenNESS 19.12**
  - Improved usability/automation in Ansible scripts 

# Known Issues and Limitations
- **OpenNESS 19.06** There are no issues relevant to this release.
- **OpenNESS 19.06.01** There is one issue relevant to this release: it is not possible to remove application from Edge Node in case of error during application deployment. The issue concerns application in Virtual Machine.
- **OpenNESS 19.09** 
  - Gateway in multi-node -  will not work when few nodes will have the same public IP (they will be behind one common NAT)
  - Ansible in K8s can cause problems when rerun on a machine: 
    - If after running all 3 scripts 
    - Script 02 will be run again (it will not remove all necessary K8s related artifacts)
    - We would recommend cleaning up the installation on the node
- **OpenNESS 19.12** 
  - Gateway in multi-node -  will not work when few nodes will have the same public IP (they will be behind one common NAT)
  - OpenNESS OnPremises: Can not remove a failed/disconnected the edge node information/state from the controller
  - The CNCA APIs (4G & 5G) supported in this release is an early access reference implementation and does not support authentication 
  - Realtime kernel support has been temporarily disabled to address the Kubernetes 1.16.2 and Realtime kernel instability. 
  
# Release Content
- **OpenNESS 19.06** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 
- **OpenNESS 19.06.01** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 
- **OpenNESS 19.09** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 
- **OpenNESS 19.12** OpenNESS Edge node, OpenNESS Controller, Common, Spec, OpenNESS Applications and Experience kit. 
  
# Hardware and Software Compatibility
OpenNESS Edge Node has been tested using the following hardware specification:

## Intel® Xeon® D Processor
   - Super Micro 3U form factor chasis server, product SKU code: 835TQ-R920B
   - Motherboard type: [X11SDV-16C-TP8F](https://www.supermicro.com/products/motherboard/Xeon/D/X11SDV-16C-TP8F.cfm)
   - Intel® Xeon® Processor D-2183IT
## 2nd Generation Intel® Xeon® Scalable Processors
|                  |                                                               |
|------------------|---------------------------------------------------------------|
| CLX-SP           | Compute Node based on CLX-SP(6252N)                           |
| Board            |  S2600WFT server board                                        |
|                  | 2 x Intel(R) Xeon(R) Gold 6252N CPU @ 2.30GHz                 |
|                  | 2 x associated Heatsink                                       |
| Memory           | 12x Micron 16GB DDR4 2400MHz DIMMS * [2666 for PnP]           |
| Chassis          | 2U Rackmount Server Enclosure                                 |
| Storage          | Intel M.2 SSDSCKJW360H6 360G                                  |
| NIC              | 1x Intel Fortville NIC  X710DA4  SFP+ ( PCIe card to CPU-0)   |
| QAT              | Intel  Quick Assist Adapter Device 37c8                       |
|                  | (Symmetrical design) LBG integrated                           |
| NIC on board     | Intel-Ethernet-Controller-I210 (for management)               |
| Other card       | 2x PCIe Riser cards                                           |

## Intel® Xeon® Scalable Processors
|                  |                                                               |
|------------------|---------------------------------------------------------------|
| SKX-SP           | Compute Node based on SKX-SP(6148)                            |
| Board            | WolfPass S2600WFQ server board(symmetrical QAT)CPU            |
|                  | 2 x Intel(R) Xeon(R) Gold 6148 CPU @ 2.40GHz                  |
|                  | 2 x associated Heatsink                                       |
| Memory           | 12x Micron 16GB DDR4 2400MHz DIMMS * [2666 for PnP]           |
| Chassis          | 2U Rackmount Server Enclosure                                 |
| Storage          | Intel M.2 SSDSCKJW360H6 360G                                  |
| NIC              | 1x Intel Fortville NIC  X710DA4  SFP+ ( PCIe card to CPU-0)   |
| QAT              | Intel  Quick Assist Adapter Device 37c8                       |
|                  | (Symmetrical design) LBG integrated                           |
| NIC on board     | Intel-Ethernet-Controller-I210 (for management)               |
| Other card       | 2x PCIe Riser cards                                           |
| HDDL-R           | [Mouser Mustang-V100](https://www.mouser.ie/datasheet/2/763/Mustang-V100_brochure-1526472.pdf)                                                 |

# Supported Operating Systems
> OpenNESS was tested on CentOS Linux release 7.6.1810 (Core) : Note: OpenNESS is tested with CentOS 7.6 Pre-empt RT kernel to make sure VNFs and Applications can co-exist. There is not requirement from OpenNESS software to run on a Pre-empt RT kernel.

