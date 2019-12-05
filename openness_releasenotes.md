SPDX-License-Identifier: Apache-2.0    
Copyright © 2019 Intel Corporation and Smart-Edge.com, Inc.   

# Release Notes 
This document provides high level system features, issues and limitations information for OpenNESS. 
- [Release Notes](#release-notes)
- [Release history](#release-history)
- [Features for Release](#features-for-release)
- [Changes to Existing Features](#changes-to-existing-features)
- [Fixed Issues](#fixed-issues)
- [Known Issues](#known-issues)
- [Release Content](#release-content)
- [Hardware and Software Compatibility](#hardware-and-software-compatibility)
  - [Skylake D](#skylake-d)
  - [Skylake SP](#skylake-sp)
- [Supported Operating Systems](#supported-operating-systems)

# Release history 
1. OpenNESS - 19.06
2. OpenNESS - 19.06.01 
3. OpenNESS - 19.09 

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

# Changes to Existing Features
 - **OpenNESS 19.06** There are no unsupported or discontinued features relevant to this release.
 - **OpenNESS 19.06.01** There are no unsupported or discontinued features relevant to this release.
 - **OpenNESS 19.09** There are no unsupported or discontinued features relevant to this release.

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

# Known Issues
- **OpenNESS 19.06** There are no issues relevant to this release.
- **OpenNESS 19.06.01** There is one issue relevant to this release: it is not possible to remove application from Edge Node in case of error during application deployment. The issue concerns application in Virtual Machine.
- **OpenNESS 19.09** 
  - Gateway in multi-node -  will not work when few nodes will have the same public IP (they will be behind one common NAT)
  - Ansible in K8s can cause problems when rerun on a machine: 
    - If after running all 3 scripts 
    - Script 02 will be run again (it will not remove all necessary K8s related artifacts)
    - We would recommend cleaning up the installation on the node
  
# Release Content
- **OpenNESS 19.06** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 
- **OpenNESS 19.06.01** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 
- **OpenNESS 19.09** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 
  
# Hardware and Software Compatibility
OpenNESS Edge Node has been tested using the following hardware specification:

## Skylake D
   - Super Micro 3U form factor chasis server, product SKU code: 835TQ-R920B
   - Motherboard type: [X11SDV-16C-TP8F](https://www.supermicro.com/products/motherboard/Xeon/D/X11SDV-16C-TP8F.cfm)
   - Intel® Xeon® Processor D-2183IT

## Skylake SP

|                  |                                                               |
|------------------|---------------------------------------------------------------|
| SKX-SP           | Compute Node based on SKX-SP                                  |
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
> OpenNESS was tested on CentOS 7.6 : Note: OpenNESS is tested with CentOS 7.6 Pre-empt RT kernel to make sure VNFs and Applications can co-exist. There is not requirement from OpenNESS software to run on a Pre-empt RT kernel. 