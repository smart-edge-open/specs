```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```
<!-- omit in toc -->
# Using Intel® Movidius™ Myriad™ X High Density Deep Learning (HDDL) solution in OpenNESS
- [Overview](#overview)
- [HDDL Introduction](#hddl-introduction)
- [HDDL OpenNESS Integration](#hddl-openness-integration)
- [Summary](#summary)
- [Reference](#reference)

## Overview
The deployment of AI-based, machine-learning (ML) applications on the edge have become more prevalent. Supporting hardware resources that accelerate AI/ML applications on the edge is key to improve the capacity of edge cloud deployment. It is also important to use the CPU instruction set to execute AI/ML tasks when a workload is less. This document explains these topics in the context of inference as an edge workload.

## HDDL Introduction
Intel® Movidius™ Myriad™ X High Density Deep Learning (HDDL) solution integrates multiple Intel® Movidius™ Myriad™ X brand SoCs in a PCIe add-in card form factor or a module form factor to build a scalable, high-capacity, deep-learning solution. It provides hardware and software reference for customers. The following figure shows the HDDL-R concept.

![HDDL-R Add-in Card](hddl-images/openness_HDDL.png)

- <b>HDDL-R</b>: Raw video data to the PCIe card (decode on the host).
- <b>Scalability</b>: Options available to put between 4 to 8 Intel® Movidius™ Myriad™ X brand SoC chips in one add-in-card.
- <b>Easy to adopt (plug and use)</b>: Powered by the PCIe\* x4 interface with a 25W ceiling from existing NVR and server designs.

The HDDL SW stack adopts OpenVINO™ brand IE APIs. These universal deep-learning inference APIs have different implementations for the Intel’s CPU, GPU, FPGA, and VPU (Intel® Movidius™ Myriad™ series) technology.
Each implementation for each hardware is an inference engine plugin.
The plugin for the Intel® Movidius™ Myriad™ X HDDL solution, or IE HDDL plugin for short, supports the Intel® Movidius™ Myriad™ X HDDL Solution hardware PCIe card. It communicates with the Intel® Movidius™ Myriad™ X HDDL HAL API to manage multiple Intel® Movidius™ Myriad™ X devices in the card, and it schedules deep-learning neural networks and inference tasks to these devices.

## HDDL OpenNESS Integration

OpenNESS provides support for the deployment of OpenVINO™ applications and workloads accelerated through Intel® Vision Accelerator Design with the Intel® Movidius™ VPU HDDL-R add-in card. As a prerequisite for enabling the support, it is required for the HDDL add-in card to be inserted into the PCI slot of the Edge Node platform. The support is then enabled by setting the appropriate flag in a configuration file before deployment of the Edge Node software toolkit.

With a correct configuration during the Edge Node bring up, an automated script will install all components necessary, such as kernel drivers required for the correct operation of the Vision Processing Units (VPUs) and 'udev rules' required for correct kernel driver assignment and booting of these devices on the Edge Node host platform.

After the OpenNESS automated script installs all necessary tools and components for Edge Node bring up, another automated script responsible for deployment of all micro-services is run. As part of this particular script, a Docker\* container running a 'hddl-service' is started if the option for HDDL support is enabled. This container, which is part of OpenNESS system services, is a privileged container with 'SYS_ADMIN' capabilities and access to the host’s devices.

The 'hddl-service' container is running the HDDL Daemon which is responsible for bringing up the HDDL Service within the container. The HDDL Service enables the communication between the OpenVino™ applications required to run inference on HDDL devices and VPUs needed to run the workload. This communication is done via a socket, which is created by the HDDL service. The default location of the socket is the `/var/tmp/`directory of the Edge Node host. The application container requiring HDDL acceleration needs to be exposed to this socket.

![HDDL-Block-Diagram](hddl-images/hddlservice.png)

## Summary
The Intel® Movidius™ Myriad™ X HDDL solution integrates multiple Intel® Movidius™ Myriad™ X brand SoCs in a PCIe add-in card form factor or a module form factor to build a scalable, high-capacity, deep-learning solution. OpenNESS provides a toolkit for customers to put together deep-learning solutions at the edge. To take it further for efficient resource usage, OpenNESS provides a mechanism to use CPU or VPU depending on the load or any other criteria.

## Reference
- [HDDL-R: Mouser Mustang-V100](https://www.mouser.ie/datasheet/2/763/Mustang-V100_brochure-1526472.pdf)
