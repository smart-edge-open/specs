```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# Edge Virtualization Agent - EVA

The Edge Virtualization Agent is a service that runs on the appliance and operates
as a mediator between the infrastructure that the apps run on and the other
edge components.

The EVA abstracts how applications were deployed, whether with native calls to
the appliance or through an external orchestrator, such as Kubernetes for
containerized apps. In order to achieve this, there is also a complementary EVA
service running on the Controller that the appliance EVA service can call when
the appliance was configured as a node/slave of an external orchestrator.

As an example, an RPC to list the running containers on the node can take two
paths:

1. If the node is unorchestrated, then it can call the Docker daemon to get its
   response data.
2. If the node is orchestrated, then it can call the Controller EVA service
   which in turn will query the orchestrator for a list of containers on the
   requesting appliance.

## Generate Code

```
protoc -I./pb -I../../grpc-ecosystem/grpc-gateway -I../../grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:../../.. ./pb/eva.proto
```
