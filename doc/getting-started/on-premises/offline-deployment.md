```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

- [Introduction](#introduction)
- [Packages overview](#packages-overview)
- [Offline package](#offline-package)
  - [Preconditions for build server](#preconditions-for-build-server)
  - [Build offline package](#build-offline-package)
- [Restore offline package](#restore-offline-package)
  - [Restore variants](#restore-variants)
  - [Preconditions for EdgeController server](#preconditions-for-edgecontroller-server)
  - [Configure inventory](#configure-inventory)
  - [Deploy controller](#deploy-controller)
  - [Deploy nodes](#deploy-nodes)
- [OS Proxy set up](#os-proxy-set-up)
  - [/etc/environment](#etcenvironment)
  - [/etc/yum.conf](#etcyumconf)
- [HDDL](#hddl)
- [Troubleshooting](#troubleshooting)

# Introduction
The aim of this guide is to familiarize the user with the OpenNESS on-premises offline package create and restore process.
This guide will provide instructions on how to create offline product package and how to restore it on servers.

Since OpenNESS product is normally compiled from sources on-the-fly and contains a lot of dependencies, it tries to download a lot of open source code from the internet, so it is a mandatory requirement. It gets a bit complicates when user environment has no access to the internet, either though proxy or at all (secure environments).
Thanks to building offline package feature, user can now build a product package and install it in no-internet access environment.

# Packages overview

Unless otherwise stated, any OpenNESS package is treated as online.
Offline package mentioned in this document, means that user can compile product, download all of its dependencies and store product in a single file. Then, such file can be transferred to environments without internet access and deployed there. There is no difference in functionality between on-premises online and offline package, but creating and restoring offline packages requires a few additional steps. Both for preparing build server and machines where product will be deployed.

# Offline package
## Preconditions for build server
* CentOS 7.6 Minimal distro (x86_64) is installed on hardware
* no additional software is installed
* System proxy and proxy for yum is configured
* date, time and timezone is set up correctly
* server is able to access the internet
* user has administrative rights on this server (root user permissions)
* user downloaded openness-experience-kits repository
* github token is available (for accessing some of Github repositories)

## Build offline package
1. Log in to the newly set up server as root user. Do not use "sudo" command.
2. Run below two commands to generate ssh private/public key pair and copy it to localhost. Leave password for public key empty and accept defaults.
   ```
   ssh-keygen
   ssh-copy-id root@localhost
   ```
3. Download OpenNESS Experience Kits repository to server (preferably through scp command).
4. Extract its content. No special path is required, it can be /root user subfolder.
   ```
   tar xf <oek_repository_tar_file>
   ```
5. Modify `github_token` variable in `<oek_repository>/group_vars/all.yml` file and put your github token there.
6. If proxy is used to access the internet, modify file `<oek_repository>/group_vars/all.yml` and change below variables, giving real ones instead of defaults listed:
   ```
   proxy_yum_url: http://proxy.example.org:3128
   proxy_os_enable: true
   proxy_os_remove_old: true
   proxy_os_http: "http://proxy.example.org:3128"
   proxy_os_https: "http://proxy.example.org:3129"
   proxy_os_ftp: "http://proxy.example.org:3128"
   proxy_os_noproxy: "localhost,127.0.0.1,10.244.0.0/16,10.96.0.0/24,10.16.0.0/16"
   ```
7. Additionally, if using proxy, modify `/etc/yum.conf` file and add proxy line there, too:
   ```
   proxy=http://proxy.example.org:3128
   ```
8. Navigate to extracted `<oek_repository>` folder and run the following command:
   ```
   ./prepare_offline_package.sh
   ```
   Note: This operation might take up 40 minutes or more, depending on your network download speed.

9. Once the script completes successfully, you will be informed on screen where the offline package is located. It will contain precompiled binaries, Docker images and content fetched from the internet, required for further package installation on target server.
   ```
   Note: If scripts fails for some reason, please remove the following folder: `/opt/openness-offline` and rerun prepare script.
   ```

# Restore offline package
Offline package contains the code both for Edge Controller and all Edge Nodes.
Using two provided scripts, it is possible to set up controller and any amount of nodes.
User can modify `inventory.ini` file, enter IP addresses of servers that will have node/controller roles installed.

## Restore variants
There are many variants of deploying offline package.

For example:
- one additional server is used (so called control server), where user copies offline package and initiates deployment on a separate servers from it
- without additional server and user will copy generated offline package directly to one of the servers that is going to have Edge Controller role installed and Edge Nodes will be installed from it, according to the list of hosts in `inventory.ini` file

Both variants are supported.
Next chapters in this document assume that the second variant is used (without control server).

## Preconditions for EdgeController server
* CentOS 7.6 Minimal distro (x86_64) is installed on hardware
* no any additional software is installed
* OS proxy is disabled
* date, time and timezone is set up correctly
* user has administrative rights on this server (root user permissions)
* control server is able to reach other OpenNESS hosts via network
```
Note: this server - compared to build server (where offline package is created) - does not need any proxy settings, github tokens or OpenNESS repository code. Only on-premises offline package is required.
```

## Configure inventory
Deploying controller or node uses Ansible native mechanisms for inventory set up (=list of host to be configured/deployed) and playbooks approach (select specific roles to be applied to nodes being deployed).

For the ease of understanding inventory, lets assume that user needs to deploy one controller and one node.

In extracted offline package, in `openness-experience-kits` folder, you will find a file called `inventory.ini`.
* In section called `[all]` user needs to pass a real, private IP addresses for hosts where controller and nodes will be deployed. This will act as a general storage for all hosts.
* connection will take place through SSH protocol
* in `[controller_group]` section, user needs to put only the name of server that will be configured and have dedicated role installed. Only one controller can be placed here. Use server name provided in `[all]` section, do not use IP addresses here
* in `[edgenode_group]` user can put one or more hosts that will have a node role installed. It means that when script for deploying node is run, it will affect all servers listed in `[edgenode_group]`

   ```
   Note: do not change controller settings in inventory file once any amount of nodes had been deployed. Node settings rely on controller IP address, so if it changed after nodes were deployed, then nodes must be deployed again.
   ```

## Deploy controller

1. Using USB stick, copy offline package to server that will have a controller role installed.
2. Log in to the server as root user. Do not use "sudo" command.
3. Change its hostname, so that it will not contain both localhost and localdomain strings. Hostname shall be unique across network of Controller and Nodes. Please restart your server for the applied change to take effect.
4. After restart, append this hostname string to `/etc/hosts` file for `127.0.0.1` address (IPv4 and IPv6), like:
   ```
   127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4 YOUR_NEW_HOSTNAME
   ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6 YOUR_NEW_HOSTNAME
   ```
5. Run below two commands to generate ssh private/public key pair and **copy it to localhost (i.e. controller)**. Leave password for public key empty and accept defaults. Please do not use localhost nor 127.0.0.1 address as `<edgecontroller_ip_address>`.
   ```
   # ssh-keygen
   # ssh-copy-id root@<edgecontroller_ip_address>
   ```
6. Extract offline package content. No special path is required, it can be /root user subfolder.
   ```
   tar xf <offline_package_tar>
   ```
   You will see files like `extract.sh` or `openness-experience-kits.tar.gz`.
7. Run `extract.sh` script.
8. Go to `openness-experience-kits` folder.
9. Update `inventory.ini` file and enter IP address of this controller machine machine in `[all]` section. Do not use localhost or 127.0.0.1.
10. Run deploy script:
   ```
   ./deploy_onprem_controller.sh
   ```
   This operation may take 40 minutes or more.<br>
   Controller functionality will be installed on this server as defined in `group_vars/all.yml` using its IP address obtained from `[all]` section.<br>
   Once script completes successfully (it runs Ansible roles one by one), you may proceed to the subchapter for installing/deploying nodes using different script.

## Deploy nodes

Each server that will have node role installed, needs to have a private IP address, unique hostname set up (different than localhost.localdomain) and controller ssh public key copied there, so that controler can use SSH connection to those machines without a need to type password.

Assuming that no separate control server is used, and all nodes are deployed directly from Edge Controller server, follow these steps:
1. Log into controller as root user.
2. Go to `openness_experience_kits/group_vars` folder.
3. Modify file `all.yml` and add required hosts to `[edenode_group]`. Use names here obtained from `[all]` section.
4. Make sure you are able to at least ping one host (by IP address) from this group from this controller machine.
5. Because controller deploys nodes via SSH protocol using ssh keys, controller public key needs to be copied to each node.
6. For each node defined in `[edgenode_group]`, copy SSH public key.
   ```
   # ssh-copy-id <edgenode_ip_address>
   ```
7. From now on, controller can connect to nodes using not password, but SSH key.

Steps to follow on each node from `[edgenode_group]`:
1. Log into each node
2. Change its hostname, so that it will not contain both localhost and localdomain strings. Hostname shall be unique across network of Controller and Nodes. Please restart your server for the applied change to take effect.
3. Additionally, append this hostname string to `/etc/hosts` file for `127.0.0.1` address (IPv4 and IPv6), like:
   ```
   127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4 YOUR_NEW_HOSTNAME
   ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6 YOUR_NEW_HOSTNAME
   ```

And finally, run `deploy_onprem_node.sh` script from controller:
1. Log into controller as root user.
2. Go to extracted `openness_experience_kits` folder:
3. Run deploy script for nodes:
   ```
   ./deploy_onprem_node.sh
   ```
   Note: This operation may take one hour or more, depending on the amount of chosen hosts in inventory.<br>
   Node functionality will be installed on chosen list of hosts.<br>
   Once scripts completes successfully, nodes will try to establish connection with the Controller.<br>
   Time needed depends on network speed, cpu and local storage speed (SSD, HDD).<br>

# OS Proxy set up

This is an example only, on how to set up proxy on CentOS operating system.
To initially configure OS proxy, two files need to be configured and contain below variables. Change defaults given below and use settings obtained from your network administrator.

## /etc/environment
http_proxy=http://proxy.example.com:3128
https_proxy=http://proxy.example.com:3128
ftp_proxy=http://proxy.example.com:3128
no_proxy=localhost,127.0.0.1
HTTP_PROXY=http://proxy.example.com:3128
HTTPS_PROXY=http://proxy.example.com:3128
FTP_PROXY=http://proxy.example.com:3128
NO_PROXY=localhost,127.0.0.1

## /etc/yum.conf
proxy=http://proxy.example.com:3128

```
Note: please log out and log in again, to make sure your environment loads then automatically.
```
Note: for build server, both files need to be configured and for server where offline package is being extracted, only `/etc/yum.conf`.

# HDDL

Offline prepare and restore of the HDDL image is not enabled by default due to its size.

In order to prepare and later restore the HDDL image, `- role: offline/prepare/hddl` line must be uncommented in `offline_prepare.yml` playbook before running `prepare_offline_package.sh` script. This will result in OpenVINO (tm) toolkit being downloaded and the intermediate HDDL Docker image being built.

During offline package restoration HDDL role must be enabled in order to finish the building. It is done by uncommenting `- role: hddl` line in `onprem_node.yml` before `deploy_onprem_node.sh` is executed.

# Troubleshooting
Q: <br>
A:
