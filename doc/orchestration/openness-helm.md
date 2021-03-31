```text
SPDX-License-Identifier: Apache-2.0       
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# Helm support in OpenNESS

- [Introduction](#introduction)
- [Architecture](#architecture)
- [Helm Installation](#helm-installation)
- [Helm Charts](#helm-charts)
- [References](#references)

## Introduction
Helm is a package manager for Kubernetes\*. It allows developers and operators to easily package, configure, and deploy applications and services onto Kubernetes clusters. For details refer to the [Helm Website](https://helm.sh). With OpenNESS, Helm is used to extend the [Converged Edge Experience Kits](https://github.com/open-ness/converged-edge-experience-kits) Ansible\* playbooks to deploy Kubernetes packages. Helm adds considerable flexibility. It enables users to upgrade an existing installation without requiring a re-install. It provides the option to selectively deploy individual microservices if a full installation of OpenNESS is not needed. And it provides a standard process to deploy different applications or network functions. This document aims to familiarize the user with Helm and provide instructions on how to use the specific Helm charts available for OpenNESS. 

## Architecture
The below figure shows the architecture for the OpenNESS Helm in this document.
![OpenNESS Helm](openness-helm-images/openness-helm-arch.png)

_Figure - Helm Architecture in OpenNESS_


## Helm Installation
Helm 3 is used for OpenNESS. The installation is automatically conducted by the [Converged Edge Experience Kits](https://github.com/open-ness/converged-edge-experience-kits) Ansible playbooks as below:
   ```yaml
   - role: kubernetes/helm
   ```
To check whether helm is installed successfully, run the following command on the OpenNESS controller:
   ```bash
   $ helm version
   version.BuildInfo{Version:"v3.1.2", GitCommit:"d878d4d45863e42fd5cff6743294a11d28a9abce", GitTreeState:"clean", GoVersion:"go1.13.8"}
   ```
## Helm Charts   
OpenNESS provides the following helm charts: 
- EPA, Telemetry, and k8s plugins: 
  - CMK, NFD, FPGA Config, SRIOV, VPU, and GPU Device Plugins
  - Prometheus\*, NodeExporter, Cadvisor, Collectd, Opentelemetry, PCM, and Grafana\*
  - CNI plugins including Multus\* and SRIOV CNI
  - Video analytics service
  - 5G control plane pods including AF, NEF, OAM, and CNTF
> **NOTE**: NFD, CMK, Prometheus, NodeExporter, and Grafana leverage existing third-party helm charts: [Container Experience Kits](https://github.com/intel/container-experience-kits) and [Helm GitHub\* Repo](https://github.com/helm/charts). For other helm charts, [Converged Edge Experience Kits](https://github.com/open-ness/converged-edge-experience-kits) Ansible playbooks perform automatic charts generation and deployment.

- Sample applications, network functions, and services that can be deployed and verified on the OpenNESS platform:
  - Applications
    - [CDN Caching Application Helm Charts](https://github.com/open-ness/edgeapps/tree/master/applications/cdn-caching)
    - [CDN Transcode Application Helm Charts](https://github.com/OpenVisualCloud/CDN-Transcode-Sample/tree/master/deployment/kubernetes/helm) (Leverage OpenVisualCloud) 
    - [Smart City Application Helm Charts](https://github.com/OpenVisualCloud/Smart-City-Sample/tree/master/deployment/kubernetes/helm) (Leverage OpenVisualCloud)
    - [Telemetry Sample Application Helm Charts](https://github.com/open-ness/edgeapps/tree/master/applications/telemetry-sample-app)
    - [EIS Sample Application Helm Charts](https://github.com/open-ness/edgeapps/tree/master/applications/eis-experience-kit)
  - Network Functions
    - [FlexRAN Helm Charts](https://github.com/open-ness/edgeapps/tree/master/network-functions/ran/charts/du-dev)
    - [xRAN Helm Charts](https://github.com/open-ness/edgeapps/tree/master/network-functions/xran/helmcharts/xranchart)
    - [UPF Helm Charts](https://github.com/open-ness/edgeapps/tree/master/network-functions/core-network/charts/upf)

The EPA, Telemetry, and k8s plugins helm chart files will be saved in a specific directory on the OpenNESS controller. To modify the directory, change the following variable `ne_helm_charts_default_dir` in the `inventory/default/group_vars/all/10-default.yml` file:
   ```yaml
   ne_helm_charts_default_dir: /opt/openness/helm-charts/
   ```

To check helm charts files, run the following command on the OpenNESS controller:
   ```bash
   $ ls /opt/openness/helm-charts/
   vpu-plugin gpu-plugin node-feature-discovery prometheus
   ```

To check helm releases, run:
   ```bash
   $ helm list -A
   NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                                APP VERSION
   nfd-release             openness        1               2020-05-08 05:13:54.900713372 +0800 CST deployed        node-feature-discovery-0.5.0         0.5.0
   prometheus              telemetry       1               2020-05-08 05:12:09.346590474 +0800 CST deployed        prometheus-11.1.6                    2.16.0
   intel-gpu-plugin        default         1               2020-05-08 03:10:05.464149345 +0800 CST deployed        intel-gpu-plugin-0.1.0               0.17.0
   intel-vpu-plugin        default         1               2020-05-08 03:23:44.595413394 +0800 CST deployed        intel-vpu-plugin-0.1.0               0.17.0
   ```
> **NOTE**: Different OpenNESS flavors contain different platform features. This is just an example of the helm charts.

To see the values that took effect for a specific release (for example, `nfd-release`), run:
   ```bash
   $ helm get values nfd-release -n openness
   USER-SUPPLIED VALUES:
   image:
      repository: 10.240.224.84:5000/node-feature-discovery
      tag: v0.5.0
   serviceAccount:
      name: nfd-master
   weavenet_cidr: 10.32.0.0/12
   weavenet_cidr_enabled: false
   ```

To customize values and upgrade, users can modify the `values.yaml` file for the helm charts and use `helm upgrade`. Refer to the [Helm CLI Commands List](https://helm.sh/docs/helm/) for details.


## References
- [Helm Website](https://helm.sh)
- [Container Experience Kits](https://github.com/intel/container-experience-kits)
- [Helm Github Repo](https://github.com/helm/charts)
