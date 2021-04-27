```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2021 Intel Corporation
```
<!-- omit in toc -->
# OpenNESS Cluster Setup
- [Quickstart](#quickstart)
- [Preconditions](#preconditions)
- [Running playbooks](#running-playbooks)
  - [Deployment scripts](#deployment-scripts)
  - [Network Edge playbooks](#network-edge-playbooks)
    - [Cleanup procedure](#cleanup-procedure)
    - [Supported EPA features](#supported-epa-features)
    - [VM support for Network Edge](#vm-support-for-network-edge)
    - [Application on-boarding](#application-on-boarding)
    - [Single-node Network Edge cluster](#single-node-network-edge-cluster)
  - [Kubernetes cluster networking plugins (Network Edge)](#kubernetes-cluster-networking-plugins-network-edge)
    - [Selecting cluster networking plugins (CNI)](#selecting-cluster-networking-plugins-cni)
    - [Adding additional interfaces to pods](#adding-additional-interfaces-to-pods)
- [Q&A](#qa)
  - [Configuring time](#configuring-time)
  - [Setup static hostname](#setup-static-hostname)
  - [Configuring the Inventory file](#configuring-the-inventory-file)
  - [Exchanging SSH keys between hosts](#exchanging-ssh-keys-between-hosts)
  - [Setting proxy](#setting-proxy)
  - [Obtaining installation files](#obtaining-installation-files)
  - [Setting Git](#setting-git)
    - [GitHub token](#github-token)
    - [Customize tag/branch/sha to checkout on edgeservices repository](#customize-tagbranchsha-to-checkout-on-edgeservices-repository)
  - [Customization of kernel, grub parameters, and tuned profile](#customization-of-kernel-grub-parameters-and-tuned-profile)

# Quickstart
The following set of actions must be completed to set up the Open Network Edge Services Software (OpenNESS) cluster.

1. Fulfill the [Preconditions](#preconditions).
2. Become familiar with [supported features](#supported-epa-features) and enable them if desired.
3. Clone [Converged Edge Experience Kits](https://github.com/open-ness/converged-edge-experience-kits)
4. Install deployment helper script pre-requisites (first time only)
   
    ```shell
    $ sudo scripts/ansible-precheck.sh
    ```

5. Run the [deployment helper script](#running-playbooks) for the Ansible\* playbook:

    ```shell
    $ python3 deploy.py
    ```

# Preconditions

To use the playbooks, several preconditions must be fulfilled. These preconditions are described in the [Q&A](#qa) section below. The preconditions are:

- CentOS\* 7.9.2009 must be installed on all the nodes (the controller and edge nodes) where the product is deployed. It is highly recommended to install the operating system using a minimal ISO image on nodes that will take part in deployment (obtained from inventory file). Also, do not make customizations after a fresh manual install because it might interfere with Ansible scripts and give unpredictable results during deployment.
- Hosts for the Edge Controller (Kubernetes control plane) and Edge Nodes (Kubernetes nodes) must have proper and unique hostnames (i.e., not `localhost`). This hostname must be specified in `/etc/hosts` (refer to [Setup static hostname](#setup-static-hostname)).
- SSH keys must be exchanged between hosts (refer to [Exchanging SSH keys between hosts](#exchanging-ssh-keys-between-hosts)).
- A proxy may need to be set (refer to [Setting proxy](#setting-proxy)).
- If a private repository is used, a Github\* token must be set up (refer to [GitHub token](#github-token)).
- Refer to the [Configuring time](#configuring-time) section for how to enable Network Time Protocol (NTP) clients.
- The Ansible inventory must be configured (refer to [Configuring the Inventory file](#configuring-the-inventory-file)).

# Running playbooks

The Network Edge deployment and cleanup is carried out via Ansible playbooks. The playbooks are run from the Ansible host. Before running the playbooks, an inventory file `inventory.yml` must be defined. The provided [deployment helper scripts](#deployment-scripts) support deploying multiple clusters as defined in the Inventory file.

The following subsections describe the playbooks in more details.

## Deployment scripts

For convenience, playbooks can be executed by running helper deployment scripts from the Ansible host. These scripts require that the Edge Controller and Edge Nodes be configured on different hosts (for deployment on a single node, refer to [Single-node Network Edge cluster](#single-node-network-edge-cluster)). This is done by configuring the Ansible playbook inventory, as described later in this document.

To get started with deploying an OpenNESS edge cluster using the Converged Edge Experience Kit:

1. Install pre-requisite tools for the the deployment script 
   
    ```shell
    $ sudo scripts/ansible-precheck.sh
    ```

2. Edit the `inventory.yml` file by providing information about the cluster nodes and the intended deployment flavor

    Example:

    ```yaml
    ---
    all:
      vars:
        cluster_name: 5g_near_edge
        flavor: cera_5g_near_edge
        single_node_deployment: false
        limit:
    controller_group:
      hosts:
        ctrl.openness.org:
          ansible_host: 10.102.227.154
          ansible_user: openness
    edgenode_group:
      hosts:
        node01.openness.org:
          ansible_host: 10.102.227.11
          ansible_user: openness
        node02.openness.org:
          ansible_host: 10.102.227.79
          ansible_user: openness
    edgenode_vca_group:
      hosts:
    ptp_master:
      hosts:
    ptp_slave_group:
      hosts:
    ```

    > **NOTE**: To deploy multiple clusters in one command run, append the same set of YAML specs separated by `---`

3. Additional configurations should be applied to the default group_vars file: `inventory/default/group_vars/all/10-default.yml`. More details on the default values is explained in the [Getting Started Guide](./converged-edge-experience-kits.md#default-values).

4. Get the deployment started by executing the deploy script

    ```shell
    $ python3 deploy.py
    ```
    > **NOTE**: This script parses the values provided in the inventory.yml file.

    > **NOTE**: If want to enforce deployment termination in case of any failure, use arguments `-f` or `--any-errors-fatal`, e.g.:
    > ```shell
    > $ python3 deploy.py --any-errors-fatal
    > ```

5. To cleanup an existing deployment, execute with `-c` or `--clean`, e.g:

    ```shell
    $ python3 deploy.py --clean
    ```
    > **NOTE**: If it is intended to do the cleanup manually, i.e: one cluster at a time, update the `inventory.yml` with only the intended cluster configuration

For an initial installation, `deploy.py` with `all/vars/limit: controller` must be run before `deploy.py` with `all/vars/limit: nodes`. During the initial installation, the hosts may reboot. After reboot, the deployment script that was last run should be run again.


## Network Edge playbooks

The `network_edge.yml` and `network_edge_cleanup.yml` files contain playbooks for Network Edge mode.
Playbooks can be customized by enabling and configuring features in the `inventory/default/group_vars/all/10-default.yml` file.

### Cleanup procedure

The cleanup procedure is used when a configuration error in the Edge Controller or Edge Nodes must be fixed. The script causes the appropriate installation to be reverted, so that the error can be fixed and `deploy.py` can be re-run. The cleanup procedure does not do a comprehensive cleanup (e.g., installation of DPDK or Golang will not be rolled back).

The cleanup procedure call a set of cleanup roles that revert the changes resulted from the cluster deployment. The changes are reverted by going step-by-step in the reverse order and undoing the steps.

For example, when installing Docker\*, the RPM repository is added and Docker is installed. When cleaning up, Docker is uninstalled and the repository is removed.

To execute cleanup procedure

```shell
$ python3 deploy.py --clean
```

> **NOTE**: There may be leftovers created by the installed software. For example, DPDK and Golang installations, found in `/opt`, are not rolled back.

### Supported EPA features

Several enhanced platform capabilities and features are available in OpenNESS for Network Edge. For the full list of supported features, refer to Building Blocks / Enhanced Platform Awareness section. The documents referenced in this list provide a detailed description of the features, and step-by-step instructions for enabling them. Users should become familiar with available features before executing the deployment playbooks.

### VM support for Network Edge
Support for VM deployment on OpenNESS for Network Edge is available and enabled by default. Certain configurations and prerequisites may need to be satisfied to use all VM capabilities. The user is advised to become familiar with the VM support documentation before executing the deployment playbooks. See [VM support in OpenNESS for Network Edge](../applications-onboard/openness-network-edge-vm-support.md) for more information.

### Application on-boarding

Refer to the [network-edge-applications-onboarding](../applications-onboard/network-edge-applications-onboarding.md) document for instructions on how to deploy edge applications for OpenNESS Network Edge.

### Single-node Network Edge cluster

Network Edge can be deployed on just a single machine working as a control plane & node.

To deploy Network Edge in a single-node cluster scenario, follow the steps below:

1. Modify `inventory.yml`
    > Rules for inventory:
    > - IP address (`ansible_host`) for both controller and node must be the same
    > - `controller_group` and `edgenode_group` groups must contain exactly one host
    > - `single_node_deployment` flag set to `true`

    Example of a valid inventory:

    ```yaml
    ---
    all:
      vars:
        cluster_name: 5g_central_office
        flavor: cera_5g_central_office
        single_node_deployment: true   
        limit:  
    controller_group:
      hosts:
        controller:
          ansible_host: 10.102.227.234
          ansible_user: openness
    edgenode_group:
      hosts:
        node01:
          ansible_host: 10.102.227.234
          ansible_user: openness
    edgenode_vca_group:
      hosts:
    ptp_master:
      hosts:
    ptp_slave_group:
      hosts:
    ```

2. Features can be enabled in the `inventory/default/group_vars/all/10-default.yml` file by tweaking the configuration variables.

3. Settings regarding the kernel, grub, HugePages\*, and tuned can be customized in `inventory/default/group_vars/edgenode_group/10-default.yml`.
   
   > **NOTE**: Default settings in the single-node cluster mode are those of the Edge Node (i.e., kernel and tuned customization enabled).

4. Single-node cluster can be deployed by running command:
    ```shell
    $ python3 deploy.py
    ```

## Kubernetes cluster networking plugins (Network Edge)

Kubernetes uses 3rd party networking plugins to provide [cluster networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/).
These plugins are based on the [CNI (Container Network Interface) specification](https://github.com/containernetworking/cni).

Converged Edge Experience Kits provide several ready-to-use Ansible roles deploying CNIs.
The following CNIs are currently supported:

* [kube-ovn](https://github.com/alauda/kube-ovn)
  * **Only as primary CNI**
  * CIDR: 10.16.0.0/16
* [calico](https://github.com/projectcalico/cni-plugin)
  * **Only as primary CNI**
  * IPAM: host-local
  * CIDR: 10.245.0.0/16
  * Network attachment definition: openness-calico
* [flannel](https://github.com/coreos/flannel)
  * IPAM: host-local
  * CIDR: 10.244.0.0/16
  * Network attachment definition: openness-flannel
* [weavenet](https://github.com/weaveworks/weave)
  * CIDR: 10.32.0.0/12
* [SR-IOV](https://github.com/intel/sriov-cni) (cannot be used as a standalone or primary CNI - [sriov setup](../building-blocks/enhanced-platform-awareness/openness-sriov-multiple-interfaces.md))
* [Userspace](https://github.com/intel/userspace-cni-network-plugin) (cannot be used as a standalone or primary CNI - [Userspace CNI setup](../building-blocks/dataplane/openness-userspace-cni.md)

Multiple CNIs can be requested to be set up for the cluster. To provide such functionality [the Multus CNI](https://github.com/intel/multus-cni) is used.

>**NOTE**: For a guide on how to add new a CNI role to the Converged Edge Experience Kits, refer to [the Converged Edge Experience Kits guide](./converged-edge-experience-kits.md#adding-new-cni-plugins-for-kubernetes-network-edge).

### Selecting cluster networking plugins (CNI)

The default CNI for OpenNESS is calico. Non-default CNIs may be configured with OpenNESS by editing the file `inventory/default/group_vars/all/10-default.yml`.
To add a non-default CNI, the following edits must be carried out:

- The CNI name is added to the `kubernetes_cnis` variable. The CNIs are applied in the order in which they appear in the file. By default, `calico` is defined. That is,

  ```yaml
  kubernetes_cnis:
  - calico
  ```

- To add a CNI, such as SR-IOV, the `kubernetes_cnis` variable is edited as follows:

  ```yaml
  kubernetes_cnis:
  - calico
  - sriov
  ```

- The Multus CNI is added by the Ansible playbook when two or more CNIs are defined in the `kubernetes_cnis` variable
- The CNI's networks (CIDR for pods, and other CIDRs used by the CNI) are added to the `proxy_noproxy` variable by Ansible playbooks.

### Adding additional interfaces to pods

To add an additional interface from secondary CNIs, annotation is required.
Below is an example pod yaml file for a scenario with `kube-ovn` as a primary CNI along with `calico` and `flannel` as additional CNIs.
Multus\* will create an interface named `calico` using the network attachment definition `openness-calico` and interface `flannel` using the network attachment definition `openness-flannel`.
>**NOTE**: Additional annotations such as `openness-calico@calico` are required only if the CNI is secondary. If the CNI is primary, the interface will be added automatically by Multus\*.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cni-test-pod
  annotations:
    k8s.v1.cni.cncf.io/networks: openness-calico@calico, openness-flannel@flannel
spec:
  containers:
  - name: cni-test-pod
    image: docker.io/centos/tools:latest
    command:
    - /sbin/init
```

The following is an example output of the `ip a` command run in a pod and after CNIs have been applied. Some lines in the command output were omitted for readability.

The following interfaces are available: `calico@if142`, `flannel@if143`, and `eth0@if141` (`kubeovn`).

```shell
# kubectl exec -ti cni-test-pod ip a

1: lo:
    inet 127.0.0.1/8 scope host lo

2: tunl0@NONE:
    link/ipip 0.0.0.0 brd 0.0.0.0

4: calico@if142:
    inet 10.243.0.3/32 scope global calico

6: flannel@if143:
    inet 10.244.0.3/16 scope global flannel

140: eth0@if141:
    inet 10.16.0.5/16 brd 10.16.255.255 scope global eth0
```

# Q&A

## Configuring time

To allow for correct certificate verification, OpenNESS requires system time to be synchronized among all nodes and controllers in a system.

OpenNESS provides the possibility to synchronize a machine's time with the NTP server.
To enable NTP synchronization, change `ntp_enable` in `inventory/default/group_vars/all/10-default.yml`:
```yaml
ntp_enable: true
```

Servers to be used instead of default ones can be provided using the `ntp_servers` variable in `inventory/default/group_vars/all/10-default.yml`:
```yaml
ntp_servers: ["ntp.local.server"]
```

## Setup static hostname

The following command is used in CentOS\* to set a static hostname:

```shell
hostnamectl set-hostname <host_name>
```

As shown in the following example, the hostname must also be defined in `/etc/hosts`:

```shell
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4 <host_name>
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6 <host_name>
```

In addition to being a unique hostname within the cluster, the hostname must also follow Kubernetes naming conventions. For example, only lower-case alphanumeric characters "-" or "." start and end with an alphanumeric character. Refer to
[K8s naming restrictions](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) for additional details on these conventions.

## Configuring the Inventory file

To execute playbooks, an inventory file `inventory.yml` must be defined in order to specify the target nodes on which the OpenNESS cluster(s) will be deployed.

The OpenNESS inventory contains three groups: `all`, `controller_group`, and `edgenode_group`.

- `all` contains all the variable definitions relevant to the cluster:
  > `cluster_name`: defines the name of the OpenNESS edge cluster 
  > `flavor`: the deployment flavor to be deployed to the OpenNESS edge cluster
  > `single_node_deployment`: when set to `true`, mandates a single-node cluster deployment
- `controller_group` defines the node to be set up as the OpenNESS Edge Controller
  > **NOTE**: Because only one controller is supported, the `controller_group` can contain only one host.
- `edgenode_group` defines the group of nodes that constitute the OpenNESS Edge Nodes.
  > **NOTE**: All nodes will be joined to the OpenNESS Edge Controller defined in `controller_group`.

Example:

```yaml
---
all:
  vars:
    cluster_name: central_office
    flavor: minimal          
    single_node_deployment: false
    limit:
controller_group:
  hosts:
    ctrl.openness.org:
      ansible_host: 10.102.227.154
      ansible_user: openness
edgenode_group:
  hosts:
    node01.openness.org:
      ansible_host: 10.102.227.11
      ansible_user: openness
    node02.openness.org:
      ansible_host: 10.102.227.79
      ansible_user: openness
edgenode_vca_group:
  hosts:
ptp_master:
  hosts:
ptp_slave_group:
  hosts:
```

In this example, a cluster named as `central_office` is deployed using the pre-defined deployment flavor `minimal` that is composed of one controller node `ctrl.openness.org` and 2 edge nodes: `node01.openness.org` and `node02.openness.org`.

## Exchanging SSH keys between hosts

Exchanging SSH keys between hosts permits a password-less SSH connection from the host running Ansible to the hosts being set up.

In the first step, the host running Ansible (usually the Edge Controller host) must have a generated SSH key. The SSH key can be generated by executing `ssh-keygen` and obtaining the key from the output of the command.

The following is an example of a key generation, in which the key is placed in the default directory (`/root/.ssh/id_rsa`), and an empty passphrase is used.

```shell
# ssh-keygen

Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa):  <ENTER>
Enter passphrase (empty for no passphrase):  <ENTER>
Enter same passphrase again:  <ENTER>
Your identification has been saved in /root/.ssh/id_rsa.
Your public key has been saved in /root/.ssh/id_rsa.pub.
The key fingerprint is:
SHA256:vlcKVU8Tj8nxdDXTW6AHdAgqaM/35s2doon76uYpNA0 root@host
The key's randomart image is:
+---[RSA 2048]----+
|          .oo.==*|
|     .   .  o=oB*|
|    o . .  ..o=.=|
|   . oE.  .  ... |
|      ooS.       |
|      ooo.  .    |
|     . ...oo     |
|      . .*o+.. . |
|       =O==.o.o  |
+----[SHA256]-----+
```

In the second step, the generated key must be copied to **every host from the inventory**, including the host on which the key was generated, if it appears in the inventory (e.g., if the playbooks are executed from the Edge Controller host, the host must also have a copy of its key). It is done by running `ssh-copy-id`. For example:

```shell
# ssh-copy-id root@host

/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/root/.ssh/id_rsa.pub"
The authenticity of host '<IP> (<IP>)' can't be established.
ECDSA key fingerprint is SHA256:c7EroVdl44CaLH/IOCBu0K0/MHl8ME5ROMV0AGzs8mY.
ECDSA key fingerprint is MD5:38:c8:03:d6:5a:8e:f7:7d:bd:37:a0:f1:08:15:28:bb.
Are you sure you want to continue connecting (yes/no)? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
root@host's password:

Number of key(s) added: 1

Now, try logging into the machine, with:   "ssh 'root@host'"
and check to make sure that only the key(s) you wanted were added.
```

To make sure the key is copied successfully, try to SSH into the host: `ssh 'root@host'`. It should not ask for the password.

>**NOTE**: Where non-root user is used for example `openness` the command should be replaced to `ssh openness@host`. For more information about non-root user please refer to: 
[The non-root user on the OpenNESS Platform](../getting-started/non-root-user.md)
## Setting proxy

If a proxy is required to connect to the Internet, it is configured via the following steps:

-  Edit the `proxy_` variables in the `inventory/default/group_vars/all/10-default.yml` file.
-  Set the `proxy_enable` variable in `inventory/default/group_vars/all/10-default.yml` file to `true`.
-  Append the network CIDR (e.g., `192.168.0.1/24`) to the `proxy_noproxy` variable in `inventory/default/group_vars/all/10-default.yml`.

Sample configuration of `inventory/default/group_vars/all/10-default.yml`:

```yaml
# Setup proxy on the machine - required if the Internet is accessible via proxy
proxy_enable: true
# Clear previous proxy settings
proxy_remove_old: true
# Proxy URLs to be used for HTTP, HTTPS and FTP
proxy_http: "http://proxy.example.org:3128"
proxy_https: "http://proxy.example.org:3129"
proxy_ftp: "http://proxy.example.org:3128"
# Proxy to be used by YUM (/etc/yum.conf)
proxy_yum: "{{ proxy_http }}"
# No proxy setting contains addresses and networks that should not be accessed using proxy (e.g., local network and Kubernetes CNI networks)
proxy_noproxy: ""
```

Sample definition of `no_proxy` environmental variable for Ansible host (to allow Ansible host to connect to other hosts):

```shell
export no_proxy="localhost,127.0.0.1,10.244.0.0/24,10.96.0.0/12,192.168.0.0/24"
```

## Obtaining installation files

There are no specific restrictions on the directory into which the OpenNESS directories are cloned. When OpenNESS is built, additional directories will be installed in `/opt`. It is recommended to clone the project into a directory such as `/home`.

## Setting Git

### GitHub token

>**NOTE**: Only required when cloning private repositories. Not needed when using github.com/open-ness repositories.

To clone private repositories, a GitHub token must be provided.

To generate a GitHub token, refer to [GitHub help - Creating a personal access token for the command line](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line).

To provide the token, edit the value of `git_repo_token` variable in `inventory/default/group_vars/all/10-default.yml`.

### Customize tag/branch/sha to checkout on edgeservices repository
A specific tag, branch, or commit SHA on edgeservices repository can be checked out by setting the `git_repo_branch` variable in `inventory/default/group_vars/all/10-open.yml`.
```yaml
git_repo_branch: master
# or
git_repo_branch: openness-20.03
```

## Customization of kernel, grub parameters, and tuned profile

Converged Edge Experience Kits provide an easy way to customize the kernel version, grub parameters, and tuned profile. For more information, refer to the [Converged Edge Experience Kits guide](./converged-edge-experience-kits.md).

