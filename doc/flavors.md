```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# OpenNESS Deployment Flavors
This document introduces the supported deployment flavors that are deployable through the OpenNESS Experience Kits (OEK).
- [CERA Minimal Flavor](#cera-minimal-flavor)
- [CERA Access Edge Flavor](#cera-access-edge-flavor)
- [CERA Media Analytics Flavor](#cera-media-analytics-flavor)
- [CERA Media Analytics Flavor with VCAC-A](#cera-media-analytics-flavor-with-vcac-a)
- [CERA CDN Transcode Flavor](#cera-cdn-transcode-flavor)
- [CERA CDN Caching Flavor](#cera-cdn-caching-flavor)
- [CERA Core Control Plane Flavor](#cera-core-control-plane-flavor)
- [CERA Core User Plane Flavor](#cera-core-user-plane-flavor)
- [CERA Untrusted Non3gpp Access Flavor](#cera-untrusted-non3gpp-access-flavor)
- [CERA Near Edge Flavor](#cera-near-edge-flavor)
- [CERA 5G On-Prem Flavor](#cera-5g-on-prem-flavor)
- [Central Orchestrator Flavor](#central-orchestrator-flavor)
- [Reference Service Mesh](#reference-service-mesh)

## CERA Minimal Flavor

The pre-defined *minimal* deployment flavor provisions the minimal set of configurations for bringing up the OpenNESS network edge deployment.

Steps to install this flavor are as follows:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f minimal
    ```

This deployment flavor enables the following ingredients:
* Node Feature Discovery
* The default Kubernetes CNI: `kube-ovn`
* Telemetry

## CERA Access Edge Flavor

The pre-defined *flexran* deployment flavor provisions an optimized system configuration for vRAN workloads on Intel Xeon servers. It also provisions for deployment of PACN3000 FPGA tools and components enabling the offload of acceleration of FEC (Forward Error Correction) to the FPGA.

Steps to install this flavor are as follows:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Configure the flavor file to reflect desired deployment.
   - Configure the CPUs selected for isolation and OS/K8s processes from command line in files [controller_group.yml](https://github.com/otcshare/openness-experience-kits/blob/master/flavors/flexran/controller_group.yml) and [edgenode_group.yml](https://github.com/otcshare/openness-experience-kits/blob/master/flavors/flexran/edgenode_group.yml) - please note that in single node mode the edgenode_group.yml is used to configure the CPU isolation.
   - Configure the amount of CPUs reserved for K8s and OS from K8s level with `reserved_cpu` flag in [all.yml](https://github.com/otcshare/openness-experience-kits/blob/master/flavors/flexran/all.yml) file.
   - Configure whether the FPGA or eASIC support for FEC is desired or both in [all.yml](https://github.com/otcshare/openness-experience-kits/blob/master/flavors/flexran/all.yml) file.
  
3. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f flexran
    ```
This deployment flavor enables the following ingredients:
* Node Feature Discovery
* SRIOV device plugin with FPGA configuration
* Calico CNI
* Telemetry
* FPGA remote system update through OPAE
* FPGA configuration
* eASIC ACC100 configuration
* RT Kernel
* Tapology Manager
* RMD operator

## CERA Media Analytics Flavor

The pre-defined *media-analytics* deployment flavor provisions an optimized system configuration for media analytics workloads on Intel Xeon servers. It also provisions a set of video analytics services based on the [Video Analytics Serving](https://github.com/intel/video-analytics-serving) for analytics pipeline management and execution.

Steps to install this flavor are as follows:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f media-analytics
    ```

> **NOTE:** The video analytics services integrates with the OpenNESS service mesh when the flag `ne_istio_enable: true` is set.
> **NOTE:** Kiali management console username can be changed by editing the variable `istio_kiali_username`. By default `istio_kiali_password` is randomly generated and can be retirieved by running `kubectl get secrets/kiali -n istio-system -o json | jq -r '.data.passphrase' | base64 -d` on the Kubernetes controller.

This deployment flavor enables the following ingredients:
* Node Feature Discovery
* The default Kubernetes CNI: `kube-ovn`
* Video analytics services
* Telemetry
* Istio service mesh - conditional
* Kiali management console - conditional

## CERA Media Analytics Flavor with VCAC-A

The pre-defined *media-analytics-vca* deployment flavor provisions an optimized system configuration for media analytics workloads leveraging VCAC-A acceleration. It also provisions a set of video analytics services based on the [Video Analytics Serving](https://github.com/intel/video-analytics-serving) for analytics pipeline management and execution.

Steps to install this flavor are as follows:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Add the VCA host name in the `[edgenode_vca_group]` group in `inventory.ini` file of the OEK, e.g:
    ```
    [edgenode_vca_group]
    silpixa00400194
    ```
    > **NOTE:** The VCA host name should *only* be placed once in the `inventory.ini` file and under the `[edgenode_vca_group]` group. 

3. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f media-analytics-vca
    ```

> **NOTE:** At the time of writing this document, *Weave Net* is the only supported CNI for network edge deployments involving VCAC-A acceleration. The `weavenet` CNI is automatically selected by the *media-analytics-vca*. 
> **NOTE:** The flag `force_build_enable` (default true) supports force build VCAC-A system image (VCAD) by default, it is defined in flavors/media-analytics-vca/all.yml. By setting the flag as false, OEK will not rebuild the image and re-use the last system image built during deployment. If the flag is true, OEK will force build VCA host kernel and node system image which will take several hours.

This deployment flavor enables the following ingredients:
* Node Feature Discovery
* VPU & GPU device plugins
* HDDL daemonset
* The `weavenet` Kubernetes CNI
* Video analytics services
* Telemetry

## CERA CDN Transcode Flavor

The pre-defined *cdn-transcode* deployment flavor provisions an optimized system configuration for cdn transcode sample workloads on Intel Xeon servers. 

Steps to install this flavor are as follows:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f cdn-transcode
    ```

This deployment flavor enables the following ingredients:
* Node Feature Discovery
* The default Kubernetes CNI: `kube-ovn`
* Telemetry

## CERA CDN Caching Flavor

The pre-defined *cdn-caching* deployment flavor provisions an optimized system configuration for cdn content delivery workloads on Intel Xeon servers. 

Steps to install this flavor are as follows:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f cdn-caching
    ```

This deployment flavor enables the following ingredients:
* Node Feature Discovery
* The `kube-ovn` and `sriov` Kubernetes CNI
* Telemetry
* Kubernetes Topology Manager policy: `single-numa-node`

## CERA Core Control Plane Flavor

Available in Intel Distribution of OpenNESS
  
## CERA Core User Plane Flavor

Available in Intel Distribution of OpenNESS
  
## CERA Untrusted Non3gpp Access Flavor

Available in Intel Distribution of OpenNESS
  
## CERA Near Edge Flavor

Available in Intel Distribution of OpenNESS
  
## CERA 5G On-Prem Flavor

Available in Intel Distribution of OpenNESS

## Central Orchestrator Flavor

Central Orchestrator Flavor is used to deploy EMCO.  

The pre-defined *orchestration* deployment flavor provisions an optimized system configuration for emco (central orchestrator) workloads on Intel Xeon servers. It also provisions a set of central orchestrator services for [edge, multiple clusters orchestration](building-blocks/emco/openness-emco.md).

Steps to install this flavor are as follows:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f central_orchestrator
    ```

This deployment flavor enables the following ingredients:
* Harbor Registry
* The default Kubernetes CNI: `kube-ovn`
* EMCO services

## Reference Service Mesh

The pre-defined *service-mesh* deployment flavor installs the OpenNESS service mesh that is based on [Istio](https://istio.io/).

Steps to install this flavor are as follows:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f service-mesh
    ```

This deployment flavor enables the following ingredients:
* Node Feature Discovery
* The default Kubernetes CNI: `kube-ovn`
* Istio service mesh
* Kiali management console
* Telemetry

> **NOTE:** Kiali management console username can be changed by editing the variable `istio_kiali_username`. By default `istio_kiali_password` is randomly generated and can be retirieved by running `kubectl get secrets/kiali -n istio-system -o json | jq -r '.data.passphrase' | base64 -d` on the Kubernetes controller.

Following parameters in the flavor/all.yaml can be customize for Istio deployment:

```
# Istio deployment profile possible values: default, demo, minimal, remote
istio_deployment_profile: "default"

# Kiali 
istio_kiali_username: "admin"
istio_kiali_password: "{{ lookup('password', '/dev/null length=16') }}"
istio_kiali_nodeport: 30001
```

> **NOTE:** If creating a customized flavor, the Istio service mesh installation can be included in the Ansible playbook by setting the flag `ne_istio_enable: true` in the flavor file.
