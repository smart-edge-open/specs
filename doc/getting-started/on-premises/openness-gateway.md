```text
SPDX-License-Identifier: Apache-2.0
Copyright © 2019 Intel Corporation
```

# OpenNESS gateway feature

- [OpenNESS gateway feature](#openness-gateway-feature)
  - [Introduction](#introduction)
  - [How to setup](#how-to-setup)
  - [Known limitations](#known-limitations)
  - [Further reading](#further-reading)

## Introduction

The gateway (previously known as 'proxy') feature allows us to have the
appliance located in a network otherwise not accessible from the controller.
Since it's the controller that initiates all deployment and lifecycle calls to
the appliance, this scenario would disable all the basic functionality.
However, gateway allows operations in this case still, the only
requirement being the controller is on a publicly accessible network
(or at least a network that's accessible from the appliance).
The way this works is it's the appliance that initiates all the connections -
both for API calls from the controller to the appliance as well as the
appliance to the controller path. (which would still work without the gateway,
but that wouldn't be enough for any basic functionality)

## How to setup

Gateway is now the only supported mode of operation. It's used even when the
appliance is reachable from the controller. There is no additional setup
required. The only two settings required for the correct gateway operation
(which are already setup automatically by ansible) are the controller
addresses in the ela and eva configuration file.
(ControllerEndpoint in configs/ela.json and configs/eva.json)

## Known limitations

Currently only one appliance per a public IP address (so per a specific
private network typically) is supported from a specific controller.
This limitation is because the controller uses the IP address to look up the
appliance, so changing this would require some invasive changes into the code
(but it can be done given enough use-cases)

## Further reading

If you're interested in implementation details, or want to use the gateway
library by itself, start by having a look at common/proxy/README and
common/proxy/examples.
