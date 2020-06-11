```text
SPDX-License-Identifier: Apache-2.0       
Copyright (c) 2020 Intel Corporation
```

- [Introduction](#introduction)
- [Architecture](#architecture)
- [Helm Installation](#helm-installation)
- [Helm Charts](#helm-charts)
- [References](#references)

# Introduction
Helm is a package manager for Kubernetes. It allows developers and operators easily to package, configure, and deploy applications and services onto the Kubernetes clusters (More details refer to [Helm Website]). OpenNESS Helm extends the OpenNESS OEK Ansible playbooks to the deployment of kuberenets packages, and provides a path for customer to upgrade without re-install.  The aim of this document is to familiarize the user with the OpenNESS Helm for the Network Edge. This guide will provide instructions on how to use openness helm. 

# Architecture
The below figure shows the architecture for the OpenNESS Helm in this document.
![OpenNESS Helm](openness-helm-images/openness-helm-arch.png)

_Figure - OpenNESS Helm Arch_


# Helm Installation
Helm 3 is used for OpenNESS, since it is more simple to use and secure than helm 2, thus provides more production-level for users. Helm installation is automatically conducted by OpenNESS OEK playbooks as below:
   ```
   - role: kubernetes/helm
   ```
To check whether helm is installed successfully, on the master run:
   ```
   # helm version
   version.BuildInfo{Version:"v3.1.2", GitCommit:"d878d4d45863e42fd5cff6743294a11d28a9abce", GitTreeState:"clean", GoVersion:"go1.13.8"}
   ```
# Helm Charts   
OpenNESS provides helm charts: 
* EPA, Telemetry and k8s plugins 
** CMK, NFD, FPGA Config, SRIOV, VPU and GPU Device Plugins
** Prometheus, NodeExporter, Cadvisor, Collectd, Opentelemetry, PCM and Grafana.
** CNI plugins including Multus and SRIOV CNI.
* 5G control plane pods including AF, NEF, OAM and CNTF.
* video analytics service. 
NOTE: NFD, CMK, Prometheus, NodeExporter and Grafana leverage existing third-party helm charts. (Refer to [Container Experience Kits] and [Helm Github Repo])

For the platform related helm charts, OpenNESS OEK ansible playbooks perform automatic charts generation and deploy the platform pods via the charts. All the helm chart files will be saved in the specific directly on the master. The modify directory, can change variable `ne_helm_charts_default_dir` in `group_vars/all/10-default.yml` file:
   ```yaml
   ne_helm_charts_default_dir: /opt/openness-helm-charts/
   ```

After completion of OpenNESS OEK, check the directory:
   ```
   # ls /opt/openness-helm-charts/
   vpu-plugin gpu-plugin collectd  otel_collector  prometheus
   ```

To check helm releases, run:
   ```
   # helm list
   NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                                           APP VERSION
   prometheus-adapter      default         1               2020-06-10 16:05:46.435712274 +0800 CST deployed        prometheus_custom_metrics_helm_chart-0.1.0      1.0
   intel-gpu-plugin        default         1               2020-05-08 03:10:05.464149345 +0800 CST deployed        intel-gpu-plugin-0.1.0                          0.17.0
   intel-vpu-plugin        default         1               2020-05-08 03:23:44.595413394 +0800 CST deployed        intel-vpu-plugin-0.1.0                          0.17.0
   ```
NOTE: Different OpenNESS flavors contain different platform features. So above is just an example for the helm charts.

Besides that, OpenNESS also provides helm charts for sample applications and services that can be deployed on the OpenNESS platform as below:
* CDN sample applications including CDN caching and CDN transcode
* Smart city application
* Telemetry sample application
* EIS sample application

The usage of invididual helm chart can refer to [OpenNESS specs repos](https://github.com/otcshare/specs). 

# References
- [Helm Website](https://helm.sh)
- [Container Experience Kits](https://github.com/intel/container-experience-kits)
- [Helm Github Repo](https://github.com/helm/charts)
