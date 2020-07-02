```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```
<!-- omit in toc -->
# Release Notes 
This document provides high level system features, issues and limitations information for OpenNESS. 
- [Release history](#release-history)
- [Features for Release](#features-for-release)
- [Changes to Existing Features](#changes-to-existing-features)
- [Fixed Issues](#fixed-issues)
- [Known Issues and Limitations](#known-issues-and-limitations)
- [Release Content](#release-content)
- [Hardware and Software Compatibility](#hardware-and-software-compatibility)
  - [Intel® Xeon® D Processor](#intel-xeon-d-processor)
  - [2nd Generation Intel® Xeon® Scalable Processors](#2nd-generation-intel-xeon-scalable-processors)
  - [Intel® Xeon® Scalable Processors](#intel-xeon-scalable-processors)
- [Supported Operating Systems](#supported-operating-systems)
- [Package Versions](#package-versions)

# Release history 
1. OpenNESS - 19.06
2. OpenNESS - 19.06.01 
3. OpenNESS - 19.09 
4. OpenNESS - 19.12
5. OpenNESS - 20.03
6. OpenNESS - 20.06
   
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
3. <b>OpenNESS – 19.12</b>
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
4. <b>OpenNESS – 20.03</b>
    - OVN/OVS-DPDK support for dataplane 
      - Network Edge: Support for kube-ovn CNI with OVS or OVS-DPDK as dataplane. Support for Calico as CNI. 
      - OnPremises Edge: Support for OVS-DPDK CNI with OVS-DPDK as dataplane supporting application deployed in containers or VMs
    - Support for VM deployments on Kubernetes mode
      -  Kubevirt based VM deployment support 
      -  EPA Support for SRIOV Virtual function allocation to the VMs deployed using K8s 
    -  EPA support - OnPremises 
      -  Support for dedicated core allocation to application running as VMs or Containers
      -  Support for dedicated SRIOV VF allocation to application running in VM or containers
      -  Support for system resource allocation into the application running as container
         -  Mount point for shared storage
         -  Pass environment variables
         -  Configure the port rules  
    - Core Network Feature (5G)  
      - PFD Management API support (3GPP 23.502  Sec. 52.6.3  PFD Management service)
        - AF:   Added support for PFD Northbound API
        - NEF:  Added support for PFD southbound API, and Stubs to loopback the PCF calls.
      - kubectl: Enhanced CNCA kubectl plugin to configure PFD parameters 
      - WEB UI: Enhanced CNCA WEB UI to configure PFD params in OnPerm mode 
      - Auth2 based authentication between 5G Network functions: (as per 3GPP Standard)
        - Implemented oAuth2 based authentication and validation 
        - AF and NEF communication channel is updated to authenticated based on oAuth2 JWT token in addition to HTTP2. 
      - HTTPS support 
        - Enhanced the 5G OAM, CNCA (web-ui and kube-ctl) to HTTPS interface 
    - Modular Playbook 
      - Support for customers to choose real-time or non-realtime kernel for a edge node
      - Support for customer to choose CNIs - Validated with Kube-OVN and Calico 
    - Edge Apps
      - FlexRAN: dockerfile and pod specification for deployment of 4G or 5G FlexRAN 
      - AF: dockerfile and pod specification 
      - NEF: dockerfile and pod specification 
      - UPF: dockerfile and pod specification 
5. <b>OpenNESS – 20.06</b>
   - OpenNESS is now available in two distributions
      - Open source (Apache 2.0 license)
      - Intel Distribution of OpenNESS (Intel Proprietary License)
        - Includes all the code from the open source distribution plus additional features and enhancements to improve the user experience
        - Access requires a signed license. A request for access can be made at openness.org by navigating to the “Products” section and selecting “Intel Distribution of OpenNESS” 
      - Both distributions are hosted at github.com/open-ness
   - On premises configuration now optionally supports Kubernetes 
   - Dataplane 
     - Support for Calico eBPF as CNI 
     - Performance baselining of the CNIs 
   - Visual Compute and Media Analytics 
     - Intel Visual Cloud Accelerator Card - Analytics (VCAC-A) Kubernetes deployment support (CPU, GPU and VPU)
     - Node feature discovery of VCAC-A 
     - Telemetry support for VCAC-A 
     - Provide ansible and Helm -playbook support for OVC codecs Intel Xeon CPU mode - video analytics service (REST API) for developers
   - Edge Applications 
     - Smart City Application Pipeline supporting CPU or VCAC-A mode with Helm chart
     - CDN Content Delivery using NGINX with SR-IOV capability for higher performance with Helm chart 
     - CDN transcode sample application using Intel Xeon CPU optimized media SDK with Helm Chart
     - Support for Transcoding Service using Intel Xeon CPU optimized media SDK with Helm chart 
     - Intel Edge Insights application support with Helm chart 
   - Edge Network Functions 
     - FlexRAN DU with Helm Chart (FlexRAN not part of the release)
     - xRAN Fronthaul with Helm CHart (xRAN app not part of the release) 
   - Helm Chart for Kubernetes enhancements 
     - NFD, CMK, SRIOV-Device plugin and Multus 
     - Support for local Docker registry setup  
   - Support for deployment specific Flavors 
     - Minimal
     - RAN - 4G and 5G     
     - Media Analytics with VCAC-A and with CPU only mode 
     - CDN - Transcode
     - CDN - Content Delivery
     - Azure - Deployment of OpenNESS cluster on Microsoft Azure cloud 
   - Support for OpenNESS on CSP Cloud 
     - Azure - Deployment of OpenNESS cluster on Microsoft Azure cloud
   - Telemetry Support 
     - Support for Collectd backend with Intel hardware and custom metrics
     - Cpu, cpufreq, load, hugepages, intel_pmu, intel_rdt, ipmi, ovs_stats, ovs_pmd_stats
     - FPGA – PACN3000 (collectd) - Temp, Power draw
     - VPU Device memory, VPU device thermal, VPU Device utilization 
     - Open Telemetry - Support for collector and exporter for metrics ( e.g. heartbeat from app)
     - Support for PCM counter for Prometheus and Grafana
     - Telemetry Aware Scheduler 
   - Early Access support for Resource Management Daemon (RMD) 
     - RMD for cache allocation to the application Pods 
   - Ability to deploy OpenNESS Master and Node on same platform  

# Changes to Existing Features
 - **OpenNESS 19.06** There are no unsupported or discontinued features relevant to this release.
 - **OpenNESS 19.06.01** There are no unsupported or discontinued features relevant to this release.
 - **OpenNESS 19.09** There are no unsupported or discontinued features relevant to this release.
 - **OpenNESS 19.12** 
   - NTS Dataplane support for Network edge is discontinued. 
   - Controller UI for Network edge has be discontinued except for the CNCA configuration. Customers can optionally leverage Kubernetes dashboard to onboard applications. 
   - Edge node only supports non-realtime kernel. 
 - **OpenNESS 20.03**  
   - Support for HDDL-R only restricted to non-real-time or non-customized CentOS 7.6 default kernel. 
 - **OpenNESS 20.06**  
   - Offline install for Native mode OnPremises has be deprecated 

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
- **OpenNESS 20.03** 
  - Realtime Kernel support for network edge with K8s.
  - Modular playbooks  
- **OpenNESS 20.06** 
  - Optimized the Kubernetes based deployment by supporting multiple Flavors 

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
- **OpenNESS 20.03** 
  - On-Premises edge installation takes more than 1.5hrs because of docker image build for OVS-DPDK 
  - Network edge installation takes more than 1.5hrs because of docker image build for OVS-DPDK
  - OpenNESS controller allows management NICs to be in the pool of configuration which might allow configuration by mistake there by disconnecting the node from master
  - When using the SRIOV EPA feature added in 20.03 with OVNCNI, the container cannot access the CNI port. This is due to the SRIOV port being set by changing the network used by the container from default to a custom network, This overwrites the OVNCNI network setting configured prior to this to enable the container to work with OVNCNI. Another issue with the SRIOV, is that this also overwrites the network configuration with the EAA and edgedns, agents, which prevents the SRIOV enabled container from communicating with the agents.
  - Cannot remove Edge Node from Controller when its offline and traffic policy is configured or app is deployed.  
- **OpenNESS 20.06** 
  - On-Premises edge installation takes 1.5hrs because of docker image build for OVS-DPDK 
  - Network edge installation takes 1.5hrs because of docker image build for OVS-DPDK
  - OpenNESS controller allows management NICs to be in the pool of configuration which might allow configuration by mistake there by disconnecting the node from master
  - When using the SRIOV EPA feature added in 20.03 with OVNCNI, the container cannot access the CNI port. This is due to the SRIOV port being set by changing the network used by the container from default to a custom network, This overwrites the OVNCNI network setting configured prior to this to enable the container to work with OVNCNI. Another issue with the SRIOV, is that this also overwrites the network configuration with the EAA and edgedns, agents, which prevents the SRIOV enabled container from communicating with the agents.
  - Cannot remove Edge Node from Controller when its offline and traffic policy is configured or app is deployed. 
  - Legacy OnPremises - Traffic rule creation: cannot parse filled and cleared field
  - There is an issue with using CDI when uploading VM images when CMK is enabled due to missing CMK taint toleration. The CDI upload pod does not get deployed and the `virtctl` plugin command times out waiting for the action to complete. A workaround for the issue is to invoke the CDI upload command, edit the taint toleration for the CDI upload to tolerate CMK, update the pod, create the PV and let the pod run to completion.
  - There is a known issue with cAdvisor which in certain scenarios occasionally fails to expose the metrics for Prometheus endpoint, see Git Hub: https://github.com/google/cadvisor/issues/2537 
      
# Release Content
- **OpenNESS 19.06** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 
- **OpenNESS 19.06.01** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 
- **OpenNESS 19.09** OpenNESS Edge node, OpenNESS Controller, Common, Spec and OpenNESS Applications. 
- **OpenNESS 19.12** OpenNESS Edge node, OpenNESS Controller, Common, Spec, OpenNESS Applications and Experience kit. 
- **OpenNESS 20.03** OpenNESS Edge node, OpenNESS Controller, Common, Spec, OpenNESS Applications and Experience kit. 
- **OpenNESS 20.06** 
  - Open Source: Edge node, Controller, Epcforedge, Common, Spec, Applications and Experience kit. 
  - IDO: IDO Edge node, IDO Controller, IDO Epcforedge, IDO Spec and IDO Experience kit. 
  > Note: Application repo common to Open Source and IDO
  
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
| VCAC-A           | [VCAC-A Accelerator for Media Analytics](https://www.intel.com/content/dam/www/public/us/en/documents/datasheets/media-analytics-vcac-a-accelerator-card-by-celestica-datasheet.pdf)                                                 |

# Supported Operating Systems
> OpenNESS was tested on CentOS Linux release 7.6.1810 (Core) : Note: OpenNESS is tested with CentOS 7.6 Pre-empt RT kernel to ensure VNFs and Applications can co-exist. There is not a requirement from OpenNESS software to run on a Pre-empt RT kernel.

# Package Versions 
Package: telemetry, cadvisor 0.36.0, grafana  7.0.3, prometheus 2.16.0, prometheus: node exporter 1.0.0-rc.0, tas 0., golang 1.14.2, docker 19.03., kubernetes 1.18.4, dpdk 18.11.6, ovs 2.11.1, ovn 2.12.0, helm 3.0, kubeovn 1.0.1, flannel 0.12.0, calico 3.14.0 , multus 3.4.1, sriov cni 2.3, nfd 0.5.0, cmk   v1.4.1

