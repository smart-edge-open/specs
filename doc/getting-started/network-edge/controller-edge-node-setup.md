```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```

# OpenNESS Network Edge: Controller and Edge node setup
- [OpenNESS Network Edge: Controller and Edge node setup](#openness-network-edge-controller-and-edge-node-setup)
- [Preconditions](#preconditions)
- [Running playbooks](#running-playbooks)
  - [Network Edge Playbooks](#network-edge-playbooks)
    - [Cleanup playbooks](#cleanup-playbooks)
    - [Supported EPA features](#supported-epa-features)
    - [VM support for Network Edge](#vm-support-for-network-edge)
    - [Quickstart](#quickstart)
    - [Application on-boarding](#application-on-boarding)
    - [Single-node Network Edge cluster](#single-node-network-edge-cluster)
  - [Docker Registry](#docker-registry)
    - [Deploy Docker Registry:](#deploy-docker-registry)
    - [Docker registry image push](#docker-registry-image-push)
    - [Docker registry image pull](#docker-registry-image-pull)
  - [Kubernetes cluster networking plugins (Network Edge)](#kubernetes-cluster-networking-plugins-network-edge)
    - [Selecting cluster networking plugins (CNI)](#selecting-cluster-networking-plugins-cni)
    - [Adding additional interfaces to pods](#adding-additional-interfaces-to-pods)
- [Q&A](#qa)
  - [Configuring time](#configuring-time)
  - [Setup static hostname](#setup-static-hostname)
  - [Configuring inventory](#configuring-inventory)
  - [Exchanging SSH keys with hosts](#exchanging-ssh-keys-with-hosts)
  - [Setting proxy](#setting-proxy)
  - [Setting Git](#setting-git)
    - [GitHub Token](#github-token)
    - [Customize tag/branch/sha to checkout](#customize-tagbranchsha-to-checkout)
  - [Installing Kubernetes Dashboard](#installing-kubernetes-dashboard)
  - [Customization of kernel, grub parameters and tuned profile](#customization-of-kernel-grub-parameters-and-tuned-profile)

# Preconditions

In order to use the playbooks several preconditions must be fulfilled:

- Time must be configured on all hosts (refer to [Configuring time](#configuring-time))

- Hosts for Edge Controller (Kubernetes master) and Edge Nodes (Kubernetes workers) must have proper and unique hostname (not `localhost`). This hostname must be specified in `/etc/hosts` (refer to [Setup static hostname](#Setup-static-hostname)).

- Ansible inventory must be configured (refer to [Configuring inventory](#configuring-inventory)).

- SSH keys must be exchanged with hosts (refer to [Exchanging SSH keys with hosts](#Exchanging-SSH-keys-with-hosts)).

- Proxy must be configured if needed (refer to [Setting proxy](#setting-proxy)).

- If a private repository is used Github token has to be set up (refer to [GitHub Token](#github-token)).

# Running playbooks

For convenience, playbooks can be executed by running helper deployment scripts.

> NOTE: All nodes provided in the inventory may reboot during the installation.

Convention for the scripts is: `action_mode.sh [group]`. Following scripts are available for Network Edge mode:
  - `deploy_ne.sh [ controller | nodes ]`
  - `cleanup_ne.sh [ controller | nodes ] `

To run deploy of only Edge Nodes or Edge Controller use `deploy_ne.sh nodes` and `deploy_ne.sh controller` respectively.

> NOTE: Playbooks for Edge Controller/Kubernetes master must be executed before playbooks for Edge Nodes.

> NOTE: Edge Nodes and Edge Controller must be set up on different machines.

## Network Edge Playbooks

The `network_edge.yml` and `network_edge_cleanup.yml` files contain playbooks for Network Edge mode.
Playbooks can be customized by enabling and configuring features in `group_var/all/10-default.yml` file.

### Cleanup playbooks

Role of cleanup playbook is to revert changes made by deploy playbooks.
Teardown is made by going step by step in reverse order and undoing the steps.

For example, when installing Docker - RPM repository is added and Docker installed, when cleaning up - Docker is uninstalled and then repository is removed.

Note that there might be some leftovers created by installed software.

### Supported EPA features
A number of enhanced platform capabilities/features are available in OpenNESS for Network Edge. For the full list of features supported see [supported-epa.md](https://github.com/otcshare/specs/blob/master/doc/getting-started/network-edge/supported-epa.md), the documents referenced in the list provide detailed description of the features and step by step instructions how to enable them. The user is advised to get familiarized with the features available before executing the deployment playbooks.

### VM support for Network Edge
Support for VM deployment on OpenNESS for Network Edge is available and enabled by default, certain configuration and pre-requisites may need to be fulfilled in order to use all capabilities. The user is advised to get familiarized with the VM support documentation before executing the deployment playbooks. Please see [openness-network-edge-vm-support.md](https://github.com/otcshare/specs/blob/master/doc/applications-onboard/openness-network-edge-vm-support.md) for more information.

### Quickstart
The following is a complete set of actions that need to be completed to successfully set up OpenNESS cluster.

1. Fulfill the [prerequisites](#preconditions).
2. Get familiarized with [supported features](#supported-epa-features) and enable them if desired.
3. Run the [deployment helper script](#running-playbooks) for the Ansible playbook:
   ```
   ./deploy_ne.sh
   ```

### Application on-boarding

Please refer to [network-edge-applications-onboarding.md](https://github.com/otcshare/specs/blob/master/doc/applications-onboard/network-edge-applications-onboarding.md) document for instructions on how to deploy edge applications for OpenNESS Network Edge.

### Single-node Network Edge cluster

Network Edge can be deployed on just a single machine working as a master & worker.<br>
In order to deploy Network Edge in single-node cluster scenario follow the steps:
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
2. Features can be enabled in `group_vars/all/10-default.yml` file by tweaking the configuration variables.
3. Settings regarding the kernel, grub, hugepages & tuned can be customized in `group_vars/edgenode_group/10-default.yml`.
   > Default settings in single-node cluster mode are those of the Edge Node, i.e. kernel & tuned customization enabled.
4. Single-node cluster can be deployed by running command: `./deploy_ne.sh single`

## Docker Registry 

Docker registry is a storage and distribution system for Docker Images. On OpenNESS environment, Docker registry service deployed as a pod on Master Node. Docker Registry authentication enabled with self-signed certificates and all worker and master node will have access to docker registry.

### Deploy Docker Registry:

Ansible “docker_registry” roles created on openness-experience-kits. For deploying docker registry on Kubernetes master node roles are enabled on openness-experience-kits “network_edge.yml” file.

 ```ini
  role: docker_registry/master
  role: docker_registry/worker
   ```
Following steps are processed during the docker registry deploy on openness setup.

* Generate a self-signed certificate on Kubernetes Master Node.
* Build and Deploy docker-registry pod on the Master Node.
* Generate client.key and client.csr key on the worker node
* Authenticate client.csr for server access.
* Share public key and client.cert on trusted Worker Node and ansible build Host location
  /etc/docker/certs.d/<Kubernetes_Master_IP: port>
* After the docker registry deploy successfully Worker Node and Ansible host can access the private docker registry.
* IP address of docker registry will be: “Kubernetes_Master_IP”
* Port no of docker registry will be: 5000

### Docker registry image push
Use the docker tag to create an alias of the image with the fully qualified path to your docker registry after tag success push image on docker registry.

 ```ini
  docker tag nginx:latest Kubernetes_Master_IP:5000/nginx:latest
  docker push Kubernetes_Master_IP:5000/nginx:latest
   ```
Now image tag with the fully qualified path to your private registry, you can push the image to the registry using docker push command.

### Docker registry image pull
Use the docker pull command to pull the image from docker registry:

 ```ini
  docker pull Kubernetes_Master_IP:5000/nginx:latest
   ```
> NOTE: <Kubernetes_Master_IP> should be replaced as per our docker registry IP address.


## Kubernetes cluster networking plugins (Network Edge)

Kubernetes uses 3rd party networking plugins to provide [cluster networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/).
These plugins are based on [CNI (Container Network Interface) specification](https://github.com/containernetworking/cni).

OpenNESS Experience Kits provides several ready-to-use Ansible roles deploying CNIs.
Following CNIs are currently supported:
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
* [SR-IOV](https://github.com/intel/sriov-cni) (cannot be used as a standalone or primary CNI - [sriov setup](doc/enhanced-platform-awareness/openness-sriov-multiple-interfaces.md))

Multiple CNIs can be requested to be set up for the cluster. To provide such functionality [Multus CNI](https://github.com/intel/multus-cni) is used.

> NOTE: For guide on how to add new CNI role to the OpenNESS Experience Kits refer to [the OpenNESS Experience Kits guide](../openness-experience-kits.md#adding-new-cni-plugins-for-kubernetes-network-edge)

### Selecting cluster networking plugins (CNI)

> Note: When using non-default CNI (default is kube-ovn) remember to add CNI's networks (CIDR for pods and other CIDRs used by the CNI) to `proxy_os_noproxy` in `group_vars/all/10-default.yml`

In order to customize which CNI are to be deployed for the Network Edge cluster edit `kubernetes_cnis` variable in `group_vars/all/10-default.yml` file.
CNIs are applied in requested order.
By default `kube-ovn` and `calico` are set up (with `multus` in between):
```yaml
kubernetes_cnis:
- kubeovn
- calico
```

For example, to add SR-IOV just add another item on the list. That'll result in following CNIs being applied: `kube-ovn`, `multus`, `calico` and `sriov`.
```yaml
kubernetes_cnis:
- kubeovn
- calico
- sriov
```

### Adding additional interfaces to pods

In order to add additional interface from secondary CNIs annotation is required.
Below is an example pod yaml file for a scenario with `kube-ovn` as a primary CNI and `calico` and `flannel` as additional CNIs.
Multus will create an interface named `calico` using network attachment definition `openness-calico` and interface `flannel` using network attachment definition `openness-flannel`:

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

Below is an output (some lines were cut out for readability) of `ip a` command executed in the pod.
Following interfaces are available: `calico@if142`, `flannel@if143` and `eth0@if141` (`kubeovn`).
```
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

By default CentOS ships with [chrony](https://chrony.tuxfamily.org/) NTP client. It uses default NTP servers listed below that might not be available in certain networks:
```
0.centos.pool.ntp.org
1.centos.pool.ntp.org
2.centos.pool.ntp.org
3.centos.pool.ntp.org
```
OpenNESS requires the time to be synchronized between all of the nodes and controllers to allow for correct certificate verification.

OpenNESS provides possibility to synchronize machine's time with NTP server.
To enable NTP synchronization change `ntp_enable` in `group_var/all/10-default.yml`:
```yaml
ntp_enable: true
```

Servers to be used instead of default ones can be provided using `ntp_servers` variable in `group_var/all/10-default.yml`:
```yaml
ntp_servers: ["ntp.local.server"]
```

## Setup static hostname

In order to set some custom static hostname a command can be used:

```
hostnamectl set-hostname <host_name>
```

Make sure if static hostname provided is proper and unique (refer to [K8s naming restrictions](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)).
The hostname provided needs to be defined in /etc/hosts as well:

```
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4 <host_name>
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6 <host_name>
```

## Configuring inventory

In order to execute playbooks, `inventory.ini` must be configure to include specific hosts to run the playbooks on.

OpenNESS' inventory contains three groups: `all`, `edgenode_group`, and `controller_group`:

- `all` contains all the hosts (with configuration) used in any playbook
- `controller_group` contains host to be set up as a Kubernetes master / OpenNESS Edge Controller \
**WARNING: Since only one Controller is supported, `controller_group` can contain only 1 host.**
- `edgenode_group` contains hosts to be set up as a Kubernetes workers / OpenNESS Edge Nodes. \
**NOTE: All nodes will be joined to the master specified in `controller_group`.**

In `all` group user can specify all of the hosts for usage in other groups.
Example `all` group looks like:

```ini
[all]
ctrl ansible_ssh_user=root ansible_host=<host_ip_address>
node1 ansible_ssh_user=root ansible_host=<host_ip_address>
node2 ansible_ssh_user=root ansible_host=<host_ip_address>
```

Then user can use specified hosts in `edgenode_group` and `controller_group`, i.e.:

```ini
[edgenode_group]
node1
node2

[controller_group]
ctrl
```

## Exchanging SSH keys with hosts

Exchanging SSH keys will allow for password-less SSH from host running Ansible to hosts being set up.

First, host running Ansible must have generated SSH key. SSH key can be generated by executing `ssh-keygen` and following program's output. Here's example - key is located in standard location (`/root/.ssh/id_rsa`) and empty passphrase is used.

```
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

Then, generated key must be copied to **every host from the inventory**. It is done by running `ssh-copy-id`, e.g.:

```
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

Now try logging into the machine, with:   "ssh 'root@host'"
and check to make sure that only the key(s) you wanted were added.
```

To make sure key is copied successfully, try to SSH to the host: `ssh 'root@host'`. It should not ask for the password.

## Setting proxy

If proxy is required in order to connect to the Internet it can be configured in `group_vars/all/10-default.yml` file.
To enable proxy provide values for `proxy_` variables and set `proxy_enable` to `true`.
Also append your network CIDR (e.g. `192.168.0.1/24`) to the `proxy_noproxy`.

Sample configuration:

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
# No proxy setting contains addresses and networks that should not be accessed using proxy (e.g. local network, Kubernetes CNI networks)
# NOTE - VCA: 172.32.1.0/24 is used for VCA node.
proxy_noproxy: "localhost,virt-api,kubevirt.svc,virt-api.kubevirt.svc,cdi-api,cdi.svc,127.0.0.1,10.244.0.0/16,10.96.0.0/16,10.16.0.0/16,10.32.0.0/12,172.32.1.0/24,192.168.0.1/24"
```
> NOTE: Ensure the no_proxy environment variable in your profile is set
>
>     export no_proxy="localhost,127.0.0.1,10.244.0.0/24,10.96.0.0/12,192.168.0.1/24"
## Setting Git

### GitHub Token

> NOTE: Only required when cloning private repositories. Not needed when using github.com/open-ness repositories.

In order to clone private repositories GitHub token must be provided.

To generate GitHub token refer to [GitHub help - Creating a personal access token for the command line](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line).

To provide the token, edit value of `git_repo_token` variable in in `group_vars/all/10-default.yml`.

### Customize tag/branch/sha to checkout

Specific tag, branch or commit SHA can be checked out by setting `controller_repository_branch` and `edgenode_repository_branch` variables in `group_vars/all/10-default.yml` for Edge Nodes and Kubernetes master / Edge Controller respectively.

```yaml
controller_repository_branch: master
edgenode_repository_branch: master
# or
controller_repository_branch: openness-20.03
edgenode_repository_branch: openness-20.03
```

## Installing Kubernetes Dashboard

Kubernetes does not ship with a graphical interface by default, but a web-based tool called [Kubernetes Dashboard](https://github.com/kubernetes/dashboard) can be installed with few simple steps. Kubernetes Dashboard allows users to manage the cluster and the edge applications.

Kubernetes dashboard can only be installed with Network Edge deployments.

Follow the below steps to get the Kubernetes dashboard installed after OpenNESS is installed through [playbooks](#running-playbooks).

1. Deploy the dashboard using `kubectl`

    ```shell
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.1/aio/deploy/recommended.yaml
    ```

2. Grep all the pods & namespaces

    ```shell
    kubectl get pods -o wide --all-namespaces
    ```

3. Create a new service account with the cluster admin

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

4. Apply admin user

    ```shell
    kubectl apply -f dashboard-admin-user.yaml
    ```

5. Edit kubernetes-dashboard service through the following command,

    ```shell
    kubectl -n kubernetes-dashboard edit service kubernetes-dashboard
    ```

    Add `externalIPs` to the service spec — replace `<controller-ip>` with the actual controller IP address,
    ```yaml
    spec:
      externalIPs:
      - <controller-ip>
    ```

    > **OPTIONAL**: By default the dashboard is accessible at port 443, it can be changed by editing the port value `- port: <port>` in the service spec.

6. Verify that the `kubernetes-dashboard` service has `EXTERNAL-IP` assigned, 

    ```shell
    kubectl -n kubernetes-dashboard get service kubernetes-dashboard
    ```

7. Open the dashboard from the browser at `https://<controller-ip>/`. If the port was changed according to the OPTIONAL note at step 5, then use `https://<controller-ip>:<port>/` instead.

    > **NOTE**: Firefox browser can be an alternative to Chrome and Internet Explorer in case the dashboard web page is blocked due to certification issue.

8. Capture the bearer token using this command

    ```shell
    kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
    ```

Paste the Token in the browser to log in as shown in this diagram

![Dashboard Login](controller-edge-node-setup-images/dashboard-login.png)
_Figure - Kubernetes Dashboard Login_

9. Go to the OpenNESS Controller installation directory and edit the `.env` file with the dashboard link `INFRASTRUCTURE_UI_URL=https://<controller-ip>:<port>/` in order to get it integrated with the OpenNESS controller UI

    ```shell
    cd /opt/edgecontroller/
    vi .env
    ```

10. Build the OpenNESS Controller UI

    ```shell
    cd /opt/edgecontroller/
    make ui-up
    ```

11. The OpenNESS controller landing page is accessible at `http://<LANDING_UI_URL>/`.
    > **NOTE**: `LANDING_UI_URL` can be retrieved from `.env` file.


## Customization of kernel, grub parameters and tuned profile

OpenNESS Experience Kits provides easy way to customize kernel version, grub parameters and tuned profile - for more information refer to [the OpenNESS Experience Kits guide](https://github.com/otcshare/specs/blob/master/doc/getting-started/openness-experience-kits.md).
