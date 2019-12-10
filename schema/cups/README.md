```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# 4G Control and User Plane Separation (CUPS) Management API

The 4G CUPS Management API defines a common API to manage a 3GPP CUPS element.
This allows a party to configure user planes through a centralized management
interface.

## How to Generate OpenAPI 2.0

First, install all prerequisites:

* `go install github.com/ben-krieger/grpc-gateway/protoc-gen-swagger`

Currently we are using a fork of grpc-gateway's library and protoc-gen-swagger
plugin binary in order to support read-only attributes.

Assuming that your directory structure looks like this

```
├── code.smart-edge.com
│   └── cups
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
        │   ├── cups
        │   ├── eaa
        │   ├── ela
        │   └── pb
        └── uml
            └── eaa
```

the commands to generate the schema and .pb.go will be

```
protoc -I./pb -I../../ben-krieger/grpc-gateway -I../../ben-krieger/grpc-gateway/third_party/googleapis --swagger_out=allow_repeated_fields_in_body=true,logtostderr=true:cups ./pb/cups.proto

protoc -I./pb -I../../grpc-ecosystem/grpc-gateway -I../../grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:../../.. ./pb/cups.proto
```
