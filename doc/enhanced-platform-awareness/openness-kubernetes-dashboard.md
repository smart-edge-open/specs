```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```
<!-- omit in toc -->
# Kubernetes Dashboard in OpenNESS
- [Overview](#overview)
- [Details - Kubernetes Dashboard support in OpenNESS](#details---kubernetes-dashboard-support-in-openness)
  - [TLS encryption](#tls-encryption)
  - [Usage](#usage)
  - [Access rights](#access-rights)
- [Reference](#reference)

## Overview

Kubernetes Dashboard is a web user interface for Kubernetes. User can use Dashboard to check the state of deployed pods, get information about all kinds of deployments that are being run on cluster and be provided with lots of useful insights about cluster and running applications. In OpenNESS environment Kubernetes Dashboard will be deployed with read-only access to all information except Kubernetes' Secrets. User can modify this role to disable or enable accesses as explained in [Access rights](#access-rights) chapter of this document.

## Details - Kubernetes Dashboard support in OpenNESS

Kubernetes Dashboard is disabled by default in OpenNESS Experience Kits. It can be enabled by setting variable `kubernetes_dashboard_enable` in `group_vars/all/10-default.yml` file to `true` value:

```yaml
# Kubernetes Dashboard
kubernetes_dashboard_enable: false # set to true to enable Kubernetes Dashboard
```

### TLS encryption

TLS for Kubernetes dashboard is enabled by default. User can disable TLS encryption using variable `disable_dashboard_tls` in `group_vars/all/10-default.yml`:

```yaml
disable_dashboard_tls: false # set to true to disable TLS
```

### Usage

User can use Kubernetes Dashboard by browsing `https://<controller_ip>:30443` if TLS is enabled or `http://<controller_ip>:30443` if TLS is disabled.

With TLS enabled Kubernetes Dashboard will prompt for `Kubernetes Service Account token` to log in user. You can get the token by executing the following command on your controller:

```bash
kubectl describe secret -n kube-system $(kubectl get secret -n kube-system | grep 'kubernetes-dashboard-token' | awk '{print $1}') | grep 'token:' | awk '{print $2}'
```

> NOTE: To use Kubernetes Dashboard with TLS encryption user will have to add `https://<controller_ip>:30443` to web browser's list of security exceptions.

### Access rights

By default OpenNESS will deploy Kubernetes Dashboard with read-only access to every information except Kubernetes' secrets. To change access rights (for example hide information about persistent volumes claims, etc.) please modify cluster role defined in `roles/kubernetes/dashboard/files/clusterrole.yml` of OpenNESS Experience Kits.

## Reference
- [Kubernetes Dashboard](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/)
