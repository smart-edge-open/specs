SPDX-License-Identifier: Apache-2.0    
Copyright © 2019 Intel Corporation and Smart-Edge.com, Inc.   

# Release Notes 
This document provides high level system features, issues and limitations information for OpenNESS. 

# Release history 
1. OpenNESS - 19.06 

# Features for Release 
1. OpenNESS - 19.06 
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
      - Swagger/Proto buff  External API Guide 
      - 4G/CUPS API whitepaper 
      - Cloud Connector App note
      - Openvino on OpenNESS App note

# Changes to Existing Features
 - **OpenNESS 19.06** There are no unsupported or discontinued features relevant to this release.

# Fixed Issues
- **OpenNESS 19.06** There are no non-Intel issues relevant to this release.

# Release Content
  - **OpenNESS 19.06** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 

# Hardware and Software Compatibility
OpenNESS Edge Node product has been tested using the following hardware specification:

- Skylake D
   - Super Micro 3U form factor chasis server, product SKU code: 835TQ-R920B
   - Motherboard type: X11SDV-16C-TP8F https://www.supermicro.com/products/motherboard/Xeon/D/X11SDV-16C-TP8F.cfm
   - Intel® Xeon® Processor D-2183IT

- Skylake SP

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

# Supported Operating Systems
> OpenNESS was tested on CentOS 7.6 : Note: OpenNESS is tested with CentOS 7.6 Pre-empt RT kernel to make sure VNFs and Applications can co-exist. There is not requirement from OpenNESS software to run on a Pre-empt RT kernel. 

# Key OpenNESS solution documentation 
- **OpenNESS Architecture and Solution overview** [OpenNESS Architecture and Solution overview link](https://github.com/open-ness/specs/blob/master/doc/architecture.md): Current Document. 
- **OpenNESS Edge Node User guide** [OpenNESS Edge Node User guide link TBD](https://www.openness.org/resources): User guide for OpenNESS Edge Node with installation and getting started  instructions. 
- **OpenNESS Controller Community Edition User guide** [OpenNESS Controller Community Edition User Guide link TBD](https://www.openness.org/resources): User guide for OpenNESS Controller Community Edition with installation and getting started instructions. 
- **OpenNESS Reference Application User guide** [OpenNESS Reference Application User guide link TBD](https://www.openness.org/resources): User guide for running Reference OpenNESS application based on OpenVINO as OpenNESS Edge compute application. 
- **OpenNESS Amazon AWS IoT Greengrass application note** [OpenNESS Amazon AWS IoT Greengrass application note link](https://github.com/open-ness/specs/blob/master/doc/openness_awsgreengrass.md): User guide for running Amazon AWS IoT Greengrass as Edge compute Apps on OpenNESS. 
- **OpenNESS Baidu Cloud application note** [OpenNESS Baidu Cloud application note link](https://github.com/open-ness/specs/blob/master/doc/openness_baiducloud.md): User guide for running Baidu OpenEdge as Edge compute Apps on OpenNESS. 
- **OpenNESS How-to Guide** [OpenNESS How-to Guide](https://github.com/open-ness/specs/blob/master/doc/openness_howto.md): Document that describes typical steps involved in running common OpenNESS tasks. 
- **OpenNESS Release Notes**[OpenNESS Release Notes](https://github.com/open-ness/specs/blob/master/openness_releasenotes.md): Document that provides high level system features, issues and limitations information for OpenNESS.


