```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
# Industrial Edge Insights Application on OpenNESS - Solution Overview

  - [OpenNESS Introduction](#openness-introduction)
  - [Industrial Edge Insights Introduction](#industrial-edge-insights-introduction)    
  - [PCB Demo Introduction](#pcb-demo-introduction)        
    - [Etcd](#etcd)        
    - [Camera Stream](#camera-stream)        
    - [Video Injection](#video-injection)        
    - [Video Analytics](#video-analytics)        
    - [Visualizer](#visualizer)    
  - [PCB image flow through the system](#pcb-image-flow-through-the-system)    
  - [PCB detection results](#pcb-detection-results)    
  - [EIS Applications Integrated With OpenNESS](#eis-applications-integrated-with-openness)        
    - [Cloud Native Approach](#cloud-native-approach)        
    - [Challenges](#challenges)   
  - [Conclusion](#conclusion)

## OpenNESS Introduction

OpenNESS is an open-source software toolkit that enables easy orchestration of edge services across diverse network platforms and access technologies in multi-cloud environments. It is inspired by the edge computing architecture defined by the ETSI Multi-access Edge Computing standards (e.g., [ETSI_MEC 003]), as well as the 5G network architecture ([3GPP_23501]).
OpenNESS leverages major industry edge orchestration frameworks, such as Kubernetes and OpenStack, to implement a cloud-native architecture that is multi-platform, multi-access, and multi-cloud. It goes beyond these frameworks, however, by providing the ability for applications to publish their presence and capabilities on the platform, and for other applications to subscribe to those services. Services may be very diverse, from providing location and radio network information to operating a computer vision system that recognizes pedestrians and cars, and forwards metadata from those objects to downstream traffic safety applications.
OpenNESS is access network agnostic, as it provides an architecture that interoperates with LTE, 5G, WiFi, and wired networks. In edge computing, data plane flows must be routed to edge nodes with respect to the physical location (e.g., proximity to the endpoint, system load on the edge node, special hardware requirements). OpenNESS provides APIs that allow network orchestrators and edge computing controllers to configure routing policies in a uniform manner.

## Industrial Edge Insights Introduction

Intel's Edge Insights for Industrial offers a validated solution to easily integrate customers' data, devices, and processes in manufacturing applications, which helps enable near-real-time intelligence at the edge, greater operational efficiency, and security in factories.
Intel's Edge Insights for Industrial takes advantage of modern microservices architecture. This approach helps OEMs, device manufacturers, and solution providers integrate data from sensor networks, operational sources, external providers, and industrial systems more rapidly. The modular, product-validated software enables the extraction of machine data at the edge. It also allows that data to be communicated securely across protocols and operating systems managed cohesively, and analyzed quickly.
Allowing machines to communicate interchangeably across different protocols and operating systems eases the process of data ingestion, analysis, storage, and management. Doing so also helps industrial companies build powerful analytics and machine learning models easily and generate actionable predictive insights at the edge.
Edge computing software deployments occupy a middle layer between the operating system and applications built upon it. Intel's Edge Insights for Industrial is created and optimized for Intel architecture-based platforms and validated for underlying operating systems. Its capability supports multiple edge-critical Intel hardware components like CPUs, FPGAs, accelerators, and Intel Movidius Vision Processing Unit (VPU). Also, its modular architecture offers OEMs, solution providers, and ISVs the flexibility to pick and choose the features and capabilities they wish to include or expand upon for customized solutions. As a result, they can bring solutions to market fast and accelerate customer deployments.

## PCB Demo Introduction

The Printed Circuit Board(PCB) Demo is a sample application enabled for board quality check.
All boards will move on a conveyor belt where the IP camera will capture PCB imagines one by one, these images will be sent through the RTSP stream for further processing where the EIS application is running on the OpenNESS Node. The main objective of this demo is for the EIS OpenNESS Edge Node to detect a defect on the PCB image, currently, there are two types of defects being detected on this demo i.e a missing component and any short on the board.
The video file used in this demo application is `pcb_d2000.avi` which is sent from the camera stream pod as RTSP stream.
Currently, the PCB demo deployed on OpenNESS edge node.
For this EIS PCB demo, five different types of pods are deployed on our OpenNESS edge node.

- Etcd
- Camera-Stream
- Video-Injection
- Video-Analytics
- Visualizer

### Etcd

Etcd pod stores the key, value of Injection, Analysis, and Visualizer pod access information.

### Camera Stream

Camera stream pod deployed for sending PCB demo file “pcb_d2000.avi” as RTSP stream.

*NOTE: `On LTE/5G Network real-time deployment camera stream pod would be replaced by a real IP camera.`*

### Video Injection

The Video-Ingestion pod is mainly responsible for ingesting the video frames
coming from the camera-stream pod as RTSP stream into the EIS stack for further processing. 

### Video Analytics

The Video-Analytics pod is mainly responsible for receiving frames from the Injection pod and running the classifier Universal Disk Format (UDF)
and doing the required inferencing on the chosen Intel(R) Hardware
(CPU, GPU, VPU, HDDL) using openVINO. On this PCB demo, udfs filter configured as `pcb.pcb_filter` which will detect a defect on the board has any short or missing part.

### Visualizer

The Visualizer pod is mainly responsible for receiving frames from Video-Analytics pod and display on GUI.

## PCB image flow through the system 

![PCB image flow](eis-images/pcb-image-flow.png)

## PCB detection results

- **`Input PCB rtsp stream:`**
   This video file pcb_d2000.avi shows 3 PCBs rotating through the screen are sent from the camera stream pod, from these 3 boards, 2 are defective.

![PCB image input](eis-images/pcb-input.gif)

-  **`Output defect detection on PCB:`**
  On Visualizer pod we can view the output of defect detection on PCB image i.e with red square box defect detection marked as PCB board missing and short component.

![PCB image output](eis-images/pcb-output.gif)

## EIS Applications Integrated With OpenNESS

OpenNESS eis-experience-kit is developed for deploying EIS applications on OpenNESS Network Edge.

Integration of EIS with OpenNESS involved the following:

- Automated the EIS codebase build and deploy process using eis-experience-kit.
- Added new camera stream pod for sending PCB demo camera stream.
- Generated Etcd, VideoIngestion, VideoAnalytics, and Visualizer docker container spec to OpenNESS pod spec.
- All EIS related pods are deployed on the same namespace i.e "eis".
- For data secure connection all certificates are generated using OpenSSL.
- All generated certificates are kept on Kubernetes secrets.
- Added Kubernetes service for accessing pod port.
- Enabled EIS pod messaged exchange using TCP mode.
- EIS pod interface connected with kube-ovs dpdk interface.
- Enabled EIS pod deployment through helm chart.
- Integrated pod image pulls from local docker-registry.

![setup](eis-images/setup.png)

The EIS application can be deployed through the OpenNESS Network Edge architecture which requires the application micro-services to be adapted in order to match the distributed nature of the telco network. The application micro-services are deployed across the following sub-networks:

- **Cloud**: The UI and the database master run in the cloud, where the UI displays a summarization view of the defect on the board which is received from different IP cameras.

- **EdgeNode**: Image processing will occur on the edge node, receive the image from multiple cameras, filter unwanted images, analyze the image, and send for display

- **Camera**: A set of cameras connected through the wireless network.

- Steps involved in the deployment of the EIS application using OpenNESS.

  1. The OpenNESS controller enrolls the edge nodes.
  1. The edge node sends the request for interface configuration.
  1. The OpenNESS controller configures the interface policy for node upstream and downstream.
  1. The OpenNESS controller deploys the EIS application on the edge node.
  1. The OpenNESS controller configures the DNS and traffic policy for the applications on Node.
  1. Deploy EIS application on the edge node and launches the EIS PCB demo application.

The **Cloud** and **Camera** parts of the PCB demo Application are not part of the deployment and are assumed already running. 

EIS installation and deployment on the OpenNESS Network Edge environment is available at: 
https://github.com/otcshare/edgeapps/blob/master/applications/eis-experience-kit/README.md

*NOTE: `In the above diagram, the PCB video stream pod is used for sending the RTSP stream. But in LTE/5G Network real-time deployment, the camera stream will come from real IP camera as per below diagram`*

![setup](eis-images/eis-lte-5g-nw.png)

### Cloud Native Approach 

With a Cloud Native approach, the EIS application can be deployed on multiple nodes, EIS different pod can be scaled as per the multi-stream requirement. Using Kubernetes service name pod communication will happen.

![EIS Scaling with OpenNESS](eis-images/eis-namespace.png)

### Challenges

Some challenges observed during integration time :

- EIS OpenNESS pod connection with Etcd pod.
- Pod interconnects from IPC mode to TCP mode.
- Certificate migration from the hardcoded path to Kubernetes secret function
- RTSP stream access from hardcode IP to the service name.
- Performance measurement on EIS on TCP mode.

## Conclusion

EIS experience kit integrated and deployed on OpenNESS edge node on Kubernetes setup successfully. Now on OpenNESS setup running a few scripts, we can deploy EIS Domo successfully Network Edge. Also, we can scale up/down the EIS pod deployment as per multiple stream traffic requirements. 



 

