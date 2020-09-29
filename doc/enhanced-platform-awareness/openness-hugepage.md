```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```
<!-- omit in toc -->
# HugePage support in OpenNESS
- [Overview](#overview)
- [Details of HugePage support on OpenNESS](#details-of-hugepage-support-on-openness)
  - [Examples](#examples)
    - [Changing size and amount of the hugepages for both controller and nodes](#changing-size-and-amount-of-the-hugepages-for-both-controller-and-nodes)
    - [Customizing hugepages for specific machine](#customizing-hugepages-for-specific-machine)
- [Reference](#reference)

## Overview

Memory is allocated to application processes in terms of pages and by default, 4K pages are supported. For applications dealing with larger datasets, using 4K pages may lead to performance degradation and overhead because of translation lookaside buffer (TLB) misses. To address this, modern CPUs support HugePages which are typically 2M and 1G. This helps avoid TLB miss overhead and therefore improves performance.

Both applications and network functions can improve performance using HugePages. Huge page support, added to Kubernetes\* v1.8, enables the discovery, scheduling, and allocation of huge pages as a native, first-class resource. This support addresses low latency and deterministic memory access requirements.

## Details of HugePage support on OpenNESS

OpenNESS deployment enables hugepages by default and provides parameters for tuning hugepages:
* `hugepage_size` - size, which can be either `2M` or `1G`
* `hugepage_amount` - amount

By default, these variables have values:

| Mode         | Machine type | `hugepage_amount` | `hugepage_size` | Comments                                     |
| ------------ | ------------ | :---------------: | :-------------: | -------------------------------------------- |
| Network Edge | Controller   |      `1024`       |      `2M`       |                                              |
|              | Node         |      `1024`       |      `2M`       |                                              |

Find below a guide on changing these values. Customizations must be made before OpenNESS deployment.

Variables for hugepage customization can be placed in several files:
* `group_vars/controller_group/10-default.yml` and `group_vars/edgenode_group/10-default.yml` will affect Edge Controller and Edge Nodes in every mode
* `host_vars/<inventory_host_name>.yml` will only affect the `<inventory_host_name>` host present in `inventory.ini` (in all modes)
* Hugepages can be also specified for mode and machine type, (e.g., hugepages for On-Premises Edge Node can be set in `network_edge.yml` in a play for Edge Nodes:
  ```yaml
  # network_edge.yml

  - hosts: edgenode_group
    vars:
      hugepage_amount: "5000"
  ```
  >**NOTE**: Due to Ansible’s\* variable precedence, configuring hugepages in `network_edge.yml` is not recommended because it overrides customization in `group_vars` and `host_vars`.
The usage is summarized in the following table:

| File                                          | Network Edge | Native On Premises |            Edge Controller             |                     Edge Node                     |                                     Comment                                     |
| --------------------------------------------- | :----------: | :---------: | :------------------------------------: | :-----------------------------------------------: | :-----------------------------------------------------------------------------: |
| `group_vars/controller_group/10-default.yml`     |     yes      |     yes     |                  yes                   |                                                   |                                                                                 |
| `group_vars/edgenode_group/10-default.yml`       |     yes      |     yes     |                                        |                 yes - every node                  |                                                                                 |
| `host_vars/<inventory_host_name>.yml` |     yes      |     yes     |                  yes                   |                        yes                        | affects machine specified in `inventory.ini` with name  `<inventory_host_name>` |
| `network_edge.yml`                            |     yes      |             | `vars` under `hosts: controller_group` | `vars` under `hosts: edgenode_group` - every node |                                 not recommended                                 |

Note that variables have precedence:
1. **not recommended:** `network_edge.yml` will always take precedence for files from this list (overrides every other var)
2. `host_vars/`
3. `group_vars/edgenode_group/10-default.yml` and `group_vars/controller_group/10-default.yml`
4. `group_vars/all/10-default.yml`
5. `default/main.yml` in roles' directory


### Examples

#### Changing size and amount of the hugepages for both controller and nodes
Change the following lines in the `group_vars/edgenode_group/10-default.yml` or `group_vars/controller_group/10-default.yml`:
* To set 1500 of the hugepages with the page size of 2 MB (which is the default value) for the Edge Controller:
  ```yaml
  # group_vars/controller_group/10-default.yml

  hugepage_size: "2M"
  hugepage_amount: "1500"
  ```

* To set 10 of the hugepages with the page size of 1GB for the Edge Nodes:
  ```yaml
  # group_vars/edgenode_group/10-default.yml

  hugepage_size: "1G"
  hugepage_amount: "10"
  ```

#### Customizing hugepages for specific machine
To specify the size or amount only for a specific machine, `hugepage_size` and/or `hugepage_amount` can be provided in `host_vars/<host_name_from_inventory>.yml` (i.e., if host is named `node01`, then the file is `host_vars/node01.yml`). For example:
```yaml
# host_vars/node01.yml

hugepage_size: "2M"
hugepage_amount: "1500"
```

## Reference
- [Hugepages support in Kubernetes](https://kubernetes.io/docs/tasks/manage-hugepages/scheduling-hugepages/)
