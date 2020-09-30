```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# Edge Application Agent (EAA)
- [Edge Application APIs](#edge-application-apis)
- [Edge Application Authentication APIs](#edge-application-authentication-apis)

#### Edge Application API support

There are two types of applications that can be deployed on the Edge Node: 
- **Producer Application**: The OpenNESS Producer application is an edge compute application that provides services to other applications running on the edge compute platform (location services, mapping services, transcoding services, etc.) 
- **Consumer Application**: The OpenNESS Consumer application is an edge compute application that serves end users traffic directly (CDN App, Augmented Reality App, VR Application, Infotainment Application, etc.). Pre-existing cloud applications that do not intend to call the EAA APIs but would like to serve the users (without any changes to the implementation) on the edge also fall into this category. 

API endpoint for edge applications is implemented in the EAA (Edge Application Agent) microservice and is implemented in Go lang. APIs are classified into:

| Edge Application API                     | Description                                                                                                                                                                                                                                                 | Example                                                                                                         |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| **Edge Service Activation/Deactivation** | This API endpoint enables a Producer App on the Edge Node to register and activate on the Edge Node\. After this API execution, the Producer App will be discoverable to Consumer Apps on the Edge Node\.                                                    | The Location Service Producer app will call this API first after being deployed from the controller\.               |
| **Edge Service Discovery**               | This API Endpoint enables a Consumer application to discover all the active Producer Applications on the Edge Node\.                                                                                                                                          | A CDN App can discover the Location Service Application on the Edge Node\.                              |
| **Edge Service Subscription/Unsubscription** | This API Endpoint enables a Consumer application to subscribe to Producer application service and notification updates\.                                                                                                                                      | A CDN application can subscribe to the Location Service application and Notification update from the service\.  |
| **Edge Service Notification update**     | This is a Web socket connection that needs to be created by a Consumer Application which intends to subscribe to services from Producer Applications\. This WebSocket is used for a push\-notification when there is an update from the Producer Application\.  | Location update is sent as a Push Notification update to the CDN Application\.                                        |
| **Edge Service data update**             | This API endpoint enables a Producer Application to publish the data to the Edge Node when it has an update to its service\.                                                                                                                                   |  Location Service Producer App publishes the Location update of a user to the Edge Node\.                           |
| **Edge Service list subscription**       | This API endpoint allows a Consumer Application to get the list of Producer Application services it has been availed of\.                                                                                                                                             | CDN Application can call this API to check if it has subscribed to Location and Transcoding services\.          |

### Edge Application APIs
Edge Application APIs are implemented by the EAA. Edge Application APIs are important APIs for Edge application developers. EAA APIs are implemented as HTTPS REST. There are two types of use cases: 
1. **Porting an existing Public/Private Cloud application to the edge compute based on OpenNESS**: This is a scenario where a customer wants to run existing apps in the public cloud on OpenNESS edge without calling any APIs or changing code. In this case, the only requirement is for an Application image (VM/Container) should be uploaded to the controller and provisioned on the Edge Node using OpenNESS Controller. In this case, the Application cannot call any EAA APIs and consume services on the edge compute. It just services end-user traffic. 
3. **Native Edge compute Application calling EAA APIs**: This is a scenario where a customer wants to develop Edge compute applications that take advantage of Edge compute services resulting in a more tactile application that responds to the changing user, network, or resource scenarios. 

OpenNESS supports the deployment of both types of applications mentioned above. The Edge Application Agent is a service that runs on the Edge Node and operates as a discovery service and basic message bus between applications via `pubsub`. The connectivity and discoverability of applications by one another is governed by an entitlement system and is controlled by policies set with the OpenNESS Controller. The entitlement system is still in development but currently allows all applications on the executing Edge Node to discover one another as well as publish and subscribe to all notifications. The Figure below provides the sequence diagram of the supported APIs for the application.

More details about the APIs can be found here [Edge Application APIs](https://www.openness.org/api-documentation/?api=eaa) 

![Edge Application APIs](eaa-images/openness-eaa.png)

_Figure - Edge Application API Sequence Diagram_

### Edge Application Authentication APIs
OpenNESS supports the authentication of Edge compute apps that intend to call EAA APIs. Applications are authenticated by the Edge Node microservice issuing the requesting application a valid TLS certificate after validating the identity of the application. In the OpenNESS solution, the Application can only be provisioned by the OpenNESS controller. There are two categories of Applications as discussed above and here is the implication for the authentication. 
1. **Existing public cloud application ported to OpenNESS**: In this scenario, a customer may want to run existing apps in the public cloud on OpenNESS edge without calling any APIs or changing code. In this case, the Application cannot call any EAA APIs and consume services on the edge compute. It just services end-user traffic. Thus, the Application will not call an authentication API to acquire a TLS certificate. 
2. **Native Edge compute Application calling EAA APIs**: In this scenario, a customer may want to develop Edge compute applications that take advantage of the Edge compute services resulting in a more tactile application that responds to the changing user, network, or resource scenarios. Such applications should first call authentication APIs and acquire a TLS certificate. Authentication of Applications that provide services to other Applications on the edge compute (Producer Apps) is  mandatory.

For applications executing on the Local breakout, the Authentication is not applicable since it is not provisioned by the OpenNESS controller. 

Authentication APIs are implemented as HTTP REST APIs. 

More details about the APIs can be found at [Application Authentication APIs](https://www.openness.org/api-documentation/?api=auth).
