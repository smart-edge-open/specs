```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2021 Intel Corporation
```
<!-- omit in toc -->
# The non-root user on the OpenNESS Platform
- [Overview](#overview)
- [Steps on K8s nodes](#steps-on-k8s-nodes)
- [Repository modification](#repository-modification)

## Overview

OpenNESS provides a possibility to install all required files on Kubernetes a control plane and nodes with or without root rights. From security perspective it is advised to use non-root user installation of our platform where all tasks are executed with non-root user’s permissions. Tasks that require root privileges use privilege escalation property "become".

   ```yml
  - name: Run a command as root
      command: whoami
      become: yes
   ```
>**NOTE**: For more about privileges escalation in ansible please refer to https://docs.ansible.com/ansible/latest/user_guide/become.html#

## Steps on K8s nodes

Before ansible installation is started a non-root user needs to be created on the machines marked in Ansible's inventory. To create a user `openness` a command can be executed:

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

To be able to start ansible as a non-root user a modification in inventory is required. Replacement of root user in variable `ansible_ssh_user` to already created non-root user will cause an execution of all tasks as non-root user specified.

```ini
[all]
controller ansible_ssh_user=openness ansible_host=192.168.1.10
node01 ansible_ssh_user=openness ansible_host=192.168.1.11
node02 ansible_ssh_user=openness ansible_host=192.168.1.12
```
