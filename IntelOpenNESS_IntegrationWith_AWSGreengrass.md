SPDX-License-Identifier: Apache-2.0

Copyright © 2019 Intel Corporation and Smart-Edge.com, Inc.

# Intel® OpenNESS Integration with AWS Greengrass

Application Note

June 2019

You may not use or facilitate the use of this document in connection
with any infringement or other legal analysis concerning Intel products
described herein. You agree to grant Intel a non-exclusive, royalty-free
license to any patent claim thereafter drafted which includes subject
matter disclosed herein.

No license (express or implied, by estoppel or otherwise) to any
intellectual property rights is granted by this document.

All information provided here is subject to change without notice.
Contact your Intel representative to obtain the latest Intel product
specifications and roadmaps.

The products described may contain design defects or errors known as
errata which may cause the product to deviate from published
specifications. Current characterized errata are available on request.

Copies of documents which have an order number and are referenced in
this document may be obtained by calling 1-800-548-4725 or by visiting:
[http://](http://www.intel.com/design/literature.htm)www.intel.com/design/literature.htm

Intel Xeon, Hyper-Threading, Virtualization Technology and the Intel
logo are trademarks of Intel Corporation in the U.S. and/or other
countries.

\*Other names and brands may be claimed as the property of others.

Copyright © 2019, Intel Corporation. All rights reserved.

## Overview

The Intel® OpenNESS is an Edge Computing Platform dev kit for enabling
Enterprise and CoSP developers to build network edge software for media,
industrial, smart city etc.

This application note will provide guidelines and examples on:

- Creating AWS Greengrass Docker container
- Deployment AWS Greengrass on Intel® OpenNESS platform.

## Run Greengrass on OpenNESS

This section describe how to setup and run AWS Greengrass on openNESS in a Docker container.

### Running AWS IoT Greengrass in a Docker Container

#### Download Dockerfile from AWS

AWS provides a Dockerfile and Docker image that make it easier for you to run AWS IoT Greengrass in a Docker container.
In order to get it go to AWS IoT Greengrass Developer Guide <https://docs.aws.amazon.com/greengrass/latest/developerguide>. In Downloads section of "What is AWS IoT Greengrass" <https://docs.aws.amazon.com/greengrass/latest/developerguide/what-is-gg.html#gg-docker-download> find Docker package. Download it and unzip it on your machine.

#### AWS IoT Greengrass

Go to "Configure AWS IoT Greengrass on AWS IoT" section of AWS IoT Greengrass Developer Guide (<https://docs.aws.amazon.com/greengrass/latest/developerguide/gg-config.html>) and follow it until you download and store your Core's security resources as a tar.gz.

Unzip its content into the same diectory where the Dockerfile is.

#### Modify Dockerfile and docker-compose file

You have to modify the ```Dockerfile``` and ```docker-compose.yml``` file before taking next steps.

Add the following section in the Dockerfile:

```docker
# Copy certs files
COPY "./certs/*" /greengrass/certs/
COPY "./config/*" /greengrass/config/
RUN chmod 444 /greengrass/config/config.json
```

In ```docker-compose.yml``` file comment out ```volumes``` section with ```#``` sign:

```docker
#    volumes:
#      - ./certs:/greengrass/certs
#      - ./config:/greengrass/config
#      - ./deployment:/greengrass/ggc/deployment
#      - ./log:/greengrass/ggc/var/log
```

#### Build a docker container image with credentials

Go to the folder with Dockerfile and run the following command:

```docker-compose up --build -d```

Now you have to commit changes to the image:

```docker commit aws-iot-greengrass aws-iot-greengrass```

Then save the modifeid container image into the file:

```docker save aws-iot-greengrass > aws-iot-greengrass.tar.gz```

Now you can deloy ```aws-iot-greengrass.tar.gz``` file in OpenNESS according to controller User Guide.

### Greengrass Deployment on AWS IoT

After Greengrass container is run by the OpenNESS Controller, follow the Greengrass setup and deployment steps in AWS IoT Greengrass Developer Guide.
