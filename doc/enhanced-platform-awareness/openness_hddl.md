```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# Using Intel® Movidius™ Myriad™ X High Density Deep Learning (HDDL) solution in OpenNESS 

- [Using Intel® Movidius™ Myriad™ X High Density Deep Learning (HDDL) solution in OpenNESS](#using-intel%c2%ae-movidius%e2%84%a2-myriad%e2%84%a2-x-high-density-deep-learning-hddl-solution-in-openness)
  - [HDDL Introduction](#hddl-introduction)
  - [HDDL OpenNESS Integration](#hddl-openness-integration)
    - [Dynamic CPU and VPU usage](#dynamic-cpu-and-vpu-usage)
  - [Using HDDL-R PCI card with OpenNESS - Details](#using-hddl-r-pci-card-with-openness---details)
    - [HDDL-R PCI card Ansible installation for OpenNESS OnPremise Edge](#hddl-r-pci-card-ansible-installation-for-openness-onpremise-edge)
    - [Building Docker image with HDDL only or dynamic CPU/VPU usage](#building-docker-image-with-hddl-only-or-dynamic-cpuvpu-usage)
    - [Deploying application with HDDL support](#deploying-application-with-hddl-support)
  - [Summary](#summary)
  - [Reference](#reference)

Deployment of AI based Machine Learning (ML) applications on the edge is becoming more prevalent. Supporting hardware resources that accelerate AI/ML applications on the edge is key to improve the capacity of edge cloud deployment. It is also important to use CPU instruction set to execute AI/ML tasks when load is less. This paper explains these topics in the context of inference as a edge workload. 

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

From perspective of application built to use HDDL acceleration for inference there is additional step required to complete by the user during application deployment in comparison to an inference run on CPU. The user needs to provide a feature key as part of application onboarding which will enable use o HDDL by application. The application container needs access to 'hddl-service' socket and 'ion' device from host in order to communicate with the HDDL service. These resources are allocated to the application container automatically by OpenNESS' EVA micro-service if during the bring up of the Edge Node the HDDL service was properly configured and application deployed with appropriate EPA flag.

### Dynamic CPU and VPU usage
OpenNESS demonstrates one more great applicability Edge compute and efficient resource utilization in the Edge cloud. OpenVINO sample application supports support dynamic use of VPU or CPU for Object detection depending on the input from Producer application. The producer application can behave as a load balancer. It also demonstrates the Application portability with OpenVINO so that it can run on CPU or VPU.

![HDDL-R Add-in Card](hddl-images/openness_dynamic.png)

HDDL-R support is available for OnPrem OpenNESS deployment flavor with Docker.

## Using HDDL-R PCI card with OpenNESS - Details
Further sections provide information on how to use the HDDL setup on OpenNESS OnPremise Edge.

### HDDL-R PCI card Ansible installation for OpenNESS OnPremise Edge
To run the OpenNESS package with HDDL-R functionality the feature needs to be enabled on Edge Node.

To enable on the Edge Node set following in `onprem_node.yml` (Please note that the hddl role needs to be executed after openness/onprem/worker role):

```
- role: hddl
```
Run setup script `deploy_onprem_node.sh`.

### Building Docker image with HDDL only or dynamic CPU/VPU usage

In order to enable HDDL or mixed CPU/VPU operation by the containerized OpenVINO application set the `OPENVINO_ACCL` environmental variable to `HDDL` or `CPU_HDDL` inside producer application Dockerfile, located in Edge Apps repo - [edgeapps/openvino/producer](https://github.com/open-ness/edgeapps/blob/master/openvino/producer/Dockerfile). Build the image using the ./build-image.sh located in same directory. Making the image accessible by Edge Controller via HTTPs server is out of scope of this documentation - please refer to [Application Onboard Document](https://github.com/open-ness/specs/blob/master/doc/applications-onboard/on-premises-applications-onboarding.md).

### Deploying application with HDDL support

Application onboarding is out of scope of this document - please refer to [Application Onboard Document](https://github.com/open-ness/specs/blob/master/doc/applications-onboard/on-premises-applications-onboarding.md). General steps for onboarding OpenVino application should be executed with one exception. During the addition of the OpenVino consumer application to OpenNESS controller's library, the user needs to input an 'EPA Feature Key' and 'EPA Feature Value', the key to be entered is `hddl`, the value is `true`.

## Summary
Intel® Movidius™ Myriad™ X High Density Deep Learning solution integrates multiple Myriad™ X SoCs in a PCIe add-in card form factor or a module form factor to build a scalable, high capacity deep learning solution. OpenNESS provides a toolkit for customers to put together Deep learning solution at the edge. To take it further for efficient resource usage OpenNESS provides mechanism to use CPU or VPU depending on the load or any other criteria.

## Reference 
- [HDDL-R: Mouser Mustang-V100](https://www.mouser.ie/datasheet/2/763/Mustang-V100_brochure-1526472.pdf)

