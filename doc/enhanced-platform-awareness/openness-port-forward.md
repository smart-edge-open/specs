```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```

# Support for setting up port forwarding of a container in OpenNESS On-Prem mode

- [Support for setting up port forwarding of a container in OpenNESS On-Prem mode](#support-for-setting-up-port-forwarding-of-a-container-in-openness-on-prem-mode)
  - [Overview](#overview)
  - [Usage](#usage)

## Overview

This feature enables the user to set up external network ports for their application (container) - so that applications running on other hosts can connect.

## Usage
To take advantage of this feature, all you have to do is fill in the port and protocol fields during application creation.
OpenNESS will pass that information down to Docker, and assuming all goes well, when you start this container your ports will be exposed.

For more details on the application onboarding (including other fields to set), please refer to 
[Application Onboarding Document](https://github.com/otcshare/specs/blob/master/doc/applications-onboard/on-premises-applications-onboarding.md) 
