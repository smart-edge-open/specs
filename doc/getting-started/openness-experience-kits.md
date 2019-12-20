```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# OpenNESS Experience Kits

- [OpenNESS Experience Kits](#openness-experience-kits)
  - [Purpose](#purpose)
  - [OpenNess setup playbooks](#openness-setup-playbooks)
  - [Playbooks for OpenNESS offline deployment](#playbooks-for-openness-offline-deployment)

## Purpose

OpenNESS Experience Kits repository contains set of Ansible playbooks for:

- easy setup of OpenNESS in **Network Edge** and **On-Premise** modes
- preparation and deployment of the **offline package** (i.e. package for OpenNESS offline deployment in On-Premise mode)

## OpenNess setup playbooks



## Playbooks for OpenNESS offline deployment

When Edge Controller and Edge Node machines have no internet access and the networking between them is only local, it is possible to deploy OpenNESS using **offline package**. Following ansible playbooks are provided:

- playbooks that download all the packages and dependencies to the local folder and create offline package archive file;
- playbooks that unpack the archive file and install packages.
