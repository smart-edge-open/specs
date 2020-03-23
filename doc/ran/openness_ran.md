SPDX-License-Identifier: Apache-2.0     
Copyright © 2020 Intel Corporation

- [Introduction](#introduction)
- [Building the FlexRAN image](#building-the-flexran-image)
- [FlexRAN hardware platform configuration](#flexran-hardware-platform-configuration)
  - [BIOS](#bios)
  - [Host kernel command line](#host-kernel-command-line)
- [Deploying and Running the FlexRAN pod](#deploying-and-running-the-flexran-pod)
- [References](#references)

# Introduction

Radio Access Network is the edge of wireless network. 4G and 5G base stations form the key network function for the edge deployment. In OpenNESS Intel FlexRAN is used as reference 4G and 5G base station for 4G and 5G end-to-end testing. 

FlexRAN offers high-density baseband pooling that could run on a distributed Telco Cloud to provide a smart indoor coverage solution and next-generation front haul architecture. This flexible, 4G and 5G platform provides the open platform ‘smarts’ for both connectivity and new applications at the edge of the network, along with the developer tools to create these new services. FlexRAN running on Telco Cloud provides low latency compute, storage, and network offload from the edge, thus saving network bandwidth. 

Intel FlexRAN 5GNR Reference PHY is a baseband PHY Reference Design for a 4G and 5G base station, using Xeon® series Processor with Intel Architecture. This 5GNR Reference PHY consists of a library of c-callable functions which are validated on a Intel® Xeon® Broadwell / SkyLake / CascadeLake / IceLake platforms and demonstrates the capabilities of the software running different 5GNR L1 features. Functionality of these library functions is defined by the relevant sections in [3GPP TS 38.211, 212, 213, 214 and 215]. Performance of the Intel 5GNR Reference PHY meets the requirements defined by the base station conformance tests in [3GPP TS 38.141]. This library of Intel functions will be used by Intel Partners and end-customers as a foundation for their own product development. Reference PHY is integrated with third party L2L3 to complete the base station pipeline. 

This document aims to provide the steps involved in deploying FlexRAN 5G (gNb) on the OpenNESS platform. 

# Building the FlexRAN image 

This section will explain the steps involved in building the flexRAN image. Only L1 and L2-stub will be part of these steps. Real-time L2 (MAC and RLC) and non Real-time L2L3 is out of scope as its part of the third party component.  

1. Untar the FlexRAN package (Please contact your Intel representative to obtain the package).
2. Set the required environmental variables:
   ```
   export RTE_SDK=$localPath/dpdk-19.11
   export RTE_TARGET=x86_64-native-linuxapp-icc                         
   export WIRELESS_SDK_TARGET_ISA=avx512                                
   export RPE_DIR=${flexranPath}/libs/ferrybridge
   export ROE_DIR=${flexranPath}/libs/roe
   export XRAN_DIR=${localPath}/flexran_xran
   export WIRELESS_SDK_TOOLCHAIN=icc 
   export DIR_WIRELESS_SDK_ROOT=${localPath}/wireless_sdk 
   export DIR_WIRELESS_FW=${localPath}/wireless_convergence_l1/framework
   export DIR_WIRELESS_TEST_4G=${localPath}/flexran_l1_4g_test 
   export DIR_WIRELESS_TEST_5G=${localPath}/flexran_l1_5g_test 
   export SDK_BUILD=build-${WIRELESS_SDK_TARGET_ISA}-icc 
   export DIR_WIRELESS_SDK=${DIR_WIRELESS_SDK_ROOT}/${SDK_BUILD} 
   export FLEXRAN_SDK=${DIR_WIRELESS_SDK}/install 
   export DIR_WIRELESS_TABLE_5G=${flexranPath}/bin/nr5g/gnb/l1/table    
   ```
   > Note: these environmental variables path has to be updated according to your installation and file/directory names  
3. Build L1, WLS interface between L1 and L2 and L2-Stub (testmac)    
   `./flexran_build.sh -r 5gnr_sub6 -m testmac -m wls -m l1app -b -c`
4. Once the build is successfully complete then copy the required binary files to the folder where docker image is built. The list of binary files that were used is documented in the [dockerfile](https://github.com/otcshare/edgeapps/blob/master/network-functions/ran/5G/flexRAN-gnb/Dockerfile)
   - ICC, IPP mpi and mkl Runtime 
   - DPDK build target directory 
   - FlexRAN test vectors (optional) 
   - FlexRAN L1 and testmac (L2-stub) binary 
   - FlexRAN SDK modules 
   - FlexRAN WLS share library 
   - FlexRAN CPA libraries 
5. `cd` to the folder where docker image is built and start the docker build ` docker build -t flexran-va:1.0 .` 

By the end of step 5 the FlexRAN docker image will be created. This image is copied to the edge node where FlexRAN will be deployed and that is installed with OpenNESS Network edge with all the required EPA features including Intel PACN3000 FPGA. Please refer to [Using FPGA in OpenNESS: Programming, Resource Allocation and Configuration](https://github.com/open-ness/specs/blob/master/doc/enhanced-platform-awareness/openness-fpga.md) document for further details for setting up Intel PACN3000 vRAN FPGA. 

# FlexRAN hardware platform configuration 
## BIOS 
FlexRAN on Skylake and Cascade lake require special BIOS configuration which involves disabling C-state and enabling Config TDP level-2.

## Host kernel command line

```
usbcore.autosuspend=-1 selinux=0 enforcing=0 nmi_watchdog=0 softlockup_panic=0 audit=0 intel_pstate=disable cgroup_memory=1 cgroup_enable=memory mce=off idle=poll isolcpus=1-23,25-47 rcu_nocbs=1-23,25-47 kthread_cpus=0,24 irqaffinity=0,24 nohz_full=1-23,25-47 hugepagesz=1G hugepages=50 default_hugepagesz=1G intel_iommu=on iommu=pt pci=realloc pci=assign-busses
```

Host kernel version - 3.10.0-1062.12.1.rt56.1042.el7.x86_64 

Instructions on how to configure kernel command line in OpenNESS can be found in [OpenNESS getting started documentation](https://github.com/otcshare/specs/blob/master/doc/getting-started/openness-experience-kits.md#customizing-kernel-grub-parameters-and-tuned-profile--variables-per-host)

# Deploying and Running the FlexRAN pod

1. Deploy the OpenNESS cluster with [SRIOV for FPGA enabled](https://github.com/otcshare/specs/blob/master/doc/enhanced-platform-awareness/openness-fpga.md#fpga-fec-ansible-installation-for-openness-network-edge) .
2. Ensure there are no FlexRAN pods and FPGA configuration pods are not deployed using `kubectl get pods`
3. Ensure all the EPA microservice and Enhancements (part of OpenNESS play book) are deployed `kubectl get po --all-namespaces` 
  ```yaml
  NAMESPACE     NAME                                      READY   STATUS    RESTARTS   AGE
  kube-ovn      kube-ovn-cni-8x5hc                        1/1     Running   17         7d19h
  kube-ovn      kube-ovn-cni-p6v6s                        1/1     Running   1          7d19h
  kube-ovn      kube-ovn-controller-578786b499-28lvh      1/1     Running   1          7d19h
  kube-ovn      kube-ovn-controller-578786b499-d8d2t      1/1     Running   3          5d19h
  kube-ovn      ovn-central-5f456db89f-l2gps              1/1     Running   0          7d19h
  kube-ovn      ovs-ovn-56c4c                             1/1     Running   17         7d19h
  kube-ovn      ovs-ovn-fm279                             1/1     Running   5          7d19h
  kube-system   coredns-6955765f44-2lqm7                  1/1     Running   0          7d19h
  kube-system   coredns-6955765f44-bpk8q                  1/1     Running   0          7d19h
  kube-system   etcd-silpixa00394960                      1/1     Running   0          7d19h
  kube-system   kube-apiserver-silpixa00394960            1/1     Running   0          7d19h
  kube-system   kube-controller-manager-silpixa00394960   1/1     Running   0          7d19h
  kube-system   kube-multus-ds-amd64-bpq6s                1/1     Running   17         7d18h
  kube-system   kube-multus-ds-amd64-jf8ft                1/1     Running   0          7d19h
  kube-system   kube-proxy-2rh9c                          1/1     Running   0          7d19h
  kube-system   kube-proxy-7jvqg                          1/1     Running   17         7d19h
  kube-system   kube-scheduler-silpixa00394960            1/1     Running   0          7d19h
  kube-system   kube-sriov-cni-ds-amd64-crn2h             1/1     Running   17         7d19h
  kube-system   kube-sriov-cni-ds-amd64-j4jnt             1/1     Running   0          7d19h
  kube-system   kube-sriov-device-plugin-amd64-vtghv      1/1     Running   0          7d19h
  kube-system   kube-sriov-device-plugin-amd64-w4px7      1/1     Running   0          4d21h
  openness      eaa-78b89b4757-7phb8                      1/1     Running   3          5d19h
  openness      edgedns-mdvds                             1/1     Running   16         7d18h
  openness      interfaceservice-tkn6s                    1/1     Running   16         7d18h
  openness      nfd-master-82dhc                          1/1     Running   0          7d19h
  openness      nfd-worker-h4jlt                          1/1     Running   37         7d19h
  openness      syslog-master-894hs                       1/1     Running   0          7d19h
  openness      syslog-ng-n7zfm                           1/1     Running   16         7d19h
  ```
4. Deploy the Kubernetes job to program the [FPGA](https://github.com/open-ness/specs/blob/master/doc/enhanced-platform-awareness/openness-fpga.md)
5. Deploy the Kubernetes job to configure the [BIOS](https://github.com/open-ness/specs/blob/master/doc/enhanced-platform-awareness/openness-bios.md) (note: only works on select Intel development platforms)
6. Deploy the Kubernetes job to configure the Intel PAC N3000 FPGA `kubectl create -f /opt/edgecontroller/fpga/fpga-config-job.yaml`
7. Deploy the FlexRAN Kubernetes pod `kubectl create -f flexran-va.yaml` - mor info [here](https://github.com/otcshare/specs/blob/master/doc/enhanced-platform-awareness/openness-fpga.md#fec-vf-configuration-for-openness-network-edge)
8. `exec` into FlexRAN pod `kubectl exec -it flexran -- /bin/bash`
9. Find the PCI Bus function device ID of the FPGA VF assigned to the pod:

   ```shell
   printenv | grep FEC
   ```

10. Edit `phycfg_timer.xml` used for configuration of L1 application with the PCI Bus function device ID from previous step in order to offload FEC to this device:

    ```xml
    <!--  DPDK FEC BBDEV to use             [0 - SW, 1 - FPGA, 2 - Both] -->
    <dpdkBasebandFecMode>1</dpdkBasebandFecMode>
    <!--  DPDK BBDev name added to the whitelist. The argument format is <[domain:]bus:devid.func> -->
    <dpdkBasebandDevice>0000:1d:00.1</dpdkBasebandDevice>
    ```
11. Once in the FlexRAN pod L1 and test-L2 (testmac) can be started.

# References

- FlexRAN 4G Reference Solution PHY Software Documentation - Document Number 572318
- FlexRAN Reference Solution Software Release Notes	- Document Number 575822
- FlexRAN 5GNR Reference Solution PHY Software Documentation - Document Number	603577