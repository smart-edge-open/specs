```text
SPDX-License-Identifier: Apache-2.0     
Copyright © 2019 Intel Corporation  
```
<!-- omit in toc -->
# OpenVINO™ Sample Application in OpenNESS
- [Introduction](#introduction)
- [Accelerating OpenVINO execution through Intel Movidius VPUs](#accelerating-openvino-execution-through-intel-movidius-vpus)
- [Components](#components)
	- [Client Simulator](#client-simulator)
	- [OpenVINO Producer Application](#openvino-producer-application)
	- [OpenVINO Consumer Application](#openvino-consumer-application)
- [Execution Flow Between CertSigner, EAA, Producer & Consumer](#execution-flow-between-certsigner-eaa-producer--consumer)
- [Build & Deployment of OpenVINO Applications](#build--deployment-of-openvino-applications)
	- [Docker Images Creation](#docker-images-creation)
	- [Streaming & Displaying the Augmented Video](#streaming--displaying-the-augmented-video)

## Introduction
The Open Visual Inference and Neural network Optimization (OpenVINO™) toolkit provides improved neural network performance on Intel’s processors and enables the development of cost-effective and real-time vision applications. The toolkit enables deep learning inference and easy heterogeneous execution across multiple platforms—CPUs from Intel, integrated graphics from Intel, Intel® FPGA, Intel® Movidius™ Neural Compute Stick, Intel® Neural Compute Stick 2, and Intel® Vision Accelerator Design with Intel® Movidius™ VPUs—providing implementations across cloud architectures to edge devices.

The Open Network Edge Services Software (OpenNESS) toolkit enables developers and businesses to easily land deep learning solutions that were optimized using the OpenVINO™ toolkit on-premises and on the network edge. Visual inference applications using OpenVINO™ are onboarded by OpenNESS for accelerated and low-latency execution on the edge.

This sample application demonstrates OpenVINO object detection (pedestrian and vehicle detection) deployment and execution on the OpenNESS edge platform. A live data feed received from a client device is inferred using OpenVINO pre-trained models, `pedestrian-detection-adas-0002` and `vehicle-detection-adas-0002`

This sample application is based on the OpenVINO toolkit 2019 R1.1 and uses the provided OpenVINO "Object Detection SSD C++ Demo - Async API" sample application with some amendments to work with the OpenNESS deployment. The changes are applied using the provided patch: `object_detection_demo_ssd_async.patch`

## Accelerating OpenVINO execution through Intel Movidius VPUs

The OpenVINO consumer application supports acceleration with Intel Movidius VPUs (Intel® Neural Compute Stick 2 (NCS2)) or HDDL (High Density Deep Learning) PCIe\* card.
The OpenVINO toolkit accelerates inference execution across the CPU, NCS2, and HDDL through its Inference Engine Plugins: a) CPU, b) MYRIAD, and c) HDDL.

> **NOTE**: Acceleration through Intel Movidius VPUs requires that hardware is plugged into the host platform. Refer to the [Intel® Movidius™ Myriad™ X HDDL](../enhanced-platform-awareness/openness_hddl.md) and [Intel® Neural Compute Stick 2](https://ark.intel.com/content/www/us/en/ark/products/140109/intel-neural-compute-stick-2.html) documents for more information.

## Components

The full pipeline of the OpenVINO execution is composed of three components:

 1. Client Simulator Application - `clientsim`
 2. OpenVINO Producer Application - `producer`
 3. OpenVINO Consumer Application - `consumer`

Each component is contained in a Docker\* container, namely: `client-sim:1.0`,`openvino-prod-app:1.0`, and `openvino-cons-app:1.0`.

### Client Simulator

The client simulator is responsible for continuously transmitting a video stream up to the OpenNESS edge platform. The video traffic is steered by NTS to the concerned OpenVINO consumer application.

### OpenVINO Producer Application

The OpenVINO producer application is responsible for activating a service in OpenNESS Edge Node. This service is simply a publication of the inference model name, which can be used by the OpenVINO consumer application(s). This service involves sending periodic `openvino-inference` notifications, which in turn are absorbed by the consumer application(s).

The producer application commences publishing notifications after it handshakes with the Edge Application Agent (EAA) over HTTPS REST API. This handshaking involves authentication and service activation. The HTTPS communication requires certificate which should be generated with using the Certificate Signer by sending a CSR via Certificate Requester.

The `openvino-inference` provides information about the model name used in video inferencing and the acceleration type. Contents of the notification are defined by the below struct:

```golang
type InferenceSettings struct {
	Model       string `json:"model"`
	Accelerator string `json:"accelerator"`
}
```

The `Accelerator` can be any of the following types:
1. `"CPU"`
2. `"MYRIAD"`
3. `"HDDL"`

But the producer app can dynamically alternate the acceleration types as defined by the user. This setting can be defined when building the producer Docker image by changing the following env variable `OPENVINO_ACCL` value in the producer Dockerfile. Acceptable values are:

1. `CPU` - the inference uses CPU for all models
2. `MYRIAD` - the inference uses NCS2 for all models
3. `HDDL` - the inference uses HDDL for all models
4. `CPU_HDDL` - alternate inferencing across CPU and HDDL for all models
5. `CPU_MYRIAD` - alternate inferencing across CPU and NCS2 for all models

By default, the producer Docker image builds with `CPU` only inferencing.

### OpenVINO Consumer Application

OpenVINO consumer application executes object detection on the received video stream (from the client simulator) using an OpenVINO pre-trained model. The model of use is designated by the model name received in the `openvino-inference` notification. The corresponding model file is provided to the integrated OpenVINO C++ application.

When the consumer application commences execution, it handshakes with EAA in a process that involves (a) WebSocket connection establishment, (b) service discovery, and (c) service subscription. The WebSocket connection retains a channel for EAA to forward notifications to the consumer application whenever a notification is received from the producer application over the HTTPS REST API. Only subscribed-to notifications are forwarded to the WebSocket.

The HTTPS communication requires certificate which should be generated with using the Certificate Signer by sending a CSR via Certificate Requester.


## Execution Flow Between CertSigner, EAA, Producer & Consumer

The simplified execution flow of the consumer and producer applications with EAA is depicted in the sequence diagram below.

![Figure caption \label{OpenVINO Execution Flow}](app-guide/openness_openvinoexecflow.png)

_Figure - OpenVINO Application Execution Flow_

For more information about CSR, refer to [OpenNESS CertSigner](../applications-onboard/openness-certsigner.md)

## Build & Deployment of OpenVINO Applications

### Docker Images Creation

Applications are deployed on the OpenNESS Edge Node as Docker containers. Three docker containers need to be built to get the OpenVINO pipeline working: `clientsim`, `producer`, and `consumer`. The `clientsim` Docker image must be built and executed on the client simulator machine while the `producer` and `consumer` containers/pods should be onboarded on the OpenNESS Edge Node.

On the client simulator, clone the [OpenNESS edgeapps](https://github.com/open-ness/edgeapps) and execute the following command to build the `client-sim` container:

```shell
cd <edgeapps-repo>/openvino/clientsim
./build-image.sh
```

On the OpenNESS Edge Node, clone the [OpenNESS edgeapps](https://github.com/open-ness/edgeapps) and execute the following command to build the `producer` and `consumer` containers:
```shell
cd <edgeapps-repo>/openvino/producer
./build-image.sh
```
...
```shell
cd <edgeapps-repo>/openvino/consumer
./build-image.sh
```

Now, the Docker images should have been built successfully and the containers are ready to start. Images can be listed by executing this command:

```shell
docker image list
```

The Docker images should be printed out as below:

```shell
openvino-cons-app       1.0
openvino-prod-app       1.0
```

### Streaming & Displaying the Augmented Video

The OpenVINO edge application accepts a TCP video stream. This video stream can
be from any video source such as an IP camera. The Client Simulator provided in
this project uses a sample mp4 video file to continuously transmit the video
stream to the OpenNESS Edge Node. Object detection is executed on this video
transmission and sent back to the client for further analysis.

The `client-sim` Docker container performs the operations:
1. Transmitting the video using the Linux\* tool `FFmpeg`
2. Visualizing the augmented video using the FFmpeg-based `ffplay`
   media player.

> **NOTE**: Any platform where the video is to be visualized must have Docker installed and an OS with graphical support.
