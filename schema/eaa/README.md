```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# Edge Application Agent - EAA

The Edge Application Agent is a service that runs on the appliance and operates
as a discovery service and basic message bus between applications via pubsub.
The connectivity and discoverability of applications by one another is governed
by an entitlement system and is controlled by policies set with the MEC
Platform Controller.

The entitlement system is still in its infancy, however, and currently allows
all applications to discover one another as well as publish and subscribe to
all notifications.

## How to Generate OpenAPI 2.0

First, install all prerequisites:

* `go install github.com/ben-krieger/grpc-gateway/protoc-gen-swagger`

Currently we are using a fork of grpc-gateway's library and protoc-gen-swagger
plugin binary in order to support read-only attributes and 

Assuming that your directory structure looks like this

```
├── ben-krieger
│   └── grpc-gateway
│       ├── protoc-gen-grpc-gateway
│       │   ├── descriptor
│       │   ├── generator
│       │   ├── gengateway
│       │   └── httprule
│       └── protoc-gen-swagger
│           ├── genswagger
│           └── options
└── smartedgemec
    ├── controller-ce
    │   └── cmd
    ├── schema
    │   ├── eaa
    │   └── pb
    └── uml
        └── eaa
```

the command to generate the schema will be

```
protoc -I./pb -I../../ben-krieger/grpc-gateway -I../../ben-krieger/grpc-gateway/third_party/googleapis --swagger_out=allow_repeated_fields_in_body=true,logtostderr=true:eaa ./pb/eaa.proto
```

## Sequence Diagram

@startuml
title EAA
skinparam BoxPadding 10
skinparam ParticipantPadding 10

box "Applications" #LightSkyBlue
participant "Consumer App" as app1
participant "Producer App" as app2
end box
box "Platform" #LightCoral
participant "EAA" as eaa
end box

== Connection Establishment ==
app1 -> eaa: ""GET /notifications""
activate eaa
return ""HTTP 101: Upgrade""
app1 <<-->> eaa: [WSS] Connected

== Service Activation ==
note left of eaa: ""urn = {urn.namespace} + ':' + {urn.id}""
app2 -> eaa: ""POST /services""\n\
""Auth: /CN={urn}""\n\
""{ ""\n\
""  "description": "string"""\n\
""  "notifications": [""\n\
""    "name": "string" ""\n\
""    "version": "string" ""\n\
""    "description": "string" ""\n\
""  ]""\n\
""} ""
activate eaa
return ""HTTP 200: OK""

== Service Discovery ==
app1 -> eaa: ""GET /services""
activate eaa
return ""HTTP 200: application/json""\n\
""[""\n\
""  { ""\n\
""    "urn": {""\n\
""      "id": "string"""\n\
""      "namespace": "string"""\n\
""    }""\n\
""    "description": "string" ""\n\
""    "endpoint_uri": "string" ""\n\
""    "status": "string" ""\n\
""    "notifications": [ ""\n\
""      { ""\n\
""        "name": "string" ""\n\
""        "version": "string" ""\n\
""        "description": "string" ""\n\
""      } ""\n\
""    ] ""\n\
""  } ""\n\
""]""

== Service Subscription ==
app1 -> eaa: ""POST /subscriptions/{urn.namespace}/{urn.id}""\n\
""[ ""\n\
""  "name": "string" ""\n\
""  "version": "string" ""\n\
""] ""
activate eaa
return ""HTTP 201: Subscribed""

== Publish Update ==
app2 -> eaa: ""POST /notifications""\n\
""{""\n\
""  "name": "string" ""\n\
""  "version": "string" ""\n\
""  "payload": "object" ""\n\
""}""
activate eaa
return ""HTTP 202: Accepted""
group to all subscribers
eaa -->> app1: ""[WSS] DATA""\n\
""{""\n\
""  "name": "string" ""\n\
""  "version": "string" ""\n\
""  "payload": "object" ""\n\
""  "urn": {""\n\
""    "id": "string"""\n\
""    "namespace": "string"""\n\
""  }""\n\
""}""
end

== List Subscriptions ==
app1 -> eaa: ""GET /subscriptions""
activate eaa
return ""HTTP 200: application/json""\n\
""[""\n\
""  { ""\n\
""    "urn": {""\n\
""      "id": "string"""\n\
""      "namespace": "string"""\n\
""    }""\n\
""    "notifications": [ ""\n\
""      { ""\n\
""        "name": "string" ""\n\
""        "version": "string" ""\n\
""        "description": "string" ""\n\
""      } ""\n\
""    ] ""\n\
""  } ""\n\
""]""

== Service Unsubscription ==
app1 -> eaa: ""DELETE /subscriptions/{urn.namespace}/{urn.id}""
activate eaa
return ""HTTP 204: Unsubscribed""

== Mass Unsubscription ==
app1 -> eaa: ""DELETE /subscriptions""
activate eaa
return ""HTTP 204: Unsubscribed""

== Service Deactivation ==
app2 -> eaa: ""DELETE /services""
activate eaa
return ""HTTP 204: Deactivated""

@enduml

