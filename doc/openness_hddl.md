SPDX-License-Identifier: Apache-2.0    
Copyright © 2019 Intel Corporation    

# Using Intel® Movidius™ Myriad™ X High Density Deep Learning (HDDL) solution in OpenNESS 

* [OpenNESS Introduction](#openness-introduction)
* [HDDL Introduction](#hddl-introduction)  
* [HDDL OpenNESS Integration](#hddl-openness-integration)
  * [Dynamic CPU and VPU usage](#dynamic-cpu-and-vpu-usage)
* [Summary](#summary) 


## OpenNESS Introduction
OpenNESS is an open source software toolkit to enable easy orchestration of edge services across diverse network platform and access technologies in multi-cloud environments. It is inspired by the edge computing architecture defined by the ETSI Multi-access Edge Computing standards (e.g., [ETSI_MEC 003]), as well as the 5G network architecture ([3GPP_23501]).

It leverages major industry edge orchestration frameworks, such as Kubernetes and OpenStack, to implement a cloud-native architecture that is multi-platform, multi-access, and multi-cloud. It goes beyond these frameworks, however, by providing the ability for applications to publish their presence and capabilities on the platform, and for other applications to subscribe to those services. Services may be very diverse, from providing location and radio network information, to operating a computer vision system that recognize pedestrians and cars, and forwards metadata from those objects to to downstream traffic safety applications.

OpenNESS is access network agnostic, as it provides an architecture that interoperates with LTE, 5G, WiFi, and wired networks. In edge computing, dataplane flows must be routed to edge nodes with regard to physical location (e.g., proximity to the endpoint, system load on the edge node, special hardware requirements). OpenNESS provides APIs that allow network orchestrators and edge computing controllers to configure routing policies in a uniform manner.

## HDDL Introduction
Intel® Movidius™ Myriad™ X High Density Deep Learning solution integrates multiple Myriad™ X SoCs in a PCIe add-in card form factor or a module form factor to build a scalable, high capacity deep learning solution. It provides hardware and software reference for customers. The following figure shows the HDDL-R concept.

![HDDL-R Add-in Card](hddl-images/openness_HDDL.png)

- <b>HDDL-R</b>: Raw video data to the PCIe card (decode on host).
- <b>Scalability</b>: options available to put between 4 to 8 Myriad™ X SoC chips in one add-in-card.
- <b>Easy to adopt (Plug & Use)</b>: Powered by the PCIex4 interface with 25W ceiling from existing NVR and server designs.

The HDDL SW stack adopts Intel OpenVINO™ IE APIs. These universal deep learning inference APIs have different implementations for the Intel CPU, GPU, FPGA, and VPU (Intel® Movidius™ Myriad™ series) hardware.
Each implementation for each hardware is an inference engine plugin.
The plugin for Intel® Movidius™ Myriad™ X High Density Deep Learning solution, or IE HDDL plugin for short, supports the Myriad™ X HDDL Solution hardware PCIe card. It communicates with the Myriad™ X HDDL HAL API to manage the multiple Myriad™ X devices in the card, and schedule deep learning neural networks and inference tasks to these Myriad™ X devices.

## HDDL OpenNESS Integration

OpenNESS provides support for deployment of OpenVINO applications and workloads accelerated through Intel® Vision Accelerator Design with Intel® Movidius™ VPUs HDDL-R add-in card. As a prerequisite for enabling the support it is required for the HDDL add-in card to be inserted into PCI slot of the Edge Node platform. The support is then enabled by setting appropriate flag in a configuration file prior to deployment of the Edge Node software toolkit.

With a correct configuration during the Edge Node bring up an automated script will install all components necessary, such as kernel drivers required for correct operation of the Vision Processing Units (VPUs) and 'udev rules' required for correct kernel driver assignment and booting of these devices on the Edge Node host platform.

After the execution of OpenNESS automated script installing all necessary tools and components for Edge Node bring up, another automated script responsible for deployment of all micro-services is to be run. As part of this particular script a Docker container running a 'hddl-service' will be started if the option for HDDL support is enabled. This container is part of OpenNESS system services - it is a privileged container with 'SYS_ADMIN' capabilities and access to the hosts devices.

The 'hddl-service' container is running the HDDL Daemon which is responsible for bring up of the HDDL Service within the container. The HDDL Service enables a communication between the OpenVino applications requiring to run inference on HDDL devices and VPUs needed in order to run the workload. This communication is done via a socket which is created by the HDDL service, the location of the socket by default is `/var/tmp/`directory of Edge Node host. The application container requiring HDDL acceleration needs to be exposed to this socket.

![HDDL-Block-Diagram](hddl-images/hddlservice.png)

Regarding the application deployment sample Dockerfiles with instructions on how to build docker images are provided by OpenNESS. Instructions on how to deploy Edge Applications and Services are out of scope of this document. There are two applications for OpenVINO sample deployment on Edge Node provided. The first application is an OpenVINO application running an inference on a video stream received by the application container. The second application is a Producer application servicing the first (OpenVINO) application via push notifications using the EAA service of OpenNESS. The Producer application periodically notifies the OpenVino application container to change inference model or the OpenVino plugin to use.
Producer application container image can be build with an option to either constantly run the inference on HDDL VPUs or periodically change between CPU and HDDL workloads.

From perspective of application built to use HDDL acceleration for inference there is no additional steps required to complete by the user during application deployment in comparison to an inference run on CPU. The application container needs access to 'hddl-service' socket and 'ion' device from host in order to communicate with the HDDL service. These resources are allocated to the application container automatically by OpenNESS' EVA micro-service if during the bring up of the Edge Node the HDDL service was properly configured.

### Dynamic CPU and VPU usage
OpenNESS demonstrates one more great applicability Edge compute and efficient resource utilization in the Edge cloud. OpenVINO sample application supports support dynamic use of VPU or CPU for Object detection depending on the input from Producer application. The producer application can behave as a load balancer. It also demonstrates the Application portability with OpenVINO so that it can run on CPU or VPU.

![HDDL-R Add-in Card](hddl-images/openness_dynamic.png)

HDDL-R support is available for OnPrem OpenNESS deployment flavor with Docker.

## Summary
Intel® Movidius™ Myriad™ X High Density Deep Learning solution integrates multiple Myriad™ X SoCs in a PCIe add-in card form factor or a module form factor to build a scalable, high capacity deep learning solution. OpenNESS provides a toolkit for customers to put together Deep learning solution at the edge. To take it further for efficient resource usage OpenNESS provides mechanism to use CPU or VPU depending on the load or any other criteria. 