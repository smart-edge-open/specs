```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```

# Hugepage support on OpenNESS

- [Hugepage support on OpenNESS](#hugepage-support-on-openness)
  - [Overview](#overview)
  - [Details of Hugepage support on OpenNESS](#details-of-hugepage-support-on-openness)
    - [Examples](#examples)
      - [Changing size of the hugepage for both controllers and nodes](#changing-size-of-the-hugepage-for-both-controllers-and-nodes)
      - [Setting different hugepage amount for Edge Controller or Edge Nodes in Network Edge mode](#setting-different-hugepage-amount-for-edge-controller-or-edge-nodes-in-network-edge-mode)
      - [Setting different hugepage amount for Edge Controller or Edge Nodes in On Premises mode](#setting-different-hugepage-amount-for-edge-controller-or-edge-nodes-in-on-premises-mode)
      - [Setting hugepage size for Edge Controller or Edge Node in Network Edge mode](#setting-hugepage-size-for-edge-controller-or-edge-node-in-network-edge-mode)
      - [Setting hugepage size for Edge Controller or Edge Node in On Premises mode](#setting-hugepage-size-for-edge-controller-or-edge-node-in-on-premises-mode)
      - [Customizing hugepages for specific machine](#customizing-hugepages-for-specific-machine)
  - [Reference](#reference)

## Overview

Memory is allocated to application processes in terms of pages - by default the 4K pages are supported. For Applications dealing with larger datasets, using 4K pages may lead to performance degradation and overhead because of TLB misses. To address this, modern CPUs support huge pages which are typically 2M and 1G. This helps avoid TLB miss overhead and therefore improves performance.

Both Applications and Network functions can gain in performance from using hugepages. Huge page support, added to Kubernetes v1.8, enables the discovery, scheduling and allocation of huge pages as a native first-class resource. This support addresses low latency and deterministic memory access requirements.

## Details of Hugepage support on OpenNESS

OpenNESS deployment enables the hugepages by default and provides parameters for tuning the hugepages:
* `hugepage_size` - size, which can be either `2M` or `1G`
* `hugepage_amount` - amount

By default, these variables have values:
| Mode         | Machine type | `hugepage_amount` | `hugepage_size` | Comments                                     |
|--------------|--------------|:-----------------:|:---------------:|----------------------------------------------|
| Network Edge | Controller   |      `1024`       |      `2M`       |                                              |
|              | Node         |      `1024`       |      `2M`       |                                              |
| On-Premises  | Controller   |      `1024`       |      `2M`       | For OVNCNI dataplane, otherwise no hugepages |
|              | Node         |      `5000`       |      `2M`       |                                              |

Guide on changing these values is below. Customizations must be made before OpenNESS deployment.

Variables for hugepage customization can be placed in several files:
* `group_vars/all.yml` will affect all modes and machine types
* `group_vars/controller_group.yml` and `group_vars/edgenode_group.yml` will affect Edge Controller and Edge Nodes respectively in all modes
* `host_vars/<inventory_host_name>.yml` will only affect `<inventory_host_name>` host present in `inventory.ini` (in all modes)
* To configure hugepages for specific mode, they can be placed in `network_edge.yml` and `on_premises.yml` under
  ```yaml
  - hosts: <group>   # e.g. controller_group or edgenode_group
    vars:
       hugepage_amount: "10"
       hugepage_size: "1G"
  ```

This is summarized in a following table:

| File                                  | Network Edge | On Premises |            Edge Controller             |              Edge Node               |                                     Comment                                     |
|---------------------------------------|:------------:|:-----------:|:--------------------------------------:|:------------------------------------:|:-------------------------------------------------------------------------------:|
| `group_vars/all.yml`                  |     yes      |     yes     |                  yes                   |                 yes - every node                 |                                                                                 |
| `group_vars/controller_group.yml`     |     yes      |     yes     |                  yes                   |                                      |                                                                                 |
| `group_vars/edgenode_group.yml`       |     yes      |     yes     |                                        |                 yes - every node                  |                                                                                 |
| `host_vars/<inventory_host_name>.yml` |     yes      |     yes     |                  yes                   |                 yes                  | affects machine specified in `inventory.ini` with name  `<inventory_host_name>` |
| `network_edge.yml`                    |     yes      |             | `vars` under `hosts: controller_group` | `vars` under `hosts: edgenode_group` - every node |                                                                                 |
| `on_premises.yml`                     |              |     yes     | `vars` under `hosts: controller_group` | `vars` under `hosts: edgenode_group` - every node|                                                                                 |

Note that variables have a precedence:
1. `network_edge.yml` and `on_premises.yml` will always take precedence for files from this list (override every var)
2. `host_vars/`
3. `group_vars/`
4. `default/main.yml` in roles' directory

### Examples

#### Changing size of the hugepage for both controllers and nodes
Add following line to the `group_vars/all.yml`:
* To set the page size of 2 MB (which is default value):
  ```yaml
  hugepage_size: "2M"
  ```
* To set the page size of 1GB:
  ```yaml
  hugepage_size: "1G"
  ```

#### Setting different hugepage amount for Edge Controller or Edge Nodes in Network Edge mode
The amount of hugepages can be set separately for both controller and nodes. To set the amount of hugepages for controller please change the value of variable `hugepage_amount` in `network_edge.yml`, for example:
```yaml
- hosts: controller_group
  vars:
    hugepage_amount: "1500"
```
will enable 1500 pages of the size specified by `hugepage_size` variable.

To set the amount of hugepages for all of the nodes please change the value of variable `hugepage_amount` in `network_edge.yml`, for example:
```yaml
- hosts: edgenode_group
  vars:
    hugepage_amount: "3000"
```

will enable 3000 pages of the size specified by `hugepage_size` variable for each deployed node.

#### Setting different hugepage amount for Edge Controller or Edge Nodes in On Premises mode

[Instruction for Network Edge](#setting-different-hugepage-amount-for-edge-controller-or-edge-nodes-in-network-edge-mode) is applicable for On Premises mode with the exception of the file to be edited: `on_premises.yml`

#### Setting hugepage size for Edge Controller or Edge Node in Network Edge mode
Different hugepage size for node or controller can be done by adding `hugepage_size` to the playbook (`network_edge.yml` file), e.g.
```yaml
- hosts: controller_group     # or edgenode_group
  vars:
    hugepage_amount: "5"
    hugepage_size: "1G"
```

#### Setting hugepage size for Edge Controller or Edge Node in On Premises mode

[Instruction for Network Edge](#setting-hugepage-size-for-edge-controller-or-edge-node-in-network-edge-mode)  is applicable for On Premises mode with the exception of the file to be edited: `on_premises.yml`

#### Customizing hugepages for specific machine
To specify size or amount only for specific machine, `hugepage_size` and/or `hugepage_amount` can be provided in `host_vars/<host_name_from_inventory>.yml` (i.e. if host is named `node01`, then the file is `host_vars/node01.yml`).

Note that vars in `on_premises.yml` have greater precedence than ones in `host_vars/`, therefore to provide greater control over hugepage variables, `hugepage_amount` from `network_edge.yml` and/or `on_premises.yml` should be removed.

## Reference
- [Hugepages support in Kubernetes](https://kubernetes.io/docs/tasks/manage-hugepages/scheduling-hugepages/)
