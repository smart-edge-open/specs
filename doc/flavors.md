```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# OpenNESS Deployment Flavors
This document introduces the supported deployment flavors that are deployable through the OpenNESS Experience Kits (OEK).
- [Minimal Flavor](#minimal-flavor)
- [FlexRAN Flavor](#flexran-flavor)
- [Media Analytics Flavor](#media-analytics-flavor)
- [Media Analytics Flavor with VCAC-A](#media-analytics-flavor-with-vcac-a)
- [CDN Transcode Flavor](#cdn-transcode-flavor)
- [CDN Caching Flavor](#cdn-caching-flavor)

## Minimal Flavor
The pre-defined *minimal* deployment flavor provisions the minimal set of configurations for bringing up the OpenNESS network edge deployment.

The steps to get it installed are as the following:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f minimal
    ```

This deployment flavor enables the following ingredients:
* Node Feature Discovery
* The default Kubernetes CNI: `kube-ovn`
* Telemetry

## FlexRAN Flavor 
<todo>

## Media Analytics Flavor
The pre-defined *media-analytics* deployment flavor provisions an optimized system configuration for media analytics workloads on Intel Xeon servers. It also provisions a set of video analytics services based on the [Video Analytics Serving](https://github.com/intel/video-analytics-serving) for analytics pipeline management and execution.

The steps to get it installed are as the following:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f media-analytics
    ```

This deployment flavor enables the following ingredients:
* Node Feature Discovery
* VPU & GPU device plugins
* HDDL daemonset
* The default Kubernetes CNI: `kube-ovn`
* Video analytics services
* Telemetry

## Media Analytics Flavor with VCAC-A
The pre-defined *media-analytics-vca* deployment flavor provisions an optimized system configuration for media analytics workloads leveraging VCAC-A acceleration. It also provisions a set of video analytics services based on the [Video Analytics Serving](https://github.com/intel/video-analytics-serving) for analytics pipeline management and execution.

The steps to get it installed are as following:
1. Configure OEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Add the VCA host name in the [edgenode_vca_group] group in `inventory.ini` file of the OEK, e.g:
    ```
    [edgenode_vca_group]
    silpixa00400194
    ```
3. Run OEK deployment script:
    ```shell
    $ deploy_ne.sh -f media-analytics-vca
    ```

> **NOTE:** At the time of writing this document, *Weave Net* is the only supported CNI for network edge deployments involving VCAC-A acceleration. The `weavenet` CNI is automatically selected by the *media-analytics-vca*.

This deployment flavor enables the following ingredients:
* Node Feature Discovery
* VPU & GPU device plugins
* HDDL daemonset
* The `weavenet` Kubernetes CNI
* Video analytics services
* Telemetry

## CDN Transcode Flavor
<todo>

## CDN Caching Flavor
<todo>
