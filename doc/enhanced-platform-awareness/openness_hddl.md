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

To enable, modify `onprem_hddl_enable` variable in `group_vars/all/10-default.yml` file:
```yaml
onprem_hddl_enable: true
```
Run setup script `deploy_onprem.sh nodes`.

> NOTE: For this release, HDDL verifed with default CentOS Minimal No-RT-kernel(3.10.0-957.el7.x86_64) and Customized RT-kernel(3.10.0-1062.12.1.rt56.1042.el7.x86_64).
> NOTE: For the hardware platforms with ASMedia PCIe Gen3 switch need to upgrade firmware. otherwise there will be potential system hang issue for some small network models such as squeenzenet1.1...etc.

To check HDDL service running status on the edgenode after deploy, docker logs should look like:
```
docker ps
CONTAINER ID        IMAGE                                  COMMAND                  CREATED             STATUS              PORTS                                                                  NAMES
ca7e9bf9e570        hddlservice:1.0                        "./start.sh"             20 hours ago        Up 20 hours                                                                                openvino-hddl-service
ea82cbc0d84a        004fddc9c299                           "/usr/sbin/syslog-ng…"   21 hours ago        Up 21 hours         601/tcp, 514/udp, 6514/tcp                                             edgenode_syslog-ng_1
3b4daaac1bc6        appliance:1.0                          "sudo -E ./entrypoin…"   21 hours ago        Up 21 hours         0.0.0.0:42101-42102->42101-42102/tcp, 192.168.122.1:42103->42103/tcp   edgenode_appliance_1
2262b4fa875b        eaa:1.0                                "sudo ./entrypoint_e…"   21 hours ago        Up 21 hours         192.168.122.1:80->80/tcp, 192.168.122.1:443->443/tcp                   edgenode_eaa_1
eedf4355ec98        edgednssvr:1.0                         "sudo ./edgednssvr -…"   21 hours ago        Up 19 hours         192.168.122.128:53->53/udp                                             mec-app-edgednssvr
5c94f7203023        nts:1.0                                "sudo -E ./entrypoin…"   21 hours ago        Up 19 hours                                                                                nts
docker logs --tail 20 ca7e9bf9e570
+-------------+-------------------+-------------------+-------------------+-------------------+-------------------+-------------------+-------------------+-------------------+
| status      | WAIT_TASK         | WAIT_TASK         | WAIT_TASK         | WAIT_TASK         | WAIT_TASK         | RUNNING           | WAIT_TASK         | WAIT_TASK         |
| fps         | 1.61              | 1.62              | 1.63              | 1.65              | 1.59              | 1.58              | 1.67              | 1.60              |
| curGraph    | icv-ped...sd-v2.0 | icv-ped...sd-v2.0 | icv-ped...sd-v2.0 | icv-ped...sd-v2.0 | icv-ped...sd-v2.0 | icv-ped...sd-v2.0 | icv-ped...sd-v2.0 | icv-ped...sd-v2.0 |
| rPriority   | 0                 | 0                 | 0                 | 0                 | 0                 | 0                 | 0                 | 0                 |
| loadTime    | 20200330 05:34:34 | 20200330 05:34:35 | 20200330 05:34:35 | 20200330 05:34:35 | 20200330 05:34:35 | 20200330 05:34:35 | 20200330 05:34:35 | 20200330 05:34:35 |
| runTime     | 00:00:41          | 00:00:41          | 00:00:41          | 00:00:40          | 00:00:40          | 00:00:40          | 00:00:40          | 00:00:40          |
| inference   | 64                | 64                | 64                | 64                | 63                | 63                | 64                | 63                |
| prevGraph   |                   |                   |                   |                   |                   |                   |                   |                   |
| loadTime    |                   |                   |                   |                   |                   |                   |                   |                   |
| unloadTime  |                   |                   |                   |                   |                   |                   |                   |                   |
| runTime     |                   |                   |                   |                   |                   |                   |                   |                   |
| inference   |                   |                   |                   |                   |                   |                   |                   |                   |
```


### Building Docker image with HDDL only or dynamic CPU/VPU usage

In order to enable HDDL or mixed CPU/VPU operation by the containerized OpenVINO application set the `OPENVINO_ACCL` environmental variable to `HDDL` or `CPU_HDDL` inside producer application Dockerfile, located in Edge Apps repo - [edgeapps/applications/openvino/producer](https://github.com/otcshare/edgeapps/blob/master/applications/openvino/producer/Dockerfile). Build the image using the ./build-image.sh located in same directory. Making the image accessible by Edge Controller via HTTPs server is out of scope of this documentation - please refer to [Application Onboard Document](https://github.com/otcshare/specs/blob/master/doc/applications-onboard/on-premises-applications-onboarding.md).

### Deploying application with HDDL support

Application onboarding is out of scope of this document - please refer to [Application Onboard Document](https://github.com/otcshare/specs/blob/master/doc/applications-onboard/on-premises-applications-onboarding.md). General steps for onboarding OpenVino application should be executed with one exception. During the addition of the OpenVino consumer application to OpenNESS controller's library, the user needs to input an 'EPA Feature Key' and 'EPA Feature Value', the key to be entered is `hddl`, the value is `true`.

## Summary
Intel® Movidius™ Myriad™ X High Density Deep Learning solution integrates multiple Myriad™ X SoCs in a PCIe add-in card form factor or a module form factor to build a scalable, high capacity deep learning solution. OpenNESS provides a toolkit for customers to put together Deep learning solution at the edge. To take it further for efficient resource usage OpenNESS provides mechanism to use CPU or VPU depending on the load or any other criteria.

## Reference
- [HDDL-R: Mouser Mustang-V100](https://www.mouser.ie/datasheet/2/763/Mustang-V100_brochure-1526472.pdf)
