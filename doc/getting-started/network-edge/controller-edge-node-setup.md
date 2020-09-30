```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```
<!-- omit in toc -->
# OpenNESS Network Edge: Controller and Edge node setup
- [Quickstart](#quickstart)
- [Preconditions](#preconditions)
- [Running playbooks](#running-playbooks)
  - [Deployment scripts](#deployment-scripts)
  - [Network Edge playbooks](#network-edge-playbooks)
    - [Cleanup playbooks](#cleanup-playbooks)
    - [Supported EPA features](#supported-epa-features)
    - [VM support for Network Edge](#vm-support-for-network-edge)
    - [Application on-boarding](#application-on-boarding)
    - [Single-node Network Edge cluster](#single-node-network-edge-cluster)
  - [Docker registry](#docker-registry)
    - [Deploy Docker registry](#deploy-docker-registry)
    - [Docker registry image push](#docker-registry-image-push)
    - [Docker registry image pull](#docker-registry-image-pull)
  - [Kubernetes cluster networking plugins (Network Edge)](#kubernetes-cluster-networking-plugins-network-edge)
    - [Selecting cluster networking plugins (CNI)](#selecting-cluster-networking-plugins-cni)
    - [Adding additional interfaces to pods](#adding-additional-interfaces-to-pods)
- [Q&A](#qa)
  - [Configuring time](#configuring-time)
  - [Setup static hostname](#setup-static-hostname)
  - [Configuring inventory](#configuring-inventory)
  - [Exchanging SSH keys between hosts](#exchanging-ssh-keys-between-hosts)
  - [Setting proxy](#setting-proxy)
  - [Obtaining installation files](#obtaining-installation-files)
  - [Setting Git](#setting-git)
    - [GitHub token](#github-token)
    - [Customize tag/branch/sha to checkout](#customize-tagbranchsha-to-checkout)
  - [Installing Kubernetes dashboard](#installing-kubernetes-dashboard)
  - [Customization of kernel, grub parameters, and tuned profile](#customization-of-kernel-grub-parameters-and-tuned-profile)

# Quickstart
The following set of actions must be completed to set up the Open Network Edge Services Software (OpenNESS) cluster.

1. Fulfill the [Preconditions](#preconditions).
2. Become familiar with [supported features](#supported-epa-features) and enable them if desired.
3. Run the [deployment helper script](#running-playbooks) for the Ansible\* playbook:

   ```shell
   ./deploy_ne.sh
   ```

# Preconditions

To use the playbooks, several preconditions must be fulfilled. These preconditions are described in the [Q&A](#qa) section below. The preconditions are:

- CentOS\* 7.6.1810 must be installed on hosts where the product is deployed. It is highly recommended to install the operating system using a minimal ISO image on nodes that will take part in deployment (obtained from inventory file). Also, do not make customizations after a fresh manual install because it might interfere with Ansible scripts and give unpredictable results during deployment.

- Hosts for the Edge Controller (Kubernetes control plane) and Edge Nodes (Kubernetes nodes) must have proper and unique hostnames (i.e., not `localhost`). This hostname must be specified in `/etc/hosts` (refer to [Setup static hostname](#setup-static-hostname)).

- SSH keys must be exchanged between hosts (refer to [Exchanging SSH keys between hosts](#exchanging-ssh-keys-between-hosts)).

- A proxy may need to be set (refer to [Setting proxy](#setting-proxy)).

- If a private repository is used, a Github\* token must be set up (refer to [GitHub token](#github-token)).

- Refer to the [Configuring time](#configuring-time) section for how to enable Network Time Protocol (NTP) clients.

- The Ansible inventory must be configured (refer to [Configuring inventory](#configuring-inventory)).

# Running playbooks

The Network Edge deployment and cleanup is carried out via Ansible playbooks. The playbooks are run from the Ansible host (it might be the same machine as the Edge Controller). Before running the playbooks, an inventory file `inventory.ini` must be configured.

The following subsections describe the playbooks in more detail.

## Deployment scripts

For convenience, playbooks can be executed by running helper deployment scripts from the Ansible host. These scripts require that the Edge Controller and Edge Nodes be configured on different hosts (for deployment on a single node, refer to [Single-node Network Edge cluster](#single-node-network-edge-cluster)). This is done by configuring the Ansible playbook inventory, as described later in this document.

The command syntax for the scripts is: `action_mode.sh [-f flavor] [group]`, i.e.,

  - `deploy_ne.sh [-f flavor] [ controller | nodes ]`
  - `cleanup_ne.sh [-f flavor] [ controller | nodes ] `

The parameter `controller` or `nodes` in each case deploys or cleans up the Edge Controller or the Edge Nodes, respectively.

For an initial installation, `deploy_ne.sh controller` must be run before `deploy_ne.sh nodes`. During the initial installation, the hosts may reboot. After reboot, the deployment script that was last run should be run again.

The `cleanup_ne.sh` script is used when a configuration error in the Edge Controller or Edge Nodes must be fixed. The script causes the appropriate installation to be reverted, so that the error can be fixed and `deploy_ne.sh` rerun. `cleanup_ne.sh` does not do a comprehensive cleanup (e.g., installation of DPDK or Golang will not be rolled back).

## Network Edge playbooks

The `network_edge.yml` and `network_edge_cleanup.yml` files contain playbooks for Network Edge mode.
Playbooks can be customized by enabling and configuring features in the `group_vars/all/10-default.yml` file.

### Cleanup playbooks

The role of the cleanup playbook is to revert changes made by deploy playbooks.
Changes are reverted by going step-by-step in reverse order and undoing the steps.

For example, when installing Docker\*, the RPM repository is added and Docker is installed. When cleaning up, Docker is uninstalled and the repository is removed.

>**NOTE**: There may be leftovers created by the installed software. For example, DPDK and Golang installations, found in `/opt`, are not rolled back.

### Supported EPA features

Several enhanced platform capabilities and features are available in OpenNESS for Network Edge. For the full list of supported features, see [Enhanced Platform Awareness Features](https://github.com/open-ness/specs/blob/master/doc/getting-started/network-edge/supported-epa.md). The documents referenced in this list provide a detailed description of the features, and step-by-step instructions for enabling them. Users should become familiar with available features before executing the deployment playbooks.

### VM support for Network Edge
Support for VM deployment on OpenNESS for Network Edge is available and enabled by default. Certain configurations and prerequisites may need to be satisfied to use all VM capabilities. The user is advised to become familiar with the VM support documentation before executing the deployment playbooks. See [openness-network-edge-vm-support](https://github.com/open-ness/specs/blob/master/doc/applications-onboard/openness-network-edge-vm-support.md) for more information.

### Application on-boarding

Refer to the [network-edge-applications-onboarding](https://github.com/open-ness/specs/blob/master/doc/aplications-onboard/network-edge-applications-onboarding.md) document for instructions on how to deploy edge applications for OpenNESS Network Edge.

### Single-node Network Edge cluster

Network Edge can be deployed on just a single machine working as a control plane & node.<br>
To deploy Network Edge in a single-node cluster scenario, follow the steps below:
1. Modify `inventory.ini`<br>
   > Rules for inventory:
   > - IP address (`ansible_host`) for both controller and node must be the same
   > - `edgenode_group` and `controller_group` groups must contain exactly one host

   Example of a valid inventory:
   ```ini
   [all]
   controller ansible_ssh_user=root ansible_host=192.168.0.11
   node01     ansible_ssh_user=root ansible_host=192.168.0.11

   [controller_group]
   controller

   [edgenode_group]
   node01

   [edgenode_vca_group]
   ```
2. Features can be enabled in the `group_vars/all/10-default.yml` file by tweaking the configuration variables.
3. Settings regarding the kernel, grub, HugePages\*, and tuned can be customized in `group_vars/edgenode_group/10-default.yml`.
   > Default settings in the single-node cluster mode are those of the Edge Node (i.e., kernel and tuned customization enabled).
4. Single-node cluster can be deployed by running command: `./deploy_ne.sh single`

## Docker registry

Docker registry is a storage and distribution system for Docker Images. On the OpenNESS environment, Docker registry service is deployed as a pod on Control plane Node. Docker registry authentication enabled with self-signed certificates as well as all node and control plane nodes will have access to the Docker registry.

### Deploy Docker registry

Ansible "docker_registry" roles created on openness-experience-kits. For deploying a Docker registry on Kubernetes, control plane node roles are enabled on the openness-experience-kits "network_edge.yml" file.

 ```ini
  role: docker_registry/controlplane
  role: docker_registry/node
   ```
The following steps are processed during the Docker registry deployment on the OpenNESS setup.

* Generate a self-signed certificate on the Kubernetes Control plane Node.
* Build and deploy a docker-registry pod on the Control plane Node.
* Generate client.key and client.csr on the node
* Authenticate client.csr for server access.
* Share public key and client.cert on trusted Node and Ansible build host location
  /etc/docker/certs.d/<Kubernetes_Control_Plane_IP:port>
* After the Docker registry deploys, the Node and Ansible host can access the private Docker registry.
* The IP address of the Docker registry will be: "Kubernetes_Control_Plane_IP"
* The port number of the Docker registry will be: 5000

### Docker registry image push
Use the Docker tag to create an alias of the image with the fully qualified path to your Docker registry after the tag successfully pushes the image to the Docker registry.

 ```ini
  docker tag nginx:latest Kubernetes_Control_Plane_IP:5000/nginx:latest
  docker push Kubernetes_Control_Plane_IP:5000/nginx:latest
   ```
Now image the tag with the fully qualified path to your private registry. You can push the image to the registry using the Docker push command.

### Docker registry image pull
Use the `docker pull` command to pull the image from Docker registry:

 ```ini
  docker pull Kubernetes_Control_Plane_IP:5000/nginx:latest
   ```
>**NOTE**: <Kubernetes_Control_Plane_IP> should be replaced as per our docker registry IP address.


## Kubernetes cluster networking plugins (Network Edge)

Kubernetes uses 3rd party networking plugins to provide [cluster networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/).
These plugins are based on the [CNI (Container Network Interface) specification](https://github.com/containernetworking/cni).

OpenNESS Experience Kits provide several ready-to-use Ansible roles deploying CNIs.
The following CNIs are currently supported:

* [kube-ovn](https://github.com/alauda/kube-ovn)
  * **Only as primary CNI**
  * CIDR: 10.16.0.0/16
* [flannel](https://github.com/coreos/flannel)
  * IPAM: host-local
  * CIDR: 10.244.0.0/16
  * Network attachment definition: openness-flannel
* [calico](https://github.com/projectcalico/cni-plugin)
  * IPAM: host-local
  * CIDR: 10.243.0.0/16
  * Network attachment definition: openness-calico
* [weavenet](https://github.com/weaveworks/weave)
  * CIDR: 10.32.0.0/12
* [SR-IOV](https://github.com/intel/sriov-cni) (cannot be used as a standalone or primary CNI - [sriov setup](https://github.com/open-ness/specs/blob/master/doc/enhanced-platform-awareness/openness-sriov-multiple-interfaces.md))
* [Userspace](https://github.com/intel/userspace-cni-network-plugin) (cannot be used as a standalone or primary CNI - [Userspace CNI setup](https://github.com/open-ness/specs/blob/master/doc/dataplane/openness-userspace-cni.md)

Multiple CNIs can be requested to be set up for the cluster. To provide such functionality [the Multus CNI](https://github.com/intel/multus-cni) is used.

>**NOTE**: For a guide on how to add new a CNI role to the OpenNESS Experience Kits, refer to [the OpenNESS Experience Kits guide](https://github.com/open-ness/specs/blob/master/doc/getting-started/openness-experience-kits.md#adding-new-cni-plugins-for-kubernetes-network-edge).

### Selecting cluster networking plugins (CNI)

The default CNI for OpenNESS is kube-ovn. Non-default CNIs may be configured with OpenNESS by editing the file `group_vars/all/10-default.yml`.
To add a non-default CNI, the following edits must be carried out:

- The CNI name is added to the `kubernetes_cnis` variable. The CNIs are applied in the order in which they appear in the file. By default, `kube-ovn` is defined. That is,

  ```yaml
  kubernetes_cnis:
  - kubeovn
  ```

- To add a CNI, such as SR-IOV, the `kubernetes_cnis` variable is edited as follows:

  ```yaml
  kubernetes_cnis:
  - kubeovn
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
To enable NTP synchronization, change `ntp_enable` in `group_vars/all/10-default.yml`:
```yaml
ntp_enable: true
```

Servers to be used instead of default ones can be provided using the `ntp_servers` variable in `group_vars/all/10-default.yml`:
```yaml
ntp_servers: ["ntp.local.server"]
```

## Setup static hostname

The following command is used in CentOS\* to set a static hostname:

```shell
hostnamectl set-hostname <host_name>
```

As shown in the following example, the hostname must also be defined in `/etc/host`:

```shell
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4 <host_name>
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6 <host_name>
```

In addition to being a unique hostname within the cluster, the hostname must also follow Kubernetes naming conventions. For example, only lower-case alphanumeric characters "-" or "." start and end with an alphanumeric character. Refer to
[K8s naming restrictions](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) for additional details on these conventions.

## Configuring inventory

To execute playbooks, `inventory.ini` must be configured to specify the hosts on which the playbooks are executed.

The OpenNESS inventory contains three groups: `all`, `controller_group`, and `edgenode_group`.

- `all` contains all the hosts (with configuration) used in any playbook.
- `controller_group` contains host to be set up as a Kubernetes control plane / OpenNESS Edge Controller \
>**NOTE**: Because only one controller is supported, the `controller_group` can contain only one host.**
- `edgenode_group` contains hosts to be set up as a Kubernetes nodes / OpenNESS Edge Nodes. \
>**NOTE**: All nodes will be joined to the control plane specified in `controller_group`.

In the `all` group, users can specify all of the hosts for usage in other groups.
For example, the `all` group looks like:

```ini
[all]
ctrl ansible_ssh_user=root ansible_host=<host_ip_address>
node1 ansible_ssh_user=root ansible_host=<host_ip_address>
node2 ansible_ssh_user=root ansible_host=<host_ip_address>
```

The user can then use the specified hosts in `edgenode_group` and `controller_group`. That is,

```ini
[edgenode_group]
node1
node2

[controller_group]
ctrl
```

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

## Setting proxy

If a proxy is required to connect to the Internet, it is configured via the following steps:

-  Edit the `proxy_` variables in the `group_vars/all/10-default.yml` file.
-  Set the `proxy_enable` variable in `group_vars/all/10-default.yml` file to `true`.
-  Append the network CIDR (e.g., `192.168.0.1/24`) to the `proxy_noproxy` variable in `group_vars/all/10-default.yml`.

Sample configuration of `group_vars/all/10-default.yml`:

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

To provide the token, edit the value of `git_repo_token` variable in `group_vars/all/10-default.yml`.

### Customize tag/branch/sha to checkout

A specific tag, branch, or commit SHA can be checked out by setting the `controller_repository_branch` and the `edgenode_repository_branch` variables in `group_vars/all/10-default.yml` for Edge Nodes and Kubernetes control plane / Edge Controller, respectively.

```yaml
controller_repository_branch: master
edgenode_repository_branch: master
# or
controller_repository_branch: openness-20.03
edgenode_repository_branch: openness-20.03
```

## Installing Kubernetes dashboard

Kubernetes does not ship with a graphical interface by default, but a web-based tool called [Kubernetes Dashboard](https://github.com/kubernetes/dashboard) can be installed with a few simple steps. The Kubernetes dashboard allows users to manage the cluster and edge applications.

The Kubernetes dashboard can only be installed with Network Edge deployments.

Follow the below steps to install the Kubernetes dashboard after OpenNESS is installed through [playbooks](#running-playbooks).

1. Deploy the dashboard using `kubectl`:

    ```shell
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.1/aio/deploy/recommended.yaml
    ```

2. Get all the pods in all namespaces:

    ```shell
    kubectl get pods -o wide --all-namespaces
    ```

3. Create a new service account with the cluster admin:

    ```shell
    cat > dashboard-admin-user.yaml << EOF
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: admin-user
      namespace: kubernetes-dashboard
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRoleBinding
    metadata:
      name: admin-user
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: ClusterRole
      name: cluster-admin
    subjects:
    - kind: ServiceAccount
      name: admin-user
      namespace: kubernetes-dashboard
    EOF
    ```

4. Apply the admin user:

    ```shell
    kubectl apply -f dashboard-admin-user.yaml
    ```

5. Edit kubernetes-dashboard service through the following command:

    ```shell
    kubectl -n kubernetes-dashboard edit service kubernetes-dashboard
    ```

    Add `externalIPs` to the service spec, replace `<controller-ip>` with the actual controller IP address:

    ```yaml
    spec:
      externalIPs:
      - <controller-ip>
    ```

    > **OPTIONAL**: By default the dashboard is accessible at port 443, and it can be changed by editing the port value `- port: <port>` in the service spec.

6. Verify that the `kubernetes-dashboard` service has `EXTERNAL-IP` assigned:

    ```shell
    kubectl -n kubernetes-dashboard get service kubernetes-dashboard
    ```

7. Open the dashboard from the browser at `https://<controller-ip>/`. If the port was changed according to the OPTIONAL note in step 5, then use `https://<controller-ip>:<port>/` instead.

    > **NOTE**: A Firefox\* browser can be an alternative to Chrome\* and Internet Explorer\* in case the dashboard web page is blocked due to certification a issue.

8. Capture the bearer token using this command:

    ```shell
    kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
    ```

Paste the token in the browser to log in, as shown in the following diagram:

![Dashboard Login](controller-edge-node-setup-images/dashboard-login.png)

_Figure - Kubernetes Dashboard Login_

9. Go to the OpenNESS Controller installation directory and edit the `.env` file with the dashboard link `INFRASTRUCTURE_UI_URL=https://<controller-ip>:<port>/` to integrate it with the OpenNESS controller UI:

    ```shell
    cd /opt/edgecontroller/
    vi .env
    ```

10. Build the OpenNESS Controller UI:

    ```shell
    cd /opt/edgecontroller/
    make ui-up
    ```

11. The OpenNESS controller landing page is accessible at `http://<LANDING_UI_URL>/`.
    > **NOTE**: `LANDING_UI_URL` can be retrieved from `.env` file.


## Customization of kernel, grub parameters, and tuned profile

OpenNESS Experience Kits provide an easy way to customize the kernel version, grub parameters, and tuned profile. For more information, refer to [the OpenNESS Experience Kits guide](https://github.com/open-ness/specs/blob/master/doc/getting-started/openness-experience-kits.md).
