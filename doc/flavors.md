```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# OpenNESS Deployment Flavors
This document introduces the supported deployment flavors that are deployable through the Converged Edge Experience Kits (CEEK).

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

The following are steps to install this flavor:
1. Configure the CEEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Update the `inventory.yaml` file by setting the deployment flavor as `minimal`
    ```yaml
    ---
    all:
      vars:
        cluster_name: minimal_cluster
        flavor: minimal
    ... 
    ```
3. Run CEEK deployment script:
    ```shell
    $ python3 deploy.py
    ```

This deployment flavor enables the following ingredients:
* Node feature discovery
* The default Kubernetes CNI: `calico`
* Telemetry

To customize this flavor we recommend creating additional file in converged-edge-experience-kits that will override any variables used in previous configuration. This file should be placed in location: `converged-edge-experience-kits/inventory/default/group_vars/all` and filenames should start with number greater than highest value currently present (e.g. `40-overrides.yml`).


## CERA Access Edge Flavor

Available in Intel Distribution of OpenNESS

## CERA Media Analytics Flavor

The pre-defined *media-analytics* deployment flavor provisions an optimized system configuration for media analytics workloads on Intel® Xeon® platforms. It also provisions a set of video analytics services based on the [Video Analytics Serving](https://github.com/intel/video-analytics-serving) for analytics pipeline management and execution.

The following are steps to install this flavor:
1. Configure the CEEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Update the `inventory.yaml` file by setting the deployment flavor as `media-analytics`
    ```yaml
    ---
    all:
      vars:
        cluster_name: media_analytics_cluster
        flavor: media-analytics
    ... 
    ```
3. Run CEEK deployment script:
    ```shell
    $ python3 deploy.py
    ```

> **NOTE:** The video analytics services integrates with the OpenNESS service mesh when the flag `ne_istio_enable: true` is set.
> **NOTE:** Kiali management console username can be changed by editing the variable `istio_kiali_username`. By default `istio_kiali_password` is randomly generated and can be retirieved by running `kubectl get secrets/kiali -n istio-system -o json | jq -r '.data.passphrase' | base64 -d` on the Kubernetes controller.

This deployment flavor enables the following ingredients:
* Node feature discovery
* The default Kubernetes CNI: `calico`
* Video analytics services
* Telemetry
* Istio service mesh - conditional
* Kiali management console - conditional

## CERA Media Analytics Flavor with VCAC-A

The pre-defined *media-analytics-vca* deployment flavor provisions an optimized system configuration for media analytics workloads leveraging Visual Cloud Accelerator Card for Analytics (VCAC-A) acceleration. It also provisions a set of video analytics services based on the [Video Analytics Serving](https://github.com/intel/video-analytics-serving) for analytics pipeline management and execution.

The following are steps to install this flavor:
1. Configure the CEEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Add the VCA host name in the `edgenode_vca_group:` group in `inventory.yml` file of the CEEK, e.g:
    ```yaml
    edgenode_vca_group:
      hosts:
        vca-node01.openness.org:
        ansible_host: 172.16.0.1
        ansible_user: openness
    ```
    > **NOTE:** The VCA host name should *only* be placed once in the `inventory.yml` file and under the `edgenode_vca_group:` group. 

3. Update the `inventory.yaml` file by setting the deployment flavor as `media-analytics-vca`
    ```yaml
    ---
    all:
      vars:
        cluster_name: media_analytics_vca_cluster
        flavor: media-analytics-vca
    ... 
    ```

4. Run CEEK deployment script:
    ```shell
    $ python3 deploy.py
    ```

> **NOTE:** At the time of writing this document, *Weave Net*\* is the only supported CNI for network edge deployments involving VCAC-A acceleration. The `weavenet` CNI is automatically selected by the *media-analytics-vca*. 
> **NOTE:** The flag `force_build_enable` (default true) supports force build VCAC-A system image (VCAD) by default, it is defined in flavors/media-analytics-vca/all.yml. By setting the flag as false, CEEK will not rebuild the image and re-use the last system image built during deployment. If the flag is true, CEEK will force build VCA host kernel and node system image which will take several hours.

This deployment flavor enables the following ingredients:
* Node feature discovery
* VPU and GPU device plugins
* HDDL daemonset
* The `weavenet` Kubernetes CNI
* Video analytics services
* Telemetry

## CERA CDN Transcode Flavor

The pre-defined *cdn-transcode* deployment flavor provisions an optimized system configuration for Content Delivery Network (CDN) transcode sample workloads on Intel® Xeon® platforms.

The following are steps to install this flavor:
1. Configure the CEEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Update the `inventory.yaml` file by setting the deployment flavor as `cdn-transcode`
    ```yaml
    ---
    all:
      vars:
        cluster_name: cdn_transcode_cluster
        flavor: cdn-transcode
    ... 
    ```
3. Run CEEK deployment script:
    ```shell
    $ python3 deploy.py
    ```

This deployment flavor enables the following ingredients:
* Node feature discovery
* The default Kubernetes CNI: `calico`
* Telemetry

## CERA CDN Caching Flavor

The pre-defined *cdn-caching* deployment flavor provisions an optimized system configuration for CDN content delivery workloads on Intel® Xeon® platforms.

The following are steps to install this flavor:
1. Configure the CEEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Update the `inventory.yaml` file by setting the deployment flavor as `cdn-caching`
    ```yaml
    ---
    all:
      vars:
        cluster_name: cdn_caching_cluster
        flavor: cdn-caching
    ... 
    ```
3. Run CEEK deployment script:
    ```shell
    $ python3 deploy.py
    ```

This deployment flavor enables the following ingredients:
* Node feature discovery
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

The following are steps to install this flavor:
1. Configure the CEEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Update the `inventory.yaml` file by setting the deployment flavor as `central_orchestrator`
    ```yaml
    ---
    all:
      vars:
        cluster_name: central_orchestrator_cluster
        flavor: central_orchestrator
    ... 
    ```
3. Run CEEK deployment script:
    ```shell
    $ python3 deploy.py
    ```

This deployment flavor enables the following ingredients:
* Harbor Registry
* The default Kubernetes CNI: `calico`
* EMCO services

## Reference Service Mesh

The pre-defined *service-mesh* deployment flavor installs the OpenNESS service mesh that is based on [Istio](https://istio.io/).

> **NOTE**: When deploying Istio Service Mesh in VMs, a minimum of 8 CPU core and 16GB RAM must be allocated to each worker VM so that Istio operates smoothly

The following are steps to install this flavor:
1. Configure the CEEK as described in the [OpenNESS Getting Started Guide for Network Edge](getting-started/network-edge/controller-edge-node-setup.md).
2. Update the `inventory.yaml` file by setting the deployment flavor as `service-mesh`
    ```yaml
    ---
    all:
      vars:
        cluster_name: service_mesh_cluster
        flavor: service-mesh
    ... 
    ```
3. Run CEEK deployment script:
    ```shell
    $ python3 deploy.py
    ```

This deployment flavor enables the following ingredients:
* Node feature discovery
* The default Kubernetes CNI: `kube-ovn`
* Istio service mesh
* Kiali management console
* Telemetry

> **NOTE:** Kiali management console username can be changed by editing the variable `istio_kiali_username`. By default `istio_kiali_password` is randomly generated and can be retirieved by running `kubectl get secrets/kiali -n istio-system -o json | jq -r '.data.passphrase' | base64 -d` on the Kubernetes controller.

Following parameters in the flavor/all.yaml can be customize for Istio deployment:

```code 
# Istio deployment profile possible values: default, demo, minimal, remote
istio_deployment_profile: "default"

# Kiali 
istio_kiali_username: "admin"
istio_kiali_password: "{{ lookup('password', '/dev/null length=16') }}"
istio_kiali_nodeport: 30001
```

> **NOTE:** If creating a customized flavor, the Istio service mesh installation can be included in the Ansible playbook by setting the flag `ne_istio_enable: true` in the flavor file.
