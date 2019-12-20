```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# Hugepage support on OpenNESS 

- [Hugepage support on OpenNESS](#hugepage-support-on-openness)
  - [Overview](#overview)
  - [Details of Hugepage support on OpenNESS](#details-of-hugepage-support-on-openness)
    - [Network edge mode](#network-edge-mode)
    - [OnPrem mode](#onprem-mode)
  - [Reference](#reference)

## Overview 

Memory is allocated to application processes in terms of pages - by default the 4K pages are supported. For Applications dealing with larger datasets, using 4K pages may lead to performance degradation and overhead because of TLB misses. To address this, modern CPUs support huge pages which are typically 2M and 1G. This helps avoid TLB miss overhead and therefore improves performance. 

Both Applications and Network functions can gain in performance from using hugepages. Huge page support, added to Kubernetes v1.8, enables the discovery, scheduling and allocation of huge pages as a native first-class resource. This support addresses low latency and deterministic memory access requirements. 

## Details of Hugepage support on OpenNESS

Hugepages are enabled by default. There are two parameters that are describing the hugepages: the size of single page (can be 2MB or 1GB) and amount of those pages. In network edge deployment there is, enabled by default, 500 of 2MB hugepages (which equals to 2GB of memory) per node/controller, and in OnPrem deployment hugepages are enabled only for nodes and the default is 5000 of 2MB pages (10GB). If you want to change those settings you will need to edit config files as described below. All the settings have to be adjusted before OpenNESS installation. 

### Network edge mode

You can change the size of single page editing the variable `hugepage_size` in `roles/grub/defaults/main.yml`:

To set the page size of 2 MB:

```yaml
hugepage_size: "2M"
```

To set the page size of 1GB:

```yaml
hugepage_size: "1G"
```

The amount of hugepages can be set separately for both controller and nodes. To set the amount of hugepages for controller please change the value of variable `hugepage_amount` in `ne_controller.yml`:

For example:

```yaml
vars:
    hugepage_amount: "1500"
```

will enable 1500 pages of the size specified by `hugepage_size` variable.

To set the amount of hugepages for nodes please change the value of variable `hugepage_amount` in `ne_node.yml`:

For example:

```yaml
vars:
    hugepage_amount: "3000"
```

will enable 3000 pages of the size specified by `hugepage_size` variable for each deployed node.

### OnPrem mode

The hugepages are enabled only for the nodes. You can change the size of single page and amount of the pages editing the variables `hugepage_size` and `hugepage_amount` in `roles/grub/defaults/main.yml`:

For example:

```yaml
hugepage_size: "2M"
hugepage_amount: "2000"
```

will enable 2000 of 2MB pages, and:

```yaml
hugepage_size: "1G"
hugepage_amount: "5"
```

will enable 5 pages, 1GB each.

## Reference 
- [Hugepages support in Kubernetes](https://kubernetes.io/docs/tasks/manage-hugepages/scheduling-hugepages/)

