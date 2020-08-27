```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# Service Mesh support in OpenNESS
- [Overview](#overview)
- [Video Analytics Service Mesh](#video-analytics-service-mesh)
- [OpenNESS Service Mesh Enablement through Istio](#openness-service-mesh-enablement-through-istio)
- [Authentication, Authorization & Mutual TLS enforcement](#authentication-authorization--mutual-tls-enforcement)
- [Traffic Management](#traffic-management)
- [Fault Injection](#fault-injection)
- [NGC Service Mesh Enablement](#ngc-service-mesh-enablement)
- [Prometheus, Grafana & Kiali integration](#prometheus-grafana--kiali-integration)
- [Getting Started](#getting-started)
- [References](#references)

## Overview
Service mesh acts as a middleware between the edge applications/services and the OpenNESS platform providing abstractions for traffic management, observability and security for the edge micro-services.

In the native Kubernetes deployment, the services are orchestrated by the Kubernetes controller and the consumer applications must decide on which service endpoint they need to reach out according to the services information broadcasted on the EAA bus.

With the Service Mesh approach, the applications do not have to worry on deciding which service endpoint it should reach, but instead it requests a service name that is translated and load-balanced by the service mesh. The service mesh manages the traffic routing and the service scale-up & down behind the scenes and adds more capabilities to the mix such as tracing, monitoring & logging.


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


## OpenNESS Service Mesh Enablement through Istio
[Istio](https://istio.io/) is a feature-rich cloud-native service mesh platform that provides a collection of key capabilities such as: [Traffic Management](https://istio.io/latest/docs/concepts/traffic-management/), [Security](https://istio.io/latest/docs/concepts/security/) and [Observability](https://istio.io/latest/docs/concepts/observability/) uniformly across a network of services. OpenNESS integrates natively with the Istio service mesh to help reducing the complexity of large scale edge applications, services and network functions. The Istio service mesh is deployed automatically through the OpenNESS Experience Kits (OEK) with an option to onboard the media analytics services on the service mesh.

Istio mandates injecting [Envoy sidecars](https://istio.io/v1.6/docs/ops/deployment/architecture/#envoy) to the applications & services pods to become part of the service mesh. The Envoy sidecars intercepts all inter-pod traffic, therefore, it becomes easy to manage, secure and observe. Sidecar injection is automatically enabled to the `default` namespace in the OpenNESS cluster. This is done by applying the label `istio-injection=enabled` to the `default` namespace.


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

The above `AuthorizationPolicy` can be tailored so that the OpenNESS service mesh *selectively* authorizes particular applications to consume premium video analytics services such as being accelerated using HDDL or VCAC-A cards.

## Traffic Management
<tba>

## Fault Injection
<tba>

## NGC Service Mesh Enablement
<tba>

## Prometheus, Grafana & Kiali integration
<tba>

## Getting Started
<tba>

The pre-defined *service-mesh* deployment flavor installs the OpenNESS service mesh that is applied through the OEK playbook as described in the [Service Mesh](../flavors.md#service-mesh) section.

## References

- [Istio Service Mesh](https://istio.io/)
- [Service Mesh Interface](https://smi-spec.io/)
- [OpenNESS Video Analytics Services](./openness_va_services.md)
