# Edge Lifecycle Agent - ELA

The Edge Lifecycle Agent is a service that runs on the appliance and operates
as a deployment and lifecycle service for applications and VNFs (Virtual Network
Functions).

It also provides network interface, network zone, and application/interface policy
services.

## How to Generate OpenAPI 2.0

First, install all prerequisites:

* `go install github.com/ben-krieger/grpc-gateway/protoc-gen-swagger`

Currently we are using a fork of grpc-gateway's library and protoc-gen-swagger
plugin binary in order to support read-only attributes.

Assuming that your directory structure looks like this

```
├── code.smart-edge.com
│   └── ela
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
        │   └── pb
        └── uml
            └── eaa
```

the commands to generate the schema and .pb.go will be

```
protoc -I./pb -I../../ben-krieger/grpc-gateway -I../../ben-krieger/grpc-gateway/third_party/googleapis --swagger_out=allow_repeated_fields_in_body=true,logtostderr=true:ela ./pb/ela.proto

protoc -I./pb -I../../grpc-ecosystem/grpc-gateway -I../../grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:../../.. ./pb/ela.proto
```
