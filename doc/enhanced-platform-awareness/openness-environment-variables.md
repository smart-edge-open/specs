```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```

# Support for setting Environment Variables in OpenNESS

- [Support for setting Environment Variables in OpenNESS](#support-for-setting-environment-variables-in-openness)
  - [Overview](#overview)
  - [Details of Environment Variable support in OpenNESS](#details-of-environment-variable-support-in-openness)

## Overview

Environment variables can be configured when creating a new Docker container. Once the container is running, any Application located in that container can detect and use the variable. These variables can be used to point to information needed by the processes being run by the Application. For example, an environment variable can be set to point to a file containing information to be read in by an Application or to the address of a device that the Application needs to use.

When using environment variables, the value should be either a static value or some environment information that the Application cannot easily determine. Care should also be taken when setting environment variables, as using an incorrect variable name or value may cause the Application to operate in an unexpected way.

## Details of Environment Variable support in OpenNESS

Setting environment variables is supported when deploying containers in OnPrem mode during application onboarding. Please refer to the [Application Onboarding Document](https://github.com/open-ness/specs/blob/master/doc/applications-onboard/on-premises-applications-onboarding.md) for more details on onboarding an application in OpenNESS. The general steps outlined in the document should be performed with the following addition. When creating a new application to add to the controller's application library, the user should set the *EPA Feature Key* and *EPA Feature Value* settings. The key to be used for environment variables is `env_vars` and the value should be set as `VARIABLE_NAME=VARIABLE_VALUE`.

***Note:*** When setting environment variables, multiple variables can be provided in the *EPA Feature Value* field for a single `env_vars` key. To do so place a semi-colon (;) between each variable as follows:

    VAR1_NAME=VAR1_VALUE;VAR2_NAME=VAR2_VALUE
