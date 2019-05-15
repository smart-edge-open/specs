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

## How to Generate OpenAPI 2.0

First, install all prerequisites:

* `go install github.com/ben-krieger/grpc-gateway/protoc-gen-swagger`

Currently we are using a fork of grpc-gateway's library and protoc-gen-swagger
plugin binary in order to support read-only attributes.

Assuming that your directory structure looks like this

```
├── code.smart-edge.com
│   └── eva
│       ├── pb
├── github.com
    └── ben-krieger
    │   └── grpc-gateway
    │   │   ├── protoc-gen-grpc-gateway
    │   │   │   ├── descriptor
    │   │   │   ├── generator
    │   │   │   ├── gengateway
    │   │   │   └── httprule
    │   │   └── protoc-gen-swagger
    │   │       ├── genswagger
    │   │       └── options
    │   └── grpc-ecosystem
    │       ├── grpc-gateway
    └── smartedgemec
        ├── controller-ce
        │   └── cmd
        ├── schema
        │   ├── eaa
        │   ├── ela
        │   ├── eva
        │   └── pb
        └── uml
            └── eaa
```

the commands to generate the schema and .pb.go will be

```
protoc -I./pb -I../../ben-krieger/grpc-gateway -I../../ben-krieger/grpc-gateway/third_party/googleapis --swagger_out=allow_repeated_fields_in_body=true,logtostderr=true:eva ./pb/eva.proto

protoc -I./pb -I../../grpc-ecosystem/grpc-gateway -I../../grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:../../.. ./pb/eva.proto
```
