```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# Shared storage for containers in OpenNESS On-Prem mode
- [Overview](#overview)
- [Usage](#usage)

## Overview

OpenNESS On-Prem mode provides possibility to use volume and bind mount storage models known from docker. For detailed information please refer to: https://docs.docker.com/storage/volumes/ and https://docs.docker.com/storage/bind-mounts/. In OpenNESS On-Prem it is achieved by simply adding mount items to the containers `HostConfig` structure. 

## Usage

In order to add volume/bindmount to node container application user should use `EPA Feature` part of application creation form on 
ControllerUI->APPLICATIONS->ADD APPLICATION by adding item with `mount` EPA Feature Key. Valid syntax of EPA Feature Value in such case should be `...;type,source,target,readonly;...` where:
- multiple mounts can be added in one EPA Feature by delimiting with semicolons
- supported types are `volume` and `bind` which corresponds to volume and bind mount known from docker
- source:
    - volume name (volume will be automatically created if not exists) for `volume` type
    - location on the Host machine for `bind` type
- taget is location inside the container
- readonly: setting to `true` will set volume/bind mount to read-only mode
- invalid entries will be skipped
  
Example valid EPA Feature entry:
- EPA Feature Key: `mount`
- EPA Feature Value: `volume,testvolume,/testvol,false;bind,/home/testdir,/testbind,true`
