```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2021 Intel Corporation
```
<!-- omit in toc -->
# The non-root user on the OpenNESS Platform
- [Overview](#overview)
- [Steps on K8s nodes](#steps-on-k8s-nodes)
- [Repository modification](#repository-modification)
- [Running edge apps](#running-edge-apps)

## Overview

OpenNESS provides a possibility to install all required files on a Kubernetes control plane and nodes with or without root user. From security perspective it is advised to use non-root user installation of the OpenNESS platform where all tasks are executed with non-root user’s permissions. Tasks that require root privileges use privilege escalation property "become".

   ```yml
  - name: Run a command as root
      command: whoami
      become: yes
   ```

>**NOTE**: For more about privileges escalation in Ansible please refer to https://docs.ansible.com/ansible/latest/user_guide/become.html#

## Steps on K8s nodes

Before Ansible installation is started a non-root user needs to be created on the machines defined in `inventory.yml` . To create a user `openness` execute the command:

```bash
adduser "openness"
```

A password for the given user is required.

```bash
passwd "openness"
```

As some tasks require root privileges the non-root user needs to have a possibility to become a root. For the user `openness` the following command must be performed:

```bash
echo "openness  ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/openness
```

## Repository modification

To run Ansible as a non-root user a modification in `inventory.yml` is required. Setting a user in variable `ansible_user` to already created non-root user will cause an execution of all tasks as non-root user specified.

```yaml
---
all:
  vars:
    cluster_name: minimal_cluster
    flavor: minimal
    single_node_deployment: false
    limit:
controller_group:
  hosts:
    ctrl.openness.org:
      ansible_host: 172.16.0.1
      ansible_user: openness
edgenode_group:
  hosts:
    node01.openness.org:
      ansible_host: 172.16.0.2
      ansible_user: openness
```

## Running edge apps

When deployment is done using non root user, the edge apps should also be managed using the same non root user. To run edge apps some command (e.g. docker image push) require sudo privilages, those commands should be executed with sudo privilage.
