# Edge Cloud Deployment with 3GPP 4G LTE CUPS of EPC
## A white paper for reference architecture suggested using OpenNESS solution  

* [Abstract](#abstract)
* [Introduction](#introduction)
* [4G LTE CUPS architectural aspects](#4g-lte-cups-architectural-aspects)
* [Implementation guidelines for Edge solutions](#implementation-guidelines-for-edge-solutions)
* [OpenNESS solution space](#Openness-solution-space)
  * [OpenNESS suggested API flows for CUPS integration](#openness-suggested-api-flows-for-cups-integration)
  * [JSON schema for userplane API endpoint](#json-schema-for-userplane-api-endpoint)
  * [Further recommendations for more controlled subscriber data steering](#further-recommendations-for-more-controlled-subscriber-data-steering)
  * [Validation-and-Data-path-models](#validation-and-data-path-models)
* [Summary](#summary)
 * [References](#references)
 * [List of Abbreviations](#list-of-abbreviations)

#Abstract
This white paper suggests multiple deployment models for Edge cloud when co-located with LTE userplane, also suggest HTTP REST based APIs for Edge Software Solution developers for configuring the EPC userplane when co-located with Edge compute platform. This white paper also discuss how these APIs are implemented in OpenNESS reference solution and tested with EPC solution with one of Intel partnered EPC vendor. Further technical directions are discussed for developers in userplane selection and application data traffic identification and steering methods.

#Introduction
Edge cloud deployment in 4G was not directly addressed by 3GPP. For 4G ETSI MEC (Multi-Access Edge Cloud) was the reference architecture. ETSI MEC proposed support for deployment of Edge Cloud both on S1-U, SGi and EPC CUPS deployment. With 5G 3GPP is looking at supporting edge computing in a more direct way. Technical Specification (TS) 23.501 (Clause 5.13) on the architecture for 5G Systems, where a set of new functional enablers are given for the integration of MEC in 5G networks.  Release 15 OpenNESS is an opensource edge cloud reference stack which in this current release supports 4G and in future intends to support 5G Edge cloud deployment. A high-level overview of the OpenNESS edge stack is provided in the diagram below. 

![OpenNESS Architecture overview](arch-images/openness_arch.png)
