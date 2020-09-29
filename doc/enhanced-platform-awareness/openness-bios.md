```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```
<!-- omit in toc -->
# BIOS and Firmware Configuration on the OpenNESS Platform
- [Overview](#overview)
- [Use case for edge](#use-case-for-edge)
- [Details: BIOS and firmware configuration on OpenNESS Network Edge](#details-bios-and-firmware-configuration-on-openness-network-edge)
  - [Setup](#setup)
  - [Usage](#usage)
- [Reference](#reference)

## Overview

BIOS and firmware are the fundamental platform configurations of a typical commercial, off-the-shelf platform. BIOS and firmware configurations are low-level configurations that can determine the environment available for network functions or applications. A typical BIOS configuration relevant for a network function or application may include several configurations (CPU, cache and memory, PCIe, power and performance, etc.). Some network functions and applications need certain BIOS and firmware settings to be configured in a specific way for optimal functionality and behavior.

## Use case for edge

Example: an AI Inference application that uses an accelerator such as an FPGA. 
To get optimal performance, when this application is deployed by the Resource Orchestrator, it is recommended to place the application on the same node and CPU Socket to which the accelerator is attached. To ensure this, NUMA, PCIe memory-mapped IO, and cache configurations need to be optimally configured. Similarly, for a network function like a base station or core network instruction set, cache and hyperthreading play an important role in the performance and density.

OpenNESS provides a reference implementation demonstrating how to configure low-level platform settings such as BIOS and firmware, and it provides the capability to check if they are configured as per a required profile. To implement this feature, OpenNESS uses the Intel® System Configuration Utility. The Intel® System Configuration Utility (Syscfg) is a command-line utility that can be used to save and restore BIOS and firmware settings to a file or to set and display individual settings.

>**NOTE**: The Intel® System Configuration Utility is only supported on certain server platforms from Intel. Refer to the [Intel® System Configuration Utility user guide](https://www.intel.com/content/dam/support/us/en/documents/server-products/server-boards/intel-syscfg-userguide-v1-03.pdf) for the supported server products.

>**NOTE**: The Intel® System Configuration Utility is not intended for and should not be used on any non-Intel server products.

The OpenNESS Network Edge implementation goes a step further and provides an automated process using Kubernetes\* to save and restore BIOS and firmware settings. To do this, the Intel® System Configuration Utility is packaged as a pod and deployed as a Kubernetes job that uses ConfigMap. This ConfigMap provides a mount point that has the BIOS and firmware profile that needs to be used for the worker node. A platform reboot is required for the BIOS and firmware configuration to be applied. To enable this, the BIOS and firmware job is deployed as a privileged pod.

 ![BIOS and Firmware configuration on OpenNESS](biosfw-images/openness_biosfw.png)

 _Figure - BIOS and Firmware configuration on OpenNESS_

## Details: BIOS and firmware configuration on OpenNESS Network Edge

BIOS and firmware configuration features are wrapped in a kubectl plugin.
Knowledge of Intel SYSCFG utility is required for usage.
Intel SYSCFG must be manually downloaded by the user after accepting the license.
[Download the utility here](https://downloadcenter.intel.com/download/29693/Save-and-Restore-System-Configuration-Utility-SYSCFG).

### Setup
To enable BIOSFW, perform the following steps:
1. The SYSCFG package must be downloaded and stored inside OpenNESS Experience Kits' `biosfw/` directory as a `syscfg_package.zip`:
`openness-experience-kits/biosfw/syscfg_package.zip`
2. Change the variable `ne_biosfw_enable` in `group_vars/all/10-default.yml` to “true”:
   ```yaml
   ne_biosfw_enable: true
   ```
3. OpenNESS Experience Kits' NetworkEdge deployment for both controller and nodes can be started.

### Usage

>**NOTE**: BIOSFW does not verify if the motherboard is compliant with the syscfg tool. It is assumed that syscfg verifies the motherboard and requirements.

* Use `kubectl biosfw --help` to learn about usage.
* Use `kubectl biosfw save <node_name> saved_bios.ini` to get BIOS setting of the `<node_name>` node to `saved_bios.ini`.
* Use `kubectl biosfw restore <node_name> bios_to_restore.ini` to restore BIOS settings on `<node_name>` node from file `bios_to_restore.ini`.
* Use `kubectl biosfw restore <node_name> bios_to_restore.ini admin_password` to restore BIOS settings on `<node_name>` node using BIOS Admin Password (last argument).
* Use `kubectl biosfw direct <node_name> /i` to run `syscfg /i` on `<node_name>` node.
* Use `kubectl biosfw direct <node_name> /d BIOSSETTINGS "Quiet Boot"` to run `syscfg /d BIOSSETTINGS "Quiet Boot"` on `<node_name>` node.

## Reference
- [Intel Save and Restore System Configuration Utility (SYSCFG)](https://downloadcenter.intel.com/download/28713/Save-and-Restore-System-Configuration-Utility-SYSCFG-)