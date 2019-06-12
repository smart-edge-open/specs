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

## Abstract
This white paper suggests multiple deployment models for Edge cloud when co-located with LTE userplane, also suggest HTTP REST based APIs for Edge Software Solution developers for configuring the EPC userplane when co-located with Edge compute platform. This white paper also discuss how these APIs are implemented in OpenNESS reference solution and tested with EPC solution with one of Intel partnered EPC vendor. Further technical directions are discussed for developers in userplane selection and application data traffic identification and steering methods.

## Introduction
Edge cloud deployment in 4G was not directly addressed by 3GPP. For 4G ETSI MEC (Multi-Access Edge Cloud) was the reference architecture. ETSI MEC proposed support for deployment of Edge Cloud both on S1-U, SGi and EPC CUPS deployment. With 5G 3GPP is looking at supporting edge computing in a more direct way. Technical Specification (TS) 23.501 (Clause 5.13) on the architecture for 5G Systems, where a set of new functional enablers are given for the integration of MEC in 5G networks.  Release 15 OpenNESS is an opensource edge cloud reference stack which in this current release supports 4G and in future intends to support 5G Edge cloud deployment. A high-level overview of the OpenNESS edge stack is provided in the diagram below. 

![OpenNESS Architecture overview](epc-images/openness_arch.png)

As part of the OpenNESS reference edge stack the OpenNESS controller community edition is used for configuring the traffic policy for CUPS EPC to steer traffic towards the edge cloud, This API is based on HTTP REST. This paper provides the context of APIs and how they were used to enable the deployment of Edge cloud in 4G CUPS EPC deployment. Since 3GPP or ETSI MEC does not provide reference for these APIs various implementation of this Edge Controller to CUPS EPC might exist. OpenNESS has tried to take the approach of minimal changes to 3GPP CUPS EPC to achieve the edge cloud deployment. OpenNESS and HTTP REST APIs to the EPC CUPS is a reference implementation so customers using OpenNESS can integrate their own HTTP REST APIs to the EPC CUPS into the OpenNESS Controller. Special care has been taken to make these components Modular microservices. 

## 4G LTE CUPS architectural aspects
One of the important items studied starting in 3GPP Release-14 is Control and User Plane Separation of EPC nodes, where the Control plane is responsible for signaling and User plane responsible for user data.   By now most of the Telecom operators has realized the advantage of CUPS implementation models by centralizing the signaling processing for millions of subscribers with a distributed user plane processing node located adjacent to radio access network locations.    

Architectural enhancement for Control plane and User plane separation suggested in 3GPP Rel-14 TS 23.214. 

![3GPP CUPS Architecture overview](epc-images/openness_3gpp.png)

Exponential growth in mobile subscribers use of wireless network for various use cases raised the demand for the requirements likes reduced latency in application data service, location-based content serving and many more.   Not to discuss further details of requirements and advantages of CUPS in LTE network to keep the focus of this writing around topic, selection of proper user plane function for processing a given subscriber(s) data is one of the key aspects to achieve the CUPS advantages. 

As the selection of Serving Gateway (SGW-U) and PDN Gateway (PGW-U) happens at UE initial attach process or PDN connection establishment phase, 3GPP standard suggests multiple ways to select SGW and PGWs.  Though implementation has flexibility to choose any method that best servers the Edge requirements, this technical writing would like to suggest one of those procedures for selection of user plane and steering subscriber’s data to closest userplane nodes, where the application data processing can be co-located with gateway.    APN (or APN FQDN per 3GPP TS 23.003) can be used in selection process of PGW-U, following the selection of SGW-U can be based on TAC which is based on location of Network topology and UE current location. 