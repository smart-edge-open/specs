```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# Kube-ovn mode

Kube-ovn is an extension to the Edge Lifecycle Agent's traffic policies services.
It introduces support for traffic policies similar to Kubernetes' NetworkPolicy.

## Generate Code

```
protoc -I/usr/local/include -I./pb -I../../../grpc-ecosystem/grpc-gateway -I../../../grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:../../.. ./pb/kube-ovn.proto
```
