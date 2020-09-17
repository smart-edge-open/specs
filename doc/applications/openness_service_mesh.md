```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# Service Mesh support in OpenNESS
- [Overview](#overview)
- [OpenNESS Service Mesh Enablement through Istio](#openness-service-mesh-enablement-through-istio)
- [Video Analytics Service Mesh](#video-analytics-service-mesh)
- [Video Analytics Service Mesh Deployment](#video-analytics-service-mesh-deployment)
- [Authentication, Authorization & Mutual TLS enforcement](#authentication-authorization--mutual-tls-enforcement)
- [Traffic Management](#traffic-management)
  - [External Access](#external-access)
  - [Blocking Access](#blocking-access)
  - [Canary Deployment](#canary-deployment)
- [Fault Injection](#fault-injection)
  - [Delays](#delays)
  - [Aborts](#aborts)
  - [Circuit Breaker](#circuit-breaker)
- [NGC Service Mesh Enablement](#ngc-service-mesh-enablement)
- [Prometheus, Grafana & Kiali integration](#prometheus-grafana--kiali-integration)
- [Getting Started](#getting-started)
  - [Enabling Service Mesh with the Media Analytics Flavor](#enabling-service-mesh-with-the-media-analytics-flavor)
  - [Enabling 5GC Service Mesh with the Core Control Plane Flavor](#enabling-5gc-service-mesh-with-the-core-control-plane-flavor)
- [References](#references)

## Overview

Service mesh acts as a middleware between the edge applications/services and the OpenNESS platform providing abstractions for traffic management, observability and security for the edge micro-services.

In the native Kubernetes deployment, the services are orchestrated by the Kubernetes controller and the consumer applications must decide on which service endpoint they need to reach out according to the services information broadcasted on the EAA bus.

With the Service Mesh approach, the applications do not have to worry on deciding which service endpoint it should reach, but instead it requests a service name that is translated and load-balanced by the service mesh. The service mesh manages the traffic routing and the service scale-up & down behind the scenes and adds more capabilities to the mix such as tracing, monitoring & logging.


## OpenNESS Service Mesh Enablement through Istio

[Istio](https://istio.io/) is a feature-rich cloud-native service mesh platform that provides a collection of key capabilities such as: [Traffic Management](https://istio.io/latest/docs/concepts/traffic-management/), [Security](https://istio.io/latest/docs/concepts/security/) and [Observability](https://istio.io/latest/docs/concepts/observability/) uniformly across a network of services. OpenNESS integrates natively with the Istio service mesh to help reducing the complexity of large scale edge applications, services and network functions. The Istio service mesh is deployed automatically through the OpenNESS Experience Kits (OEK) with an option to onboard the media analytics services on the service mesh.

Istio mandates injecting [Envoy sidecars](https://istio.io/v1.6/docs/ops/deployment/architecture/#envoy) to the applications & services pods to become part of the service mesh. The Envoy sidecars intercepts all inter-pod traffic, therefore, it becomes easy to manage, secure and observe. Sidecar injection is automatically enabled to the `default` namespace in the OpenNESS cluster. This is done by applying the label `istio-injection=enabled` to the `default` namespace.


## Video Analytics Service Mesh

The OpenNESS Video Analytics services enables third party consumer applications running on OpenNESS to perform video analytics/inferencing workloads by consuming the Video Analytics Serving APIs as described in the [OpenNESS Video Analytics Services](./openness_va_services.md).

The proposed architecture with the video analytics use case is depicted in the graphic below:

![Video Analytics Service Mesh Architecture](./service-mesh-images/video-analytics-service-mesh.png)

_Figure - Video Analytics Service Mesh Architecture_

Multiple instances of the video analytics services could be provisioned in the cluster. These services are deployed in multiple flavors based on the supported multimedia frameworks (FFmpeg & Gstreamer) and the available acceleration (CPU, HDDL & VCAC-A).

In each deployment, three containers are actually created:

- Video analytics serving gateway (VAS gateway): This is the actual video analytics serving container that is exposing the consumable APIs for video analytics/inference.
- Video analytics serving sidecar (VAS sidecar): This is the sidecar that creates and registers the service with EAA internal service registry.
- Envoy sidecar (istio-proxy): This is the Istio sidecar proxy that is used for the service mesh plumbing. See Istio Sidecars.

The service mesh framework takes care of provisioning, monitoring and routing the traffic to various services endpoints.


## Video Analytics Service Mesh Deployment

The media analytics services can be automatically deployed on the Istio service mesh using the OpenNESS Experience Kits (OEK). To do so, the entry `ne_istio_enable` in the file `flavors/media-analytics/all.yml` needs to be set to `true`. After running the `deploy.sh` script, the output should include the following pods in the `default` and `istio-system` namespaces on the cluster:

```shell
$ kubectl get pods -A
NAMESPACE      NAME                                                         READY   STATUS      RESTARTS   AGE
default        analytics-ffmpeg-684588bb9f-4c9n4                            3/3     Running     1          5m44s
default        analytics-gstreamer-5789c96cbd-qwksw                         3/3     Running     1          5m44s
...
istio-system   istio-ingressgateway-5bfc5c665-hshbn                         1/1     Running     0          17m
istio-system   istiod-8656df74b4-kp584                                      1/1     Running     0          18m
istio-system   kiali-d45468dc4-65btj                                        1/1     Running     0          17m
istio-system   smi-adapter-istio-54b7c99755-sxfgd                           1/1     Running     0          15m
...
```

With Istio enabled in the media analytics services flavor, Istio creates two new [Destination Rules](https://istio.io/latest/docs/concepts/traffic-management/#destination-rules) in the service mesh. These Destination Rules enable Mutual TLS for each individual service, which enforces the need for any client attempting to connect to the services via the service mesh to also use the Mutual TLS mode. This prevents any client not using Mutual TLS from connecting with any of the media analytics services pods on the service mesh.

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: destination-rule-analytics-ffmpeg
  namespace: default
spec:
  host: analytics-ffmpeg
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
```


## Authentication, Authorization & Mutual TLS enforcement

Mutual TLS is enforced by default in the OpenNESS in order to enable authenticating all the applications and services onboarded on the mesh. Also, 

To prevent non-mutual TLS for the whole mesh, the below `PeerAuthentication` policy is automatically applied to the `default` namespace in the OpenNESS cluster. This policy instructs Istio to *strictly* set the mutual TLS between all mesh applications & services running in the `default` namespace.

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: default
spec:
  mtls:
    mode: STRICT
```

With the mutual TLS being enabled, Istio is capable of applying authorization policies as designed by the cluster administrator. The below authentication policy is applied automatically by the video analytics service mesh. This policy instructs Istio to authorize *all the authenticated* applications to consume the `analytics-ffmpeg` service and use its "GET", "POST" and "DELETE" methods.

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-analytics-ffmpeg
  namespace: default
spec:
  selector:
    matchLabels:
      app: analytics-ffmpeg
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["*"]
        namespaces: ["default"]
    to:
    - operation:
        methods: ["GET", "POST", "DELETE"]
```

In this `AuthorizationPolicy`, the Istio service mesh will allow "GET", "POST" and "DELETE" requests from any authenticated applications from the `default` namespace only to be passed to the service. For example, if using the [Video Analytics sample application](https://github.com/otcshare/edgeapps/tree/master/applications/vas-sample-app), the policy will allow requests from the sample application to be received by the service as it is deployed in the `default` namespace. However, if the application is deployed in a different namespace, for example the `openness` namespace mentioned above in the output from the Kubernetes cluster, then the policy will deny access to the service as the request is coming from an application on a different namespace.

> **NOTE:** The above `AuthorizationPolicy` can be tailored so that the OpenNESS service mesh *selectively* authorizes particular applications to consume premium video analytics services such as being accelerated using HDDL or VCAC-A cards.


## Traffic Management

Istio provides means to manage the traffic to particular services. This can be either done directly using Istio API, or through the Service Mesh Interface (SMI) that is standardized across various service mesh implementations. The SMI adapter must be compatible with the deployed service mesh in order to work properly.

The examples demonstrated below are based on the `BookInfo` sample that is shipped with Istio (samples/bookinfo/platform/kube/bookinfo.yaml). Deploying the `BookInfo` sample application creates a couple of interconnected services as shown in the following figure:

![Book Info Sample Application](./service-mesh-images/kiali-book-info.png)

_Figure - Book Info Sample Application_

### External Access

In order to access a deployed application in the service mesh from outside the cluster, an ingress `Gateway` is required. As defined in (samples/bookinfo/networking/bookinfo-gateway.yaml)

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: bookinfo-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: bookinfo
spec:
  hosts:
  - "*"
  gateways:
  - bookinfo-gateway
  http:
  - match:
    - uri:
        exact: /productpage
    - uri:
        prefix: /static
    - uri:
        exact: /login
    - uri:
        exact: /logout
    - uri:
        prefix: /api/v1/products
    route:
    - destination:
        host: productpage
        port:
          number: 9080
```

The port is assigned dynamically and can be checked using the command:

```shell
$ kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].nodePort}'
```

Now, the `BookInfo` web dashboard is accessible by any web browser at the address `http://<CONTROLLER_IP>:<GATEWAY_PORT>/productpage`


### Blocking Access

Istio can block or allow traffic to specific elements. This can be done using AuthorizationPolicy structure. Following example will give user access to main page, but without details or reviews part:

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: productpage-viewer
  namespace: default
spec:
  selector:
    matchLabels:
      app: productpage
      version: v1
  rules:
  - from:
    - source:
        principals: ["*"]
    to:
    - operation:
        methods: ["GET"]
---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
  namespace: default
spec:
  {}
```

To gain access to "details" and "reviews", but only v1, there are more rules needed:

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: reviews-viewer-v1
  namespace: default
spec:
  selector:
    matchLabels:
      app: reviews
      version: v1
  rules:
  - from:
    - source:
        principals: ["*"]
    to:
    - operation:
        methods: ["GET"]
---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: details-viewer-v1
  namespace: default
spec:
  selector:
    matchLabels:
      app: details
      version: v1
  rules:
  - from:
    - source:
        principals: ["*"]
    to:
    - operation:
        methods: ["GET"]
```

As mentioned this provides access only to reviews-v1. When Istio will try to access other version, this will result with an error.

### Canary Deployment

By default if there are more than one services connected, such as "reviews" Istio provides random, but rather equal availability of each service.

One can configure Istio to display certain apps more often than the other. This can be used to balance the load in a specific way, or simply for the canary release approach.

This can be done with "TrafficSplit" structure. Such example will provide access ratio 5:1 between reviews-v1, and reviews-v2:

```yaml
apiVersion: split.smi-spec.io/v1alpha2
kind: TrafficSplit
metadata:
  name: reviews-rollout
spec:
  service: reviews
  backends:
  - service: reviews-v1
    weight: 5
  - service: reviews-v2
    weight: 1
```

TrafficSplit works only if the app versions have unique service assigned.


## Fault Injection

Fault injection, in the context of Istio, is a mechanism by which failures can be purposefully injected into the service mesh in order to mimic how an application would behave in case failures or degradations are encountered. Application developers and cluster administrators can programatically inject faults at the application layer instead of killing pods, delaying packets, or corrupting packets at the TCP layer. Istio provisions various APIs to perform fault injections such as: delays, aborts & circuit breakers to the application micro-services deployed in OpenNESS cluster and verify their resiliency.

### Delays

Delays are timing failures such as a network latency or overloaded upstreams. A sample rule for traffic delaying coming from the test user `<username>` can be injected by applying the following specification:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: <service-name>
...
spec:
  hosts:
  - ratings
  http:
  - fault:
      delay:
        fixedDelay: 7s
        percentage:
          value: 100
    match:
    - headers:
        end-user:
          exact: jason
    route:
    - destination:
        host: ratings
        subset: v1
```

### Aborts

Aborts are crash failures such as HTTP error codes or TCP connection failures. Creating a fault injection rule for an HTTP abort is done by applying the following specification:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: <service-name>
...
spec:
  hosts:
  - ratings
  http:
  - fault:
      abort:
        httpStatus: 500
        percentage:
          value: 100
    match:
    - headers:
        end-user:
          exact: jason
    route:
    - destination:
        host: ratings
        subset: v1
  - route:
    - destination:
        host: ratings
        subset: v1
```

### Circuit Breaker

A simple circuit breaker can be set based on a criteria on a number of failed connections or request limits. Creating a circuit breaker rule to limit the number of connections to a service is done by applying the following specification:

```yaml
destination: reviews.default.svc.cluster.local
tags:
  version: v1
circuitBreaker:
  simpleCb:
    maxConnections: 100
```

## NGC Service Mesh Enablement

The proposed architecture for service mesh with 5G CNF is depicted in the graphic below.

![Service Mesh for NGC](./service-mesh-images/ngc-service-mesh.png)

_Figure - Service Mesh for NGC_

Istio-proxy container is attached to each CNF pod as a sidecar. All the traffic for the CNF container go through the istio-proxy container only. The traffic flow between different entities is described in the following sections.

**Traffic flow: Client → Istio Gateway**

To access 5G CNF API’s (AF & OAM), the client request to the server using the hostname (`afservice`, `oamservice`) along with the port number exposed by the ingress gateway. Based on the Host header, traffic is forwarded to either AF or OAM container. Mutual TLS between gateway and client is enabled by default. The certificates for enabling mutual TLS is managed using `kubectl secret`. Below command add the `server-cert.pem`, `server-key.pem`, `root-ca-cert.pem` to the kubectl secret which are used while creating istio ingress gateway. 

```shell
$ kubectl create secret generic ngc-credential -n istio-system \
      --from-file=tls.key=/etc/openness/certs/ngc/server-key.pem \
      --from-file=tls.crt=/etc/openness/certs/ngc/server-cert.pem \
      --from-file=ca.crt=/etc/openness/certs/ngc/root-ca-cert.pem
```

The `root-ca-cert.pem` is used to validate client certificates while the `server-cert.pem` and `server-key.pem` are used for providing server authentication and encryption. This below policy creates istio gateway with mutual tls while using the ngc-credential secret created above.

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: ngc-ingress-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: MUTUAL
      credentialName: ngc-credential
    hosts:
    - afservice
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: MUTUAL
      credentialName: ngc-credential
    hosts:
    - oamservice
```

The above gateway can be configured to either use HTTP2 without TLS, HTTP2 with simple TLS or HTTP2 with mutual TLS by changing value of port.protocol (HTTPS/HTTP/HTTP2) and tls.mode (SIMPLE, MUTUAL). Istio upgrades the traffic to HTTP2 by default if supported by the client. An istio virtual service `ngc-vs` is also created which defines the routes from istio-ingress-gateway.

**Traffic flow: Istio Ingress gateway → Istio-proxy (AF/OAM pods)**

Istio ingress gateway after performing TLS handshake forwards the client request to `afservice/oamservice` which is intercepted by the istio-proxy attached to the corresponding service. 

**Traffic flow: Between Istio-proxy and Micro services (AF/OAM/NEF/CNTF)**

Micro service handles incoming and outgoing request. A request made by the service is intercepted by istio-proxy which performs encryption (mutual TLS) and forward the request to server. An incoming request to the micro service is intercepted by the istio-proxy which decrypts the traffic and forward to the actual service container. Any decryption/encryption and client/server validation is performed by the istio-proxy only.

**Traffic Flow: Between different istio-proxy containers**

The traffic between the istio-proxy containers is fully encrypted by using mutual TLS. The below policy enforce mutual TLS for the traffic between different istio-proxy.

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: ngc-mtls
  namespace: ngc
spec:
  mtls:
    mode: STRICT
```

For every workload in `ngc` namespace which has the istio-proxy side car attached is enforced to use mutual TLS. Any entity can't access 5G APIs without authenticating via istio-proxy.


## Prometheus, Grafana & Kiali integration

When properly configured Istio can provide Prometheus and Grafana with telemetry data. Examples showing how many times BookInfo elements were accessed.

Prometheus - all elements:

Grafana - only stats only for specific services (details, reviews-v1 and reviews-v3):


## Getting Started

### Enabling Service Mesh with the Media Analytics Flavor

The Istio service mesh is not enabled by default in OpenNESS. It can be installed as part of the pre-defined *media-analytics* deployment flavor by setting the flag `ne_istio_enable` to `true`. The media analytics services are installed with the OpenNESS service mesh through the OEK playbook as described in the [Media Analytics](../flavors.md#media-analytics-flavor) section.

```shell
$ ./deploy_ne.sh -f media-analytics
```

### Enabling 5GC Service Mesh with the Core Control Plane Flavor

Service mesh for 5G is enabled in the ido-oek using the `ne_istio_enable` flag. When deploying network edge using `core-cplane` flavor, by default `ne_istio_enable` flag is enabled and Istio service mesh will be installed. Below command will deploy 5G Cloud-Native Functions (CNFs) with Istio service mesh enabled

```shell
$ ./deploy_ne.sh -f core-cplane
```

To deploy 5G CNFs without istio service mesh, the flag `ne_istio_enable` in `flavors/core-cplane/all.yml` must be set to `false`.

## References

- [Istio Service Mesh](https://istio.io/)
- [Service Mesh Interface](https://smi-spec.io/)
- [OpenNESS Video Analytics Services](./openness_va_services.md)
