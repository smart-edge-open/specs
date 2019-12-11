```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```

# OpenNESS Application development and porting guide
- [OpenNESS Application development and porting guide](#openness-application-development-and-porting-guide)
  - [Introduction](#introduction)
  - [OpenNESS Edge Node Applications](#openness-edge-node-applications)
    - [<b>Producer Application</b>](#bproducer-applicationb)
    - [<b>Consumer Application</b>](#bconsumer-applicationb)
    - [Example of Producer and Consumer Applications](#example-of-producer-and-consumer-applications)
      - [OpenVINO Producer Application](#openvino-producer-application)
      - [OpenVINO Consumer Application](#openvino-consumer-application)
      - [Execution Flow Between EAA, Producer and Consumer](#execution-flow-between-eaa-producer-and-consumer)
    - [<b> Cloud Adapter Edge compute Application </b>](#b-cloud-adapter-edge-compute-application-b)
  - [Application On-boarding](#application-on-boarding)
    - [OpenNESS-aware Applications](#openness-aware-applications)
      - [Authentication](#authentication)
      - [Service Activation](#service-activation)
      - [Service Discovery and Subscription](#service-discovery-and-subscription)
      - [Service Notifications](#service-notifications)
    - [OpenNESS-agnostic Applications](#openness-agnostic-applications)
    - [Make Legacy Applications OpenNESS-aware](#make-legacy-applications-openness-aware)

## Introduction
OpenNESS is an open source software toolkit to enable easy orchestration of edge services across diverse network platform and access technologies in multi-cloud environments. It is inspired by the edge computing architecture defined by the ETSI Multi-access Edge Computing standards (e.g., [ETSI_MEC 003]), as well as the 5G network architecture ([3GPP_23501]).
 
It leverages major industry edge orchestration frameworks, such as Kubernetes and OpenStack, to implement a cloud-native architecture that is multi-platform, multi-access, and multi-cloud. It goes beyond these frameworks, however, by providing the ability for applications to publish their presence and capabilities on the platform, and for other applications to subscribe to those services. Services may be very diverse, from providing location and radio network information, to operating a computer vision system that recognize pedestrians and cars, and forwards metadata from those objects to to downstream traffic safety applications.
 
OpenNESS is access network agnostic, as it provides an architecture that interoperates with LTE, 5G, WiFi, and wired networks. In edge computing, dataplane flows must be routed to edge nodes with regard to physical location (e.g., proximity to the endpoint, system load on the edge node, special hardware requirements). OpenNESS provides APIs that allow network orchestrators and edge computing controllers to configure routing policies in a uniform manner.
 
This guide is targeted at the <b><i>Cloud Application developers</b></i>: 
- Who would like develop applications for Edge compute taking advantages of all the capabilities exposed through Edge Compute APIs in OpenNESS. 
- Who would like to port the existing applications and services in the public/private cloud to edge unmodified. 

The document will describe how to go about developing applications from scratch using the template/example applications/services provided in the OpenNESS software release. All the OpenNESS Applications and services can be found in the [edgeapps repo](https://github.com/open-ness/edgeapps). 

## OpenNESS Edge Node Applications
OpenNESS Applications can onboarded and provisioned on the edge node only through OpenNESS Controller. The first step in Onboarding involves uploading the application image to the controller through the web interface. Both VM and Container images are supported. 

OpenNESS application can be categorised in different ways depending on the scenarios. 

- Depending on the OpenNESS APIs support 
  - Applications calling EAA APIs for providing or consuming service on the edge compute along with servicing end-users traffic 
  - Applications not availing any services on the edge compute just servicing end-user traffic 

- Depending on the Application Execution platform 
  - Application running natively on Edge node in a VM/Container provisioned by the OpenNESS controller 
  - Application running on Local breakout not provisioned by the OpenNESS controller 

- Depending on the servicing the end-user traffic
  - Producer Application
  - Consumer Application 

### <b>Producer Application</b>
OpenNESS Producer application are edge compute application that provide services to other applications running on the edge compute platform. Producer applications do not serve end users traffic directly. They are sometime also referred to as Edge services. Here are some of the characteristics of a producer app.
- It is mandatory for all producer apps to authenticate and acquire TLS 
- All producer apps need to activate if the service provided by them needs to be discoverable by other edge applications 
- A producer application can have one or more fields for which it will provide notification update 

### <b>Consumer Application</b>
OpenNESS Consumer application are edge compute application that serve end users traffic directly. Consumer applications might or might not subscribe to the services from other producer applications on the edge node. Here are some of the characteristics of a consumer app.
- It is not mandatory for consumer apps to authenticate if they don't wish to call EAA APIs.  
- A consumer application can subscribe to any number of services from producer apps. Future extension can implement entitlements to consumer apps to create access control lists. 
- Producer to Consumer update will use web socket for notification. If there is further data to be shared between producer and consumer other NFVi components like OVS/VPP/NIC-VF can be used for data transfer. 

### Example of Producer and Consumer Applications
The OpenNESS release includes reference producer and consumer applications.

![OpenNESS Reference Application](app-guide/openness_apps.png)

_Figure - Example of Producer and Consumer Applications_

The consumer application is based on OpenVINO [OpenVINO] (https://software.intel.com/en-us/openvino-toolkit)

- OpenVINO consumer app executes inference on input video stream
- OpenVINO producer app generates notifications to the consumer app for changing the inference model
- Video input stream is captured from a webcam installed on an Embedded Linux client device
- The annotated video is streamed out of the OpenNESS edge node back to the client device for further data analysis

#### OpenVINO Producer Application

OpenVINO producer application is responsible for activating a service in OpenNESS Edge Node. This service is simply a publication of the inference model name which can be used by the OpenVINO consumer application(s). This service involves sending periodic `openvino-model` notification (its interval is defined by `NotificationInterval`), which in turn is absorbed by the consumer application(s).

The producer application commences publishing notifications after it handshakes with the Edge Application Agent (EAA) over HTTPS REST API. This handshaking involves authentication and service activation.

This sample OpenVINO producer application represents a real world application where city traffic behavior can is monitored by detecting humans and automobiles at different times of the day.

#### OpenVINO Consumer Application

OpenVINO consumer application executes object detection on the received video stream (from the client simulator) using an OpenVINO pre-trained model. The model of use is designated by the model name received in the `openvino-model` notification. The corresponding model file is provided to the integrated OpenVINO C++ application.

When the consumer application commences execution, it handshakes with EAA in a proces that involves 
- Authentication
- Websocket connection establishment 
- Service discovery
- Service subscription     
 
Websocket connection retains a channel for EAA to forward notifications to the consumer application whenever a notification is received from the producer application over HTTPS REST API. Only subscribed-to notifications are forwarded on to the websocket.

This sample OpenVINO consumer application represents a real world application depending on the input object model can detect objects in the input video stream and annotate (count if needed). 

#### Execution Flow Between EAA, Producer and Consumer

The simplified execution flow of the consumer & producer applications with EAA is depicted in the sequence diagram below. Details on the various procedures of service activation/subcription and notifications are given in subsequent sections.

![Figure caption \label{OpenVINO Execution Flow}](app-guide/openness_openvinoexecflow.png)

_Figure - OpenVINO Application Execution Flow_

### <b> Cloud Adapter Edge compute Application </b>
All the major Cloud Service providers are implementing frameworks to deploy edge applications that link back to their cloud via connectors. For example, Amazon Greengrass enables lambda functions to be deployed on the edge and connecting to the AWS cloud using the GreenGrass service. While it was originally intended to host this type of edge software on IoT gateways, the same framework can be utilized by Service Providers and Enterprises, to implement a multi-cloud strategy for their Edge Nodes.  

OpenNESS enables this approach by running the Greengrass Core (with the Edge software) as Edge applications on the Edge Node. They can run unchanged, or modified to utilize the EAA APIs to serve as Producer or Consumer apps on the edge Node. By running multiple cloud connector instances from different cloud service providers on the same edge node, a multi-cloud experience can be easily implemented. 

OpenNESS supports this by ability to deploy public cloud IOT gateways from cloud vendors like Amazon AWS IoT Greengrass and Baidu OpenEdge on edge compute platform. The existing IOT gateways can be migrated to OpenNESS as is or enhanced to call EAA APIs using extensions like Lambda functions. 

![OpenNESS Cloud Adapters](app-guide/openness_cloudadapter.png)

_Figure - Example of Cloud Adapter Edge Application in OpenNESS Platform_

More details about running Baidu OpenEdge as OpenNESS application can be found here [Baidu OpenEdge  Edge Application](https://github.com/open-ness/specs/blob/master/doc/openness_baiducloud.md). 

More details about running Amazon AWS IoT Greengrass as OpenNESS application can be found here  [Amazon AWS IoT Greengrass Edge Application](https://github.com/open-ness/specs/blob/master/doc/openness_awsgreengrass.md). 

## Application On-boarding

OpenNESS toolkit allows application developers and content providers to onboard their own applications on-premise or on the network edge, closer to the source of action. The edge computing development model imposes the business logic to be split and distributed across 3 sides: (a) _client side_, (b) _edge side_, and (c) _cloud side_. OpenNESS enables landing applications on the _edge side_.

Applications to be onboarded on OpenNESS framework must be self-contained in a container or a virtual machine (VM). The applications have the option to be landed with or without awareness of the hosting edge environment. Below sections will explore the two options and how they can be useful.

> **NOTE:** Code snippets given in this guide are written in Go language, this is purely for the ease of demonstration. All other programming languages should suffice for the same purposes.

### OpenNESS-aware Applications
Edge applications must introduce themselves to OpenNESS framework and identify if they would like to activate new edge services or consume an existing service. Edge Application Agent (EAA) component is the handler of all the edge applications hosted by the OpenNESS edge node and acts as their point-of-contact. All interactions with EAA are through REST APIs which are defined in [Edge Application Authentication API](https://www.openness.org/api-documentation/?api=auth) and [Edge Application API](https://www.openness.org/api-documentation/?api=eaa).

OpenNESS-awareness involves (a) authentication, (b) service activation/deactivation, (c) service discovery, (d) service subscription, and (e) Websocket connection establishment. The Websocket connection retains a channel for EAA for notification forwarding to pre-subscribed consumer applications. Notifications are generated by "producer" edge applications and absorbed by "consumer" edge applications.

The sequence of operations for the producer application:
1. Authenticate with OpenNESS edge node
2. Activate new service and include the list of notifications involved
3. Send notifications to OpenNESS edge node according to business logic

The sequence of operations for the consumer application:
1. Authenticate with OpenNESS edge node
2. Discover the available services on OpenNESS edge platform
3. Subscribe to services of interest and listen for notifications

#### Authentication

All communications over EAA REST APIs are secured with HTTPS and TLS (Transport Layer Security). Therefore, the wrapper program must authenticate itself by sending a Certificate Signing Request (CSR) to EAA in order to receive a digital identity certificate that is used in signing all the forthcoming HTTPS and Websocket communications. CSR is performed through the [Edge Application Authentication API](https://www.openness.org/api-documentation/?api=auth).

Example of the authentication procedure with EAA is given below:

```golang
certTemplate := x509.CertificateRequest{
    Subject: pkix.Name{
        CommonName:   "namespace:app-id",
        Organization: []string{"OpenNESS Organization"},
    },
    SignatureAlgorithm: x509.ECDSAWithSHA256,
    EmailAddresses:     []string{"hello@openness.org"},
}

conCsrBytes, _ := x509.CreateCertificateRequest(rand.Reader,
    &certTemplate, prvKey)

csrMem := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE REQUEST",
    Bytes: conCsrBytes})

conID := AuthIdentity{
    Csr: string(csrMem),
}

conIdBytes, _ := json.Marshal(conID)

resp, _ := http.Post("http://eaa.openness:80/auth",
    bytes.NewBuffer(conIdBytes))

var conCreds AuthCredentials
json.NewDecoder(resp.Body).Decode(&conCreds)

x509Encoded, _ := x509.MarshalECPrivateKey(prvKey)

pemEncoded := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY",
    Bytes: x509Encoded})
conCert, _ := tls.X509KeyPair([]byte(conCreds.Certificate),
    pemEncoded)

conCertPool := x509.NewCertPool()
for _, cert := range conCreds.CaPool {
    ok := conCertPool.AppendCertsFromPEM([]byte(cert))
}
```

#### Service Activation

The producer application activates a new service by calling `POST `[`/services`](https://www.openness.org/api-documentation/?api=eaa#/Eaa/RegisterApplication) providing information about this service and the list of notifications to be provided as part of this service.

Example service activation procedure is shown below:

```golang
URN := URN{
	ID:        "app-id",
	Namespace: "namespace",
}

serv := Service{
    URN:         &URN,
    Description: "Service description",
    EndpointURI: "namespace/app-id",
}

notif1 := NotificationDescriptor{
    Name:        "notification1",
    Version:     "1.0.0",
    Description: "Notification1 description",
}

notif2 := NotificationDescriptor{
    Name:        "notification1",
    Version:     "1.0.0",
    Description: "Notification2 description",
}

serv.Notifications = make([]NotificationDescriptor, 2)
serv.Notifications[0] = notif1
serv.Notifications[1] = notif2

servBytes, _ := json.Marshal(serv)

req, _ := http.NewRequest("POST",
    "https://eaa.openness:443/services",
    bytes.NewReader(servBytes))

resp, _ := client.Do(req)

resp.Body.Close()
```

#### Service Discovery and Subscription

The consumer application must establish a Websocket befor subscribing to services. The example code below shows how Websocket connection can be established with OpenNESS edge node:

```golang
var socket = websocket.Dialer{
    ReadBufferSize:  512,
    WriteBufferSize: 512,
    TLSClientConfig: &tls.Config{
        RootCAs:      certPool,
        Certificates: []tls.Certificate{cert},
        ServerName:   "eaa.openness",
    },
}

var header = http.Header{}
header["Host"] = []string{myURN.Namespace + ":" + myURN.ID}

// Consumer establishes websocket with EAA
conn, resp, _ := socket.Dial(
    "wss://eaa.openness:443/notifications", header)

log.Println("WebSocket establishment successful")

resp.Body.Close()
```

Discovering the available services is performed by calling `GET `[`/services`](https://www.openness.org/api-documentation/?api=eaa#/Eaa/GetServices) that returns the list of available services in the edge node.

Example of service discovery is shown in the code snippet below:

```golang
req, _ := http.NewRequest("GET",
    "https://eaa.openness:443/services", nil)

resp, _ := client.Do(req)

var servList = ServiceList{}
json.NewDecoder(resp.Body).Decode(&servList)
resp.Body.Close()
```

When the consumer application decides on a particular service that it would like to subscribe to, it should call `POST `[`/subscriptions/{urn.namespace}`](https://www.openness.org/api-documentation/?api=eaa#/Eaa/SubscribeNotifications) to subscribe to all services available in a namespace or call `POST `[`/subscriptions/{urn.namespace}/{urn.id}`](https://www.openness.org/api-documentation/?api=eaa#/Eaa/SubscribeNotifications2) to subscribe to notifications related to the exact producer.

Example for subscribing to all services in a namespace is given below:

```golang
req, _ := http.NewRequest("POST",
    "https://eaa.openness:443/subscriptions/"+
    service.URN.Namespace, bytes.NewReader(notifBytes))

resp, _ := client.Do(req)
resp.Body.Close()
```

#### Service Notifications

The producer application sends notifications through `POST `[`/notifications`](https://www.openness.org/api-documentation/?api=eaa#/Eaa/PushNotificationToSubscribers) which is picked up by EAA. EAA looks up all the service subscribers in its local database and pushes this notification forward over the Websocket connection to them along with some extra information about the notification producer.

The Websocket connection should have been previously established by the consumer using `GET `[`/notifications`](https://www.openness.org/api-documentation/?api=eaa#/Eaa/GetNotifications) before subscribing to any edge service.

The consumer should create a thread that keeps listening on the Websocket for incoming notifications.

Example:

```golang
import "github.com/gorilla/websocket"
var conn *websocket.Conn

for keepListen {
    _, message, err := conn.ReadMessage()
    if err != nil {
        log.Println("Failed to read message from WebSocket:", err)
        return
    }

    var notif = NotificationToConsumer{}
    err = json.Unmarshal(message, &notif)
    if err != nil {
        log.Println("Failed to unmarshal notification msg:", err)
        return
    }

    switch notif.Name {
    case "notification1":
        // execute action for notification1

    case "notification2":
        // execute action for notification2

    case "terminate":
        keepListen = false
    }
}
```

### OpenNESS-agnostic Applications

In a situation where the developer has a legacy, pre-compiled or binary applications which are not easy to edit or modify and are not looking for consuming edge services, they can be onboarded without the awareness of underlying hosting framework. In such a case, the OpenNESS edge framework will also be unaware of the existence of these applications. Therefore, the life-cycle management of these applications becomes the responsibility of the user to configure, upload, deploy, un-deploy, start & stop. When an application requires ingress and/or egress traffic, the corresponding traffic policies must be configured manually in order to allow the concerning traffic to be steered in and out to the application.

### Make Legacy Applications OpenNESS-aware

Legacy, pre-compiled or binary applications can be made OpenNESS-aware by following few steps without editing their code. This can be done by wrapping these applications with a separate program that is written purposefully to (a) communicate with OpenNESS Edge Node and (b) execute the legacy application.

The wrapper program interacts with EAA for (a) authentication, (b) Websocket connection establishment, (c) service discovery, and (d) service subscription. And call the legacy application with the proper arguments based on the received notifications. Or, if the legacy application is intended to work as a producer application, then the wrapper programmer should activate the edge service with EAA and send the notifications based on the outcomes of the legacy application.

The code below gives an example of an executable application being called at the operating system level when a notification is received from EAA. The executable application is separately compiled and exists on the file system. A similar approach has been followed with the OpenVINO sample application which was originally written in C++ but is called from a wrapper Go-lang program.

```golang
cmd = exec.Command("program-executable",  // legacy executable call goes here
    "param1", "param2")  // parameter passing

stdout, _ := cmd.StdoutPipe()
stderr, _ := cmd.StderrPipe()

go func() {
    if _, err = io.Copy(os.Stdout, stdout); err != nil {
        log.Println(err)
    }
}()

go func() {
    if _, err = io.Copy(os.Stderr, stderr); err != nil {
        log.Println(err)
    }
}()

err = cmd.Start()
if err != nil {
    log.Fatal("Failed to execute program:", err)
}
```
