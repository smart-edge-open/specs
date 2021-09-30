```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019 Intel Corporation
```
<!-- omit in toc -->
# Open Visual Cloud Smart City Application on Smart Edge Open - Solution Overview
- [Smart Edge Open Introduction](#smart-edge-open-introduction)
- [Open Visual Cloud Introduction](#open-visual-cloud-introduction)
- [Smart City Edge Application Introduction](#smart-city-edge-application-introduction)
- [The Smart City Building Blocks](#the-smart-city-building-blocks)
- [Smart City App Deployment with Smart Edge Open](#smart-city-app-deployment-with-smart-edge-open)
- [Open Visual Cloud and Smart Edge Open Integration using Virtual Machines](#open-visual-cloud-and-smart-edge-open-integration-using-virtual-machines)
  - [The Infrastructure Challenges](#the-infrastructure-challenges)
  - [The Smart City Application Challenges](#the-smart-city-application-challenges)
- [Open Visual Cloud and Smart Edge Open Integration as cloud-native](#open-visual-cloud-and-smart-edge-open-integration-as-cloud-native)
- [Conclusion](#conclusion)

## Smart Edge Open Introduction
Smart Edge Open is an open-source software toolkit that enables easy orchestration of edge services across diverse network platforms and access technologies in multi-cloud environments. It is inspired by the edge computing architecture defined by the [ETSI Multi-access Edge Computing (MEC) Framework and Reference Architecture](https://www.etsi.org/deliver/etsi_gs/MEC/001_099/003/02.01.01_60/gs_MEC003v020101p.pdf) and the [3GPP System architecture for the 5G System TS 23.501](https://www.3gpp.org/DynaReport/23501.htm).

Smart Edge Open leverages major industry edge orchestration frameworks, such as Kubernetes\* and OpenStack\*, to implement a cloud-native architecture that is multi-platform, multi-access, and multi-cloud. It goes beyond these frameworks, however, by providing the ability for applications to publish their presence and capabilities on the platform and for other applications to subscribe to those services. Services may be very diverse:
* Providing location and radio network information
* Operating a computer vision system that recognizes pedestrians and cars, and then forwards metadata from those objects to downstream traffic safety applications.

Smart Edge Open is access network agnostic, as it provides an architecture that interoperates with LTE, 5G, WiFi\*, and wired networks. In edge computing, dataplane flows must be routed to edge nodes with respect to a physical location (e.g., proximity to the endpoint, system load on the edge node, and special hardware requirements). Smart Edge Open provides APIs that allow network orchestrators and edge computing controllers to configure routing policies uniformly.

## Open Visual Cloud Introduction
Open Visual Cloud is an open-source project that offers a set of pre-defined reference pipelines for various target visual cloud use cases. These reference pipelines are based on optimized open-source ingredients across four core building blocks (encode, decode, inference, and render), which are used to deliver visual cloud services.

Open Visual Cloud provides access to open-source interoperable building blocks that allow developers to create and deliver an enhanced visual experience for end users. Open Visual Cloud is a set of reference pipelines built with optimized open-source ingredients that demonstrate to developers how to construct visual cloud services. By starting with these reference pipelines, developers can achieve rapid development and innovation in creating and delivering the enhanced visual experience to modern consumers. The reference pipelines are provided as Dockerfiles to simplify container image construction and deployment in cloud environments. The goal of Open Visual Cloud is to unleash innovation, simplify development, and accelerate time to market for visual cloud services by providing open-source, interoperable, high-performance building blocks, and containerized reference pipelines.

## Smart City Edge Application Introduction
The Smart City reference pipeline shows how the integration of various media building blocks, including SVT, with analytics powered by the OpenVINO<sup>TM</sup> Toolkit. Smart City use cases include traffic control/city planning as the starting point. This Smart City sample (not a finished product) can be referenced by developers to ease application development challenges. It enables real-time analytics of live video feeds from IP cameras.

The Smart City sample when deployed on Edge nodes based on Smart Edge Open creates an impactful edge computing use case that utilizes the capability of Smart Edge Open, Open Visual Cloud, and OpenVINO™.

Smart Edge Open provides the underpinning network edge infrastructure which comprises three edge nodes (hosting three Smart City regional offices). The media processing and analytics utilizing the Open Visual Cloud software stack are executed on the network edge nodes to reduce latency. The analytics data are aggregated to the cloud for additional post-processing (such as calculating statistics) and display/visualization.

![Smart City Architecure Deployed with Smart Edge Open](ovc-images/smart-city-architecture.png)

The Open Visual Cloud website is located at the [Open Visual Cloud project](https://01.org/openvisualcloud). Smart City sample source code and documentation are available on [GitHub](https://github.com/OpenVisualCloud/Smart-City-Sample) and its integration with Smart Edge Open is available at [Smart Edge Open branch](https://github.com/OpenVisualCloud/Smart-City-Sample).

## The Smart City Building Blocks
The Smart City sample consists of the following major building blocks:

![Smart City Building Blocks](ovc-images/scope.png)

- **Camera Provisioning**: Tag and calibrate cameras for installation locations, calibration parameters, and other usage pattern information. *Not fully implemented*.
- **Camera Discovery**: Discover and register IP cameras on specified IP blocks. Registered cameras automatically participate in the analytics activities. See the [Sensor README](https://github.com/OpenVisualCloud/Smart-City-Sample/blob/master/sensor/README.md) for additional details.
- **Recording**: Record and manage segmented camera footage for preview or review (at a later time) purpose.
- **Analytics**: Perform analytics on live or recorded camera streams. Latency-sensitive analytics are performed on the Edge while others are on the cloud.
- **Triggers and Alerts**: Manage triggers on analytics data. Respond with actions on triggered alerts.
- **Smart Upload and Archive**: Transcode and upload only critical data to the cloud for archival or further offline analysis. *Not fully implemented*.
- **Stats**: Calculate statistics for planning and monitoring purposes on analytical data.
- **UI**: Present the above data to users, administrators, or city planners.

Each building block is implemented as one or a set of container services that query from and/or store processing data to the database as follows:

![Smart City Data Centric Design](ovc-images/data-centric-design.png)

For example, when launched, the analytics service queries the database for an available camera and its service URI. Then the service connects to the camera and analyzes the camera feeds. The resulted analytics data is stored back to the database for any subsequent processing such as triggering alerts and actions.

## Smart City App Deployment with Smart Edge Open

The Smart City application is deployed through the Smart Edge Open Network Edge architecture, which requires the application micro-services to be adapted to match the distributed nature of the telecommunications network. The application micro-services are deployed across the following sub-networks:

- **Cloud**: The UI and the database controller run in the cloud, where the UI displays a summarization view of the active offices and the database controller coordinates the database requests.
- **Office**: Most processing logics (multiple containers) and a local database reside in a regional office. The services include camera discovery, object detection, and other maintenance tasks such as clean up and health checks. There can be multiple offices.
- **Camera**: A set of cameras, possibly connected through the wireless network, are hosted on a different camera network.

The three edge nodes (representing three regional offices) are connected to the Smart Edge Open controller. All three nodes also have connectivity to the public/private cloud. The following are the typical steps involved in the deployment of the application using Smart Edge Open.
  1. The Smart Edge Open controller enrolls the three Edge nodes.
  2. Each Edge node sends the request for interface configuration.
  3. The Smart Edge Open controller configures the interface policy for upstream and downstream for each node.
  4. The Smart Edge Open controller deploys the Smart City VM to each edge node.
  5. The Smart Edge Open controller configures the DNS and traffic policy for the applications on each node.
  6. The Smart City VM starts on the edge node and launches the Smart City office services.

When a Smart City office is launched, the office performs the following launch steps:
- Register the office to the cloud database. Any subsequent web request to display any office-specific data (such as system workload or thumbnail of any recordings) will be then redirected back to the office.
- Discover available cameras on the camera network with the ONVIF protocol. The camera service URIs will be stored in the database.
- The analytics services query the database for available cameras and attach them to the cameras for streaming input. The processed analytics data will be sent back to the database.
- Other services run on the database records such as health check and recording storage cleanup.

The **Cloud** and **Camera** parts of the Smart City Application are not part of the deployment and are assumed already running. Upon a complete deployment, the Smart City UI shows a glance of the three offices and their activities as follows:

![Smart City Application UI](ovc-images/screenshot.gif)

## Open Visual Cloud and Smart Edge Open Integration using Virtual Machines

The integration of the Smart City application with the Smart Edge Open infrastructure presents unique challenges on both the application and the infrastructure. The following challenges were faced when packaging and deploying the Smart City application as Virtual Machines (VM) on Smart Edge Open: 

### The Infrastructure Challenges

Deploying containers with volumes, customizable environment variables, and runtime status check to Edge nodes remain challenging. A lack of scripting capability in the Edge Controller makes it difficult to deploy more than a few containers to the Edge nodes. In the Smart City application, there are about 8 containers per office (24 containers for 3 offices). The integration uses a VM that internally launches multiple containers as a workaround.   

Most Edge applications require local storage to store data or to communicate among different containers. In the Smart City application, camera data is stored locally while the analytics service processes them. As we run containers within the VM, the storage volume is created on the VM disk, whose size is limited. The local storage must be purged more often than that in a typical deployment.

### The Smart City Application Challenges

The Smart City application initially assumed that each IP camera was standalone on the network and was associated with a unique IP address. It was soon realized that if the camera streams must be delivered through the LTE network, there had to be some sort of camera aggregation. As a result, the sensor simulation code is rewritten to simulate multiple cameras hosted on the same machine (streaming through different ports.)

Smart Edge Open limits service requests initiated from the cloud to the Edge nodes. The Smart City application however sometimes needs to communicate to the offices (for example, to retrieve Edge workloads.) As a workaround, the application creates and maintains a secure tunnel to the cloud at the official launch time to facilitate the requests coming from the cloud.

The deployment script is also rewritten to separate the launch of the services into three networks: cloud, edge, and camera. Using VM as a launch vehicle, we also have to develop automation scripts to bring up the containers within VM and to establish secure connections to the cloud for registration and service redirection.

## Open Visual Cloud and Smart Edge Open Integration as cloud-native

Integrating the [cloud-native Smart City application](https://github.com/OpenVisualCloud/Smart-City-Sample/blob/master/deployment/kubernetes/README.md) with Smart Edge Open was a seamless process due to the Smart Edge Open adoption of Kubernetes standard features (Namespaces, Services, DaemonSets, and Network Policies). In one step, the Smart City application is deployed on the Smart Edge Open setup based on the reference deployment on vanilla Kubernetes. Details about onboarding the cloud-native Smart City application with Smart Edge Open is covered in the [application onboarding guide](../applications-onboard/network-edge-applications-onboarding.md#onboarding-smart-city-sample-application).

## Conclusion

The Smart City sample when deployed on the Edge nodes based on Smart Edge Open creates an impactful edge computing use case that utilizes the capability of Smart Edge Open, Open Visual Cloud, and OpenVINO™. The integration shows that the three can run together to show scalable Edge deployment and low-latency analytics processing on Edge nodes.
