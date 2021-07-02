```text
SPDX-License-Identifier: Apache-2.0     
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# OpenNESS Radio Access Network (RAN)

Radio Access Network (RAN) is the edge of wireless network. 4G and 5G base stations form the key network function for the edge deployment. In OpenNESS, FlexRAN is used as a reference for 4G and 5G base stations as well as 4G and 5G end-to-end testing.

FlexRAN offers high-density baseband pooling that could run on a distributed Telco\* cloud to provide a smart indoor coverage solution and next-generation fronthaul architecture. This 4G and 5G platform provides the open platform ‘smarts’ for both connectivity and new applications at the edge of the network, along with the developer tools to create these new services. FlexRAN running on the Telco Cloud provides low latency compute, storage, and network offload from the edge. Thus, saving network bandwidth.

FlexRAN 5GNR Reference PHY is a baseband PHY Reference Design for a 4G and 5G base station, using Intel® Xeon® processor family with Intel® architecture. This 5GNR Reference PHY consists of a library of c-callable functions that are validated on several technologies from Intel (Intel® microarchitecture code name Broadwell, Intel® microarchitectures code name Skylake, Cascade Lake, and Intel® microarchitecture Ice Lake) and demonstrates the capabilities of the software running different 5GNR L1 features. The functionality of these library functions is defined by the relevant sections in [3GPP TS 38.211, 212, 213, 214, and 215]. Performance of the Intel 5GNR Reference PHY meets the requirements defined by the base station conformance tests in [3GPP TS 38.141]. This library of functions will be used by Intel partners and end customers as a foundation for their product development. Reference PHY is integrated with third-party L2 and L3 to complete the base station pipeline.

The diagram below shows FlexRAN DU (Real-time L1 and L2) deployed on the OpenNESS platform with the necessary microservices and Kubernetes\* enhancements required for real-time workload deployment.

This document aims to provide the steps involved in deploying FlexRAN 5G (gNb) on the OpenNESS platform.

**More details on the Radio Access Network (RAN) deployment with OpenNESS is available under [Intel® Distribution of OpenNESS](https://www.openness.org/products/intel-distribution).**
