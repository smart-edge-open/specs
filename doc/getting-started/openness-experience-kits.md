```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# OpenNESS Experience Kits

- [OpenNESS Experience Kits](#openness-experience-kits)
  - [Purpose](#purpose)
  - [OpenNESS setup playbooks](#openness-setup-playbooks)
  - [Playbooks for OpenNESS offline deployment](#playbooks-for-openness-offline-deployment)
  - [Customizing kernel, grub parameters, and tuned profile & variables per host.](#customizing-kernel-grub-parameters-and-tuned-profile--variables-per-host)
    - [Default values](#default-values)
    - [Use newer realtime kernel (3.10.0-1062)](#use-newer-realtime-kernel-3100-1062)
    - [Use newer non-rt kernel (3.10.0-1062)](#use-newer-non-rt-kernel-3100-1062)
    - [Use tuned 2.9](#use-tuned-29)
    - [Default kernel and configure tuned](#default-kernel-and-configure-tuned)
    - [Change amount of hugepages](#change-amount-of-hugepages)
    - [Change the size of hugepages](#change-the-size-of-hugepages)
    - [Change amount & size of hugepages](#change-amount--size-of-hugepages)
    - [Remove Intel IOMMU from grub params](#remove-intel-iommu-from-grub-params)
    - [Add custom GRUB parameter](#add-custom-grub-parameter)
    - [Configure OVS-DPDK inside kube-ovn](#configure-ovs-dpdk-in-kube-ovn)

## Purpose

OpenNESS Experience Kits repository contains set of Ansible playbooks for:

- easy setup of OpenNESS in **Network Edge** and **On-Premise** modes
- preparation and deployment of the **offline package** (i.e. package for OpenNESS offline deployment in On-Premise mode)

## OpenNESS setup playbooks



## Playbooks for OpenNESS offline deployment

When Edge Controller and Edge Node machines have no internet access and the networking between them is only local, it is possible to deploy OpenNESS using **offline package**. Following ansible playbooks are provided:

- playbooks that download all the packages and dependencies to the local folder and create offline package archive file;
- playbooks that unpack the archive file and install packages.

## Customizing kernel, grub parameters, and tuned profile & variables per host.

>NOTE: Following per-host customizations in host_vars files are not currently supported in Offline On-Premises mode.

OpenNESS Experience Kits allows user to customize kernel, grub parameters, and tuned profile by leveraging Ansible's feature of host_vars.

OpenNESS Experience Kits contains `host_vars/` directory that can be used to place a YAML file (`nodes-inventory-name.yml`, e.g. `node01.yml`). The file would contain variables that would override roles' default values.

To override the default value, place the variable's name and new value in the host's vars file, e.g. contents of `host_vars/node01.yml` that would result in skipping kernel customization on that node:

```yaml
kernel_skip: true
```

Below are several common customization scenarios.


### Default values
Here are several default values:

```yaml
# --- machine_setup/custom_kernel
kernel_skip: false  # use this variable to disable custom kernel installation for host

kernel_repo_url: http://linuxsoft.cern.ch/cern/centos/7/rt/CentOS-RT.repo
kernel_repo_key: http://linuxsoft.cern.ch/cern/centos/7/os/x86_64/RPM-GPG-KEY-cern
kernel_package: kernel-rt-kvm
kernel_devel_package: kernel-rt-devel
kernel_version: 3.10.0-957.21.3.rt56.935.el7.x86_64

kernel_dependencies_urls: []
kernel_dependencies_packages: []


# --- machine_setup/grub
hugepage_size: "2M" # Or 1G
hugepage_amount: "5000"

default_grub_params: "hugepagesz={{ hugepage_size }} hugepages={{ hugepage_amount }} intel_iommu=on iommu=pt"
additional_grub_params: ""


# --- machine_setup/configure_tuned
tuned_skip: false   # use this variable to skip tuned profile configuration for host
tuned_packages:
- http://linuxsoft.cern.ch/cern/centos/7/updates/x86_64/Packages/tuned-2.11.0-5.el7_7.1.noarch.rpm
- http://linuxsoft.cern.ch/scientific/7x/x86_64/updates/fastbugs/tuned-profiles-realtime-2.11.0-5.el7_7.1.noarch.rpm
tuned_profile: realtime
tuned_vars: |
  isolated_cores=2-3
  nohz=on
  nohz_full=2-3
```

### Use newer realtime kernel (3.10.0-1062)
By default, `kernel-rt-kvm-3.10.0-957.21.3.rt56.935.el7.x86_64` from `http://linuxsoft.cern.ch/cern/centos/$releasever/rt/$basearch/` repository is installed.

In order to use another version, e.g. `kernel-rt-kvm-3.10.0-1062.9.1.rt56.1033.el7.x86_64` just create host_var file for the host with content:
```yaml
kernel_version: 3.10.0-1062.9.1.rt56.1033.el7.x86_64
```

### Use newer non-rt kernel (3.10.0-1062)
The OEK installs realtime kernel by default from specific repository. However, the non-rt kernel are present in the official CentOS repository.
Therefore, in order to use a newer non-rt kernel, following overrides must be applied:
```yaml
kernel_repo_url: ""                           # package is in default repository, no need to add new repository
kernel_package: kernel                        # instead of kernel-rt-kvm
kernel_devel_package: kernel-devel            # instead of kernel-rt-devel
kernel_version: 3.10.0-1062.el7.x86_64

dpdk_kernel_devel: ""  # kernel-devel is in the repository, no need for url with RPM

# Since, we're not using rt kernel, we don't need a tuned-profiles-realtime but want to keep the tuned 2.11
tuned_packages:
- http://linuxsoft.cern.ch/cern/centos/7/updates/x86_64/Packages/tuned-2.11.0-5.el7_7.1.noarch.rpm
tuned_profile: balanced
tuned_vars: ""
```

### Use tuned 2.9
```yaml
tuned_packages:
- tuned-2.9.0-1.el7fdp
- tuned-profiles-realtime-2.9.0-1.el7fdp
```

### Default kernel and configure tuned
```yaml
kernel_skip: true     # skip kernel customization altogether

# update tuned to 2.11, but don't install tuned-profiles-realtime since we're not using rt kernel
tuned_packages:
- http://linuxsoft.cern.ch/cern/centos/7/updates/x86_64/Packages/tuned-2.11.0-5.el7_7.1.noarch.rpm
tuned_profile: balanced
tuned_vars: ""
```

### Change amount of hugepages
```yaml
hugepage_amount: "1000"   # default is 5000
```

### Change the size of hugepages
```yaml
hugepage_size: "1G"   # default is 2M
```

### Change amount & size of hugepages
```yaml
hugepage_amount: "10"   # default is 5000
hugepage_size: "1G"     # default is 2M
```

### Remove Intel IOMMU from grub params
```yaml
default_grub_params: "hugepagesz={{ hugepage_size }} hugepages={{ hugepage_amount }}"
```

### Add custom GRUB parameter
```yaml
additional_grub_params: "debug"
```

### Configure ovs-dpdk in kube-ovn
By default OVS-DPDK is enabled. To be able to disable it please set a flag:
```yaml
ovs_dpdk: false
```
Additionally hugepages in ovs pod can be adjusted once default hugepage settings are changed. 
```yaml
ovs_dpdk_hugepage_size: "2Mi"
ovs_dpdk_hugepages: "1Gi"
```
OVS pods limits are configured by:
```yaml
ovs_dpdk_resources_requests: "1Gi"
ovs_dpdk_resources_limits: "1Gi"
```
CPU settings can be configured using:
```yaml
ovs_dpdk_pmd_cpu_mask: "0x4"
ovs_dpdk_lcore_mask: "0x2"
```