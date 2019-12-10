```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# Edge Lifecycle Agent - ELA

The Edge Lifecycle Agent is a service that runs on the appliance and operates
as a deployment and lifecycle service for applications and VNFs (Virtual Network
Functions).

It also provides network interface, network zone, and application/interface policy
services.

## Generate Code

```
protoc -I./pb -I../../grpc-ecosystem/grpc-gateway -I../../grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:../../.. ./pb/ela.proto
```
