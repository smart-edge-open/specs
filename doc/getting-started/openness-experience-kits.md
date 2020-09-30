```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```
<!-- omit in toc -->
# OpenNESS Experience Kits
- [Purpose](#purpose)
- [OpenNESS setup playbooks](#openness-setup-playbooks)
- [Customizing kernel, grub parameters, and tuned profile & variables per host](#customizing-kernel-grub-parameters-and-tuned-profile--variables-per-host)
  - [IP address range allocation for various CNIs and interfaces](#ip-address-range-allocation-for-various-cnis-and-interfaces)
  - [Default values](#default-values)
  - [Use newer realtime kernel (3.10.0-1062)](#use-newer-realtime-kernel-3100-1062)
  - [Use newer non-rt kernel (3.10.0-1062)](#use-newer-non-rt-kernel-3100-1062)
  - [Use tuned 2.9](#use-tuned-29)
  - [Default kernel and configure tuned](#default-kernel-and-configure-tuned)
  - [Change amount of HugePages](#change-amount-of-hugepages)
  - [Change size of HugePages](#change-size-of-hugepages)
  - [Change amount and size of HugePages](#change-amount-and-size-of-hugepages)
  - [Remove input output memory management unit (IOMMU) from grub params](#remove-input-output-memory-management-unit-iommu-from-grub-params)
  - [Add custom GRUB parameter](#add-custom-grub-parameter)
  - [Configure OVS-DPDK in kube-ovn](#configure-ovs-dpdk-in-kube-ovn)
- [Adding new CNI plugins for Kubernetes (Network Edge)](#adding-new-cni-plugins-for-kubernetes-network-edge)

## Purpose

The OpenNESS Experience Kit (OEK) repository contains a set of Ansible\* playbooks for the easy setup of OpenNESS in **Network Edge** mode.

## OpenNESS setup playbooks

## Customizing kernel, grub parameters, and tuned profile & variables per host

OEKs allow a user to customize kernel, grub parameters, and tuned profiles by leveraging Ansible's feature of `host_vars`.

> **NOTE**: `groups_vars/[edgenode|controller|edgenode_vca]_group` directories contain variables applicable for the respective groups and they can be used in `host_vars` to change on per node basis while `group_vars/all` contains cluster wide variables.

OEKs contain a `host_vars/` directory that can be used to place a YAML file (`nodes-inventory-name.yml`, e.g., `node01.yml`). The file would contain variables that would override roles' default values.

> **NOTE**: Despite the ability to customize parameters (kernel), it is required to have a clean CentOS\* 7.6.1810 operating system installed on hosts (from a minimal ISO image) that will be later deployed from Ansible scripts. This OS shall not have any user customizations.

To override the default value, place the variable's name and new value in the host's vars file. For example, the contents of `host_vars/node01.yml` that would result in skipping kernel customization on that node:

```yaml
kernel_skip: true
```

The following are several common customization scenarios.

### IP address range allocation for various CNIs and interfaces

The OpenNESS Experience kits deployment uses/allocates/reserves a set of IP address ranges for different CNIs and interfaces. The server or host IP address should not conflict with the default address allocation.
In case if there is a critical need for the server IP address used by the OpenNESS default deployment, it would require to modify the default addresses used by the OpenNESS.

Following files specify the CIDR for CNIs and interfaces. These are the IP address ranges allocated and used by default just for reference.

```yaml
flavors/media-analytics-vca/all.yml:19:vca_cidr: "172.32.1.0/12"
group_vars/all/10-default.yml:90:calico_cidr: "10.243.0.0/16"
group_vars/all/10-default.yml:93:flannel_cidr: "10.244.0.0/16"
group_vars/all/10-default.yml:96:weavenet_cidr: "10.32.0.0/12"
group_vars/all/10-default.yml:99:kubeovn_cidr: "10.16.0.0/16,100.64.0.0/16,10.96.0.0/12"
roles/kubernetes/cni/kubeovn/controlplane/templates/crd_local.yml.j2:13:  cidrBlock: "192.168.{{ loop.index0 + 1 }}.0/24"
```

The 192.168.x.y is used for SRIOV and interface service IP address allocation in Kube-ovn CNI. So it is not allowed for the server IP address, which conflicting with this range.
Completely avoid the range of address defined as per the netmask as it may conflict in routing rules.

Eg. If the server/host IP address is required to use 192.168.x.y while this range by default used for SRIOV interfaces in OpenNESS. The IP address range for cidrBlock in roles/kubernetes/cni/kubeovn/controlplane/templates/crd_local.yml.j2 file  can be changed to 192.167.{{ loop.index0 + 1 }}.0/24 to use some other IP segment for SRIOV interfaces.


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
- http://linuxsoft.cern.ch/scientific/7x/x86_64/os/Packages/tuned-2.11.0-8.el7.noarch.rpm
- http://linuxsoft.cern.ch/scientific/7x/x86_64/os/Packages/tuned-profiles-realtime-2.11.0-8.el7.noarch.rpm
tuned_profile: realtime
tuned_vars: |
  isolated_cores=2-3
  nohz=on
  nohz_full=2-3
```

### Use newer realtime kernel (3.10.0-1062)
By default, `kernel-rt-kvm-3.10.0-957.21.3.rt56.935.el7.x86_64` from `http://linuxsoft.cern.ch/cern/centos/$releasever/rt/$basearch/` repository is installed.

To use another version (e.g., `kernel-rt-kvm-3.10.0-1062.9.1.rt56.1033.el7.x86_64`), create a `host_var` file for the host with content:
```yaml
kernel_version: 3.10.0-1062.9.1.rt56.1033.el7.x86_64
```

### Use newer non-rt kernel (3.10.0-1062)
The OEK installs a real-time kernel by default from a specific repository. However, the non-rt kernel is present in the official CentOS repository. Therefore, to use a newer non-rt kernel, the following overrides must be applied:
```yaml
kernel_repo_url: ""                           # package is in default repository, no need to add new repository
kernel_package: kernel                        # instead of kernel-rt-kvm
kernel_devel_package: kernel-devel            # instead of kernel-rt-devel
kernel_version: 3.10.0-1062.el7.x86_64

dpdk_kernel_devel: ""  # kernel-devel is in the repository, no need for url with RPM

# Since, we're not using rt kernel, we don't need a tuned-profiles-realtime but want to keep the tuned 2.11
tuned_packages:
- http://linuxsoft.cern.ch/scientific/7x/x86_64/os/Packages/tuned-2.11.0-8.el7.noarch.rpm
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

# update tuned to 2.11 but don't install tuned-profiles-realtime since we're not using rt kernel
tuned_packages:
- http://linuxsoft.cern.ch/scientific/7x/x86_64/os/Packages/tuned-2.11.0-8.el7.noarch.rpm
tuned_profile: balanced
tuned_vars: ""
```

### Change amount of HugePages
```yaml
hugepage_amount: "1000"   # default is 5000
```

### Change size of HugePages
```yaml
hugepage_size: "1G"   # default is 2M
```

### Change amount and size of HugePages
```yaml
hugepage_amount: "10"   # default is 5000
hugepage_size: "1G"     # default is 2M
```

### Remove input output memory management unit (IOMMU) from grub params
```yaml
default_grub_params: "hugepagesz={{ hugepage_size }} hugepages={{ hugepage_amount }}"
```

### Add custom GRUB parameter
```yaml
additional_grub_params: "debug"
```

### Configure OVS-DPDK in kube-ovn
By default, OVS-DPDK is enabled. To disable it, set a flag:
```yaml
kubeovn_dpdk: false
```

>**NOTE**: This flag should be set in `roles/kubernetes/cni/kubeovn/common/defaults/main.ym` or added to `group_vars/all/10-default.yml`.

Additionally, HugePages in the OVS pod can be adjusted once default HugePage settings are changed.
```yaml
kubeovn_dpdk_socket_mem: "1024,0" # Amount of hugepages reserved for OVS per NUMA node (node 0, node 1, ...) in MB
kubeovn_dpdk_hugepage_size: "2Mi" # Default size of hugepages, can be 2Mi or 1Gi
kubeovn_dpdk_hugepages: "1Gi"     # Total amount of hugepages that can be used by OVS-OVN pod
```

> **NOTE**: If the machine has multiple NUMA nodes, remember that HugePages must be allocated for **each NUMA node**. For example, if a machine has two NUMA nodes, `kubeovn_dpdk_socket_mem: "1024,1024"` or similar should be specified.

>**NOTE**: If `kubeovn_dpdk_socket_mem` is changed, set the value of `kubeovn_dpdk_hugepages` to be equal to or greater than the sum of `kubeovn_dpdk_socket_mem` values. For example, for `kubeovn_dpdk_socket_mem: "1024,1024"`, set `kubeovn_dpdk_hugepages` to at least `2Gi` (equal to 2048 MB).

>**NOTE**: `kubeovn_dpdk_socket_mem`, `kubeovn_dpdk_pmd_cpu_mask`, and `kubeovn_dpdk_lcore_mask` can be set on per node basis but the HugePage amount allocated with `kubeovn_dpdk_socket_mem` cannot be greater than `kubeovn_dpdk_hugepages`, which is the same for the whole cluster.

OVS pods limits are configured by:
```yaml
kubeovn_dpdk_resources_requests: "1Gi" # OVS-OVN pod RAM memory (requested)
kubeovn_dpdk_resources_limits: "1Gi"   # OVS-OVN pod RAM memory (limit)
```
CPU settings can be configured using:
```yaml
kubeovn_dpdk_pmd_cpu_mask: "0x4" # DPDK PMD CPU mask
kubeovn_dpdk_lcore_mask: "0x2"   # DPDK lcore mask
```

## Adding new CNI plugins for Kubernetes (Network Edge)

* The role that handles CNI deployment must be placed in the `roles/kubernetes/cni/` directory (e.g., `roles/kubernetes/cni/kube-ovn/`).
* Subroles for control plane and node (if needed) should be placed in the `controlplane/` and `node/` directories (e.g., `roles/kubernetes/cni/kube-ovn/{controlplane,node}`).
* If there is a part of common command for both control plane and node, additional sub-roles can be created: `common` (e.g., `roles/kubernetes/cni/sriov/common`).<br>
>**NOTE**: The automatic inclusion of the `common` role should be handled by Ansible mechanisms (e.g., usage of meta's `dependencies` or `include_role` module)
* Name of the main role must be added to the `available_kubernetes_cnis` variable in `roles/kubernetes/cni/defaults/main.yml`.
* If additional requirements must checked before running the playbook (to not have errors during execution), they can be placed in the `roles/kubernetes/cni/tasks/precheck.yml` file, which is included as a pre_task in plays for both Edge Controller and Edge Node.<br>
The following are basic prechecks that are currently executed:
  * Check if any CNI is requested (i.e., `kubernetes_cni` is not empty).
  * Check if `sriov` is not requested as primary (first on the list) or standalone (only on the list).
  * Check if `kubeovn` is requested as a primary (first on the list).
  * Check if the requested CNI is available (check if some CNI is requested that isn't present in the `available_kubernetes_cnis` list).
* CNI roles should be as self-contained as possible (unless necessary, CNI-specific tasks should not be present in `kubernetes/{controlplane,node,common}` or `openness/network_edge/{controlplane,node}`).
* If the CNI needs a custom OpenNESS service (e.g., Interface Service in case of `kube-ovn`), it can be added to the `openness/network_edge/{controlplane,node}`.<br>
  Preferably, such tasks would be contained in a separate task file (e.g., `roles/openness/controlplane/tasks/kube-ovn.yml`) and executed only if the CNI is requested. For example:
  ```yaml
  - name: deploy interface service for kube-ovn
    include_tasks: kube-ovn.yml
    when: "'kubeovn' in kubernetes_cnis"
  ```
* If the CNI is used as an additional CNI (with Multus\*), the network attachment definition must be supplied ([refer to Multus docs for more info](https://github.com/intel/multus-cni/blob/master/doc/quickstart.md#storing-a-configuration-as-a-custom-resource)).
