```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```
<!-- omit in toc -->
# Core Network Configuration Agent (CNCA)
- [4G/LTE Core Configuration using CNCA](#4glte-core-configuration-using-cnca)
  - [Configuring in Network Edge mode](#configuring-in-network-edge-mode)
    - [Sample YAML LTE CUPS userplane configuration](#sample-yaml-lte-cups-userplane-configuration)
- [5G NGC components bring up and Configuration using CNCA](#5g-ngc-components-bring-up-and-configuration-using-cnca)
  - [Network Edge mode](#network-edge-mode)
    - [Bring up of NGC components in Network Edge mode](#bring-up-of-ngc-components-in-network-edge-mode)
    - [Configuring in Network Edge mode](#configuring-in-network-edge-mode-1)
      - [Edge Node services operations with 5G Core (through OAM interface)](#edge-node-services-operations-with-5g-core-through-oam-interface)
        - [Registration of UPF services associated with Edge-node with 5G Core](#registration-of-upf-services-associated-with-edge-node-with-5g-core)
      - [Traffic influence operations with 5G Core (through AF interface)](#traffic-influence-operations-with-5g-core-through-af-interface)
        - [Sample YAML NGC AF subscription configuration](#sample-yaml-ngc-af-subscription-configuration)
      - [Packet Flow Description operations with 5G Core (through AF interface)](#packet-flow-description-operations-with-5g-core-through-af-interface)
        - [Sample YAML NGC AF PFD transaction configuration](#sample-yaml-ngc-af-pfd-transaction-configuration)
  - [Traffic Influence Subscription description](#traffic-influence-subscription-description)
    - [Identification (Mandatory)](#identification-mandatory)
    - [Traffic Description Group (Mandatory)](#traffic-description-group-mandatory)
    - [Target UE Identifier (Mandatory)](#target-ue-identifier-mandatory)
    - [Application Relocation (Optional)](#application-relocation-optional)
    - [Traffic Routing (Optional)](#traffic-routing-optional)
    - [Spatial Validity (Optional)](#spatial-validity-optional)
    - [Temporal Validity (Optional)](#temporal-validity-optional)
    - [UPF Event Notifications (Optional)](#upf-event-notifications-optional)
    - [AF to NEF specific (Optional)](#af-to-nef-specific-optional)
  - [Packet Flow Description transaction description](#packet-flow-description-transaction-description)

# 4G/LTE Core Configuration using CNCA

## Configuring in Network Edge mode

For Network Edge mode, CNCA provides a kubectl plugin to configure the 4G/LTE Core network. Kubernetes\* adopts plugins concepts to extend its functionality. The `kube-cnca` plugin executes CNCA related functions within the Kubernetes eco-system. The plugin performs remote callouts against LTE Control and User Plane Separation (LTE CUPS) Operation Administration and Maintenance (OAM) agent.

Available management with `kube-cnca` against LTE CUPS OAM agent are:
1. Creation of LTE CUPS userplanes
2. Deletion of LTE CUPS userplanes
3. Updating (patching) LTE CUPS userplanes

The `kube-cnca` plugin is installed automatically on the control plane node during the installation phase of the [OpenNESS Experience Kit](https://github.com/open-ness/specs/blob/master/doc/getting-started/openness-experience-kits.md).
In the following sections, a detailed explanation with examples is provided about the CNCA management.

Creation of the LTE CUPS userplane is performed based on the configuration provided by the given YAML file. The YAML configuration should follow the provided sample YAML in [Sample YAML LTE CUPS userplane configuration](#sample-yaml-lte-cups-userplane-configuration) section. Use the `apply` command to post a userplane creation request onto Application Function (AF):
```shell
kubectl cnca apply -f <config.yml>
```

When the userplane is created successfully, the `apply` command returns the userplane identifier `<userplane-id>`, which should be used in further correspondence with LTE CUPS OAM agent concerning this particular userplane. It is the responsibility of the user to retain the `<userplane-id>` as `kube-cnca` is a stateless function.

>**NOTE**: All active userplanes can be retrieved from AF through the command `kubectl cnca get userplanes`.

To retrieve an existing userplane with a known userplane ID, use the following command:
```shell
kubectl cnca get userplane <userplane-id>
```

To retrieve all active userplanes at LTE CUPS OAM agent, use the following command:
```shell
kubectl cnca get userplanes
```

To modify an active userplane, use the `patch` command and provide a YAML file with the subset of the configuration to be modified:
```shell
kubectl cnca patch <userplane-id> -f <config.yml>
```

To delete an active userplane, use the `delete` command:
```shell
kubectl cnca delete userplane <userplane-id>
```

### Sample YAML LTE CUPS userplane configuration

Similarly, the `kube-cnca` expects the YAML configuration for the LTE CUPS-specific information as shown in the following format. The file must contain the topmost configurations: `apiVersion`, `kind`, and `policy`.

```yaml
apiVersion: v1
kind: lte
policy:
  id: '5'
  uuid: beauty
  function: SAEGWU
  config:
    s5u_pgw:
      up_ip_address: 192.168.120.122
    s1u:
      up_ip_address: 192.190.120.122
    s5u_sgw:
      up_ip_address: 192.168.120.122
  selectors:
  - id: select001
    network:
      mcc: '466'
      mnc: '92'
    uli:
      tai:
        tac: 51
    pdn:
      apns:
      - APN001
```

# 5G NGC components bring up and Configuration using CNCA

OpenNESS provides ansible scripts for setting up NGC components for two scenarios. Each of the scenarios is supported by a separate role in the OpenNESS Experience Kit:

1. Role "ngc_test"
  This role brings up the 5g OpenNESS setup in the loopback mode for testing and demonstrating its usability. This scenario is currently the default 5G OpenNESS scenario. The ansible scripts that are part of "ngc_test" role build, configure and start AF, NEF and OAM in the Network Edge. Within this role, AF, NEF and OAM are set up on the controller node.  Description of the configuration and setup of the NGC components provided in the next sections of this document refers to ngc_test role. The NGC componetns set up within ngc_test role can be fully integrated and tested with provided Kubectl plugin or CNCA UI.

2. Role "ngc"
  This role brings up 5g OpenNESS components - AF and NEF - to present the real deployment scenario, where the components can be further integrated with the real 5G core network. The ansible scripts that are part of this role build, configure and start AF and NEF components on separate nodes in Network Edg. The ansible scripts place AF again on the controller node, whereas NEF is placed on a worker node. Similar functionality will be added for OAM component in the future release. Currently, integration with CNCA UI and Kubectl is not complete due to missing OAM component - the services can not be created and accessed. In CNCA UI the "services" web page does not show any content. The user should proceed to "subscriptions" web page to view and modify subscriptions.

## Network Edge mode

### Bring-up of NGC components in Network Edge mode

1. If the Edge controller is not yet deployed through openness-experience-kit then:
   Enable the role for ngc by changing `ne_ngc_test_enable` variable to `true` in `group_vars/all/10-default.yml` before running `deploy_ne.sh controller` or `deploy_ne.sh` as described in [OpenNESS Network Edge: Controller and Edge node setup](../getting-started/network-edge/controller-edge-node-setup.md) document,  **otherwise skip this step.**

2. If Edge-controller is already deployed (but without enabling ngc role) and at a later stage you want to enable NGC components on edge-controller then,
  Enable the role for ngc by changing `ne_ngc_test_enable` variable to `true` in `group_vars/all/10-default.yml` and then re-run `deploy_ne.sh controller` as described in [OpenNESS Network Edge: Controller and Edge node setup](../getting-started/network-edge/controller-edge-node-setup.md) document.

    **NOTE:**
    In addition to the OpenNESS controller bringup, by enabling the ngc rule the playbook scripts performs:  Clone epcforedge repo from github, builds AF, NEF and OAM micro services, generates certificate files, creates docker images and starts PODs.

3. On successful start of AF, NEF and OAM PODs, status of PODS and Services can verified using the below commands:
   - `kubectl get pods --all-namespaces`
  expected out as below:
  ![NGC list of PODS](using-openness-cnca-images/ngc_pods_list_output.png)

   - `kubectl get services--all-namespaces`
    expected out as below:
    ![NGC list of PODS](using-openness-cnca-images/ngc_services_list_output.png)

    *NOTE: In general, below steps #4 and #5 are not needed. If user wants to change the hostname/ip-address parameters for AF/NEF/OAM then #4 and #5 will provide the guidance.*

4. After all the PODs are successfully up and running, few AF and OAM configuration parameters need to be updated (as per your deployment configuration) and then re-start the AF.

   * Open the file `/etc/openness/configs/ngc/af.json` and modify the below parameters.
   * `"UIEndpoint": "http://localhost:3020"` : Replace the `localhost` with `IP Address` of edge-controller, and no change to port number.
   * `"NEFHostname": "localhost"` : Replace the `localhost` with `nefservice` ie., service name NEF POD.
   * Save and exit.
   * Now restart AF POD using the below command:
  `kubectl exec -it af --namespace=ngc -- /bin/bash -c "pkill af"`
  Successful restart of AF with the updated config can be observed through AF container logs. Run the below command to get AF container logs:
  `kubectl logs af --namespace=ngc af-container`
  Sample output of the AF container logs with updated config may appear as:
![NGC list of PODS](using-openness-cnca-images/ngc_af_service_config_log.png)

5. To update OAM configuration and restart OAM micro service:
   * Open the file `/etc/openness/configs/ngc/oam.json` and modify the below parameters.
   * `"UIEndpoint": "http://localhost:3020"` : Replace the `localhost` with `IP Address` of edge-controller, and no change to port number.
   * Save and exit.
   * Now restart OAM POD using the below command:
  `kubectl exec -it oam --namespace=ngc -- /bin/bash -c "pkill oam"`
  Successful restart of OAM with the updated config can be observed through OAM container logs. Run the below command to get logs:
  `kubectl logs oam --namespace=ngc oam-container`

>**NOTE**: In case of ngc-test rule/configuration, NEF and OAM PODs will run in OpenNESS-Controller/Kubernetes-Control-Plane node for testing purpose. In a real implementation, if NEF and OAM are being used, these two services will run on the 5G Core network servers either in a POD or a standalone application on the host depending on 5G Core server environment*

### Configuring in Network Edge mode

For Network Edge mode, the CNCA provides a kubectl plugin to configure the 5G Core network. Kubernetes adopted plugin concepts to extend its functionality. The `kube-cnca` plugin executes CNCA related functions within the Kubernetes ecosystem. The plugin performs remote callouts against NGC OAM and AF microservice on the controller itself.

The `kube-cnca` plugin is installed automatically on the control plane node during the installation phase of the [OpenNESS Experience Kit](https://github.com/open-ness/specs/blob/master/doc/getting-started/network-edge/controller-edge-node-setup.md)

#### Edge Node services operations with 5G Core (through OAM interface)

>**NOTE**: Registration of the OpenNESS Controller's AF instance with the 5G core must be performed manually (or through any other interface) exposed by the 5G Core.  OAM capabilities will be enhanced in future releases to support this. The current version of OAM supports only one instance of the OpenNESS Controller to communicate.

##### Registration of UPF services associated with Edge-node with 5G Core

Supported operations through `kube-cnca` plugin:

  * Registration of edge service info for UPF with a 5G Core through OAM interface (co-located with Edge-Node)
  * Un-registration of edge service info

To register the AF service through the NGC OAM function, run:
```shell
kubectl cnca register --dnai=<DNAI> --dnn=<DNN> --tac=<TAC> --priDns=<pri-DNS> --secDns=<sec-DNS> --upfIp=<UPF-IP> --snssai=<SNSSAI>
```

The following parameters MUST be provided to the command:
1. Data Network Access Identifier (DNAI)
2. Data Network Name (DNN)
3. Primary DNS (priDns)
4. Secondary DNS (secDns)
5. UPF IP Address (upfIp)
6. Network Slice Identifier (SNSSAI)

Upon successful registration, subscriptions can be instantiated over the NGC AF. The `af-service-id` is returned by the `register` command to be used in further correspondence with NGC OAM and AF functions.

Un-registration of the AF service can be performed with the following command:
```shell
kubectl cnca unregister <af-service-id>
```

#### Traffic influence operations with 5G Core (through AF interface)

Supported operations through `kube-cnca` plugin:

  * Creation of traffic influence subscriptions through the AF microservice to steer application traffic towards edge-node
  * Deletion of subscriptions
  * Updating (patching) subscriptions
  * get or get-all subscriptions

Creation of the AF subscription is performed based on the configuration provided by the given YAML file. The YAML configuration should follow the provided sample YAML in the [Sample YAML NGC AF subscription configuration](#sample-yaml-ngc-af-subscription-configuration) section. Use the `apply` command to post a subscription creation request onto AF:
```shell
kubectl cnca apply -f <config.yml>
```

When the subscription is successfully created, the `apply` command will return the subscription URL that includes a subscription identifier at the end of the string. Only this subscription identifier `<subscription-id>` should be used in further correspondence with AF concerning this particular subscription. For example, https://localhost:8060/3gpp-traffic-influence/v1/1/subscriptions/11111  and subscription-id is 11111. It is the responsibility of the user to retain the `<subscription-id>` as `kube-cnca` is a stateless function.

To retrieve an existing subscription with a known subscription ID, use the following command:
```shell
kubectl cnca get subscription <subscription-id>
```

To retrieve all active subscriptions at AF, execute this command:
```shell
kubectl cnca get subscriptions
```

To modify an active subscription, use the `patch` command and provide a YAML file with the subset of the configuration to be modified:
```shell
kubectl cnca patch <subscription-id> -f <config.yml>
```

To delete an active subscription, use the `delete` command:
```shell
kubectl cnca delete subscription <subscription-id>
```

##### Sample YAML NGC AF subscription configuration

The `kube-cnca` expects the YAML configuration as in the format below. The file must contain the topmost configurations: `apiVersion`, `kind`, and `policy`. The configuration `policy` retains the NGC AF-specific subscription information.

```yaml
apiVersion: v1
kind: ngc
policy:
  afServiceId: 'afService001'
  afAppId: app001
  afTransId: ''
  appReloInd: false
  dnn: edgeLocation001
  snssai:
    sst: 0
    sd: default
  anyUeInd: false
  gpsi: ''
  ipv4Addr: 127.0.0.1
  ipv6Addr: ''
  macAddr: ''
  requestTestNotification: true
  websockNotifConfig:
    websocketUri: ''
    requestWebsocketUri: true
  trafficRoutes:
  - dnai: edgeLocation001
    routeInfo:
      ipv4Addr: ''
      ipv6Addr: ''
    routeProfId: default
```

#### Packet Flow Description operations with 5G Core (through AF interface)

Supported operations through the `kube-cnca` plugin:

  * Creation of packet flow description (PFD) transactions through the AF microservice to perform accurate detection of application traffic for UPF in 5G Core
  * Deletion of transactions and applications within a transaction
  * Updating (patching) transactions and applications within a transaction
  * Get or get all transactions.
  * Get a specific application within a transaction

Creation of the AF PFD transaction is performed based on the configuration provided by the given YAML file. The YAML configuration should follow the provided sample YAML in the [Sample YAML NGC AF transaction configuration](#sample-yaml-ngc-af-transaction-configuration) section. Use the `apply` command as below to post a PFD transaction creation request onto AF:
```shell
kubectl cnca pfd apply -f <config.yml>
```

When the PFD transaction is successfully created, the `apply` command will return the transaction URL, which includes a transaction identifier at the end of the string. Only this transaction identifier `<transaction-id>` should be used in further correspondence with AF concerning this particular transaction. For example, https://localhost:8050/af/v1/pfd/transactions/10000  and transaction-id is 10000. It is the responsibility of the user to retain the `<transaction-id>` as `kube-cnca` is a stateless function.

To retrieve an existing PFD transaction with a known transaction ID, use the following command:
```shell
kubectl cnca pfd get transaction <transaction-id>
```

To retrieve all active PFD transactions at AF, run:
```shell
kubectl cnca pfd get transactions
```

To modify an active PFD transaction, use the `patch` command and provide a YAML file with the subset of the configuration to be modified:
```shell
kubectl cnca pfd patch transaction <transaction-id> -f <config.yml>
```

To delete an active PFD transaction, use the `delete` command:
```shell
kubectl cnca pfd delete transaction <transaction-id>
```

To retrieve an existing application within a PFD  transaction with a known application ID and transaction ID, use:
```shell
kubectl cnca pfd get transaction <transaction-id> application <application-id>
```

To modify an application within an active PFD transaction, use the `patch` command and provide a YAML file with the subset of the configuration to be modified:
```shell
kubectl cnca pfd patch transaction <transaction-id> application <application-id> -f <config.yml>
```

To delete an application within an active PFD transaction, use the `delete` command:
```shell
kubectl cnca pfd delete transaction <transaction-id> application <application-id>
```


##### Sample YAML NGC AF PFD transaction configuration

The `kube-cnca pfd apply` expects the YAML configuration as in the format below. The file must contain the topmost configurations: `apiVersion`, `kind`, and `policy`. The configuration `policy` retains the NGC AF-specific transaction information.

```yaml
apiVersion: v1
kind: ngc_pfd
policy:
  pfdDatas:
    - externalAppID: afApp01
      allowedDelay: 1000
      cachingTime: 1000
      pfds:
        - pfdID: pfdId01
          flowDescriptions:
            - "permit in ip from 10.11.12.123 80 to any"
          domainNames:
            - "www.google.com"
        - pfdID: pfdId02
          urls:
            - "^http://test.example2.net(/\\S*)?$"
        - pfdID: pfdId03
          domainNames:
            - "www.example.com"
    - externalAppID: afApp02
      allowedDelay: 1000
      cachingTime: 1000
      pfds:
        - pfdID: pfdId03
          flowDescriptions:
            - "permit in ip from 10.68.28.39 80 to any"
        - pfdID: pfdId04
          urls:
            - "^http://test.example1.net(/\\S*)?$"
        - pfdID: pfdId05
          domainNames:
            - "www.example.com"
```

Sample yaml file for updating a single application:

```yaml
apiVersion: v1
kind: ngc_pfd
policy:
  externalAppID: afApp01
  allowedDelay: 1000
  cachingTime: 1000
  pfds:
    - pfdID: pfdId01
      flowDescriptions:
        - "permit in ip from 10.11.12.123 80 to any"
    - pfdID: pfdId02
      urls:
        - "^http://test.example2.net(/\\S*)?$"
    - pfdID: pfdId03
      domainNames:
        - "www.latest_example.com"
```

## Traffic Influence Subscription description

This section describes the parameters that are used in the Traffic Influence subscription POST request. Groups mentioned as mandatory must be provided; in the absence of the mandatory parameters, a 400 response is returned.

### Identification (Mandatory)

| Attribute name | Description                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| afTransId      | Identifies an NEF Northbound interface transaction, generated by the AF                                                               |
| self           | Link to this resource. This parameter shall be supplied by the NEF in HTTP POST responses, which is used by AF for further operations |

### Traffic Description Group (Mandatory)

| Attribute name | Description                                                           |
| -------------- | --------------------------------------------------------------------- |
| afServiceId    | Identifies a service on behalf of which the AF is issuing the request |
| dnn            | Identifies a DNN                                                      |
| snssai         | Identifies an S-NSSAI                                                 |

>**NOTE**: One of afServiceId or dnn shall be included

| Attribute name    | Description                        |
| ----------------- | ---------------------------------- |
| afAppId           | Identifies an application          |
| trafficFilters    | Identifies IP packet filters       |
| ethTrafficFilters | Identifies Ethernet packet filters |

>**NOTE**: One of "afAppId", "trafficFilters", or "ethTrafficFilters" shall be included

### Target UE Identifier (Mandatory)

| Attribute name  | Description                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| externalGroupId | Identifies a group of users                                                                                                                 |
| anyUeInd        | Identifies whether the AF request applies to any UE. This attribute is set to "true" if applicable for any UE. Otherwise, set to "false" |
| gpsi            | Identifies a user                                                                                                                           |
| ipv4Addr        | Identifies the IPv4 address                                                                                                                 |
| ipv6Addr        | Identifies the IPv6 address                                                                                                                 |
| macAddr         | Identifies the MAC address                                                                                                                  |

>**NOTE**: One of individual UE identifiers ("gpsi", "ipv4Addr", "ipv6Addr" or macAddr), External Group Identifier ("externalGroupId") or any UE indication "anyUeInd" shall be included

### Application Relocation (Optional)

| Attribute name | Description                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| appReloInd     | Identifies whether an application can be relocated once a location of the application has been selected. Set to "true" if it can be relocated; otherwise, set to "false". The default value is "false" if omitted |

### Traffic Routing (Optional)

| Attribute name | Description                                   |
| -------------- | --------------------------------------------- |
| trafficRoutes  | Identifies the N6 traffic routing requirement |

### Spatial Validity (Optional)

| Attribute name  | Description                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| validGeoZoneIds | Identifies a geographic zone that the AF request applies only to the traffic of UE(s) located in this specific zone |

### Temporal Validity (Optional)

| Attribute name | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| tempValidities | Indicates the time interval(s) during which the AF request is to be applied |

### UPF Event Notifications (Optional)

| Attribute name          | Description                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| subscribedEvents        | Identifies the requirement to be notified of the event(s)                                                                    |
| dnaiChgType             | Identifies a type of notification regarding UP path management event                                                         |
| notificationDestination | Contains the Callback URL to receive the notification from the NEF. It shall be present if the "subscribedEvents" is present |

### AF to NEF specific (Optional)

| Attribute name          | Description                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| suppFeat                | Indicates the list of Supported features used as described in subclause 5.4.4. This attribute shall be provided in the POST request and in the response of successful resource creation. Values 1 - Notification_websocket 2 -  Notification_test_event |
| requestTestNotification | Set to true by the AF to request the NEF to send a test notification as defined in subclause 5.2.5.3 of 3GPP TS 29.122 [4]. Set to false or omitted otherwise                                                                                           |
| websockNotifConfig      | Configuration parameters to set up notification delivery over Websocket protocol                                                                                                                                                                        |

## Packet Flow Description transaction description

This sections describes the parameters that are used in the Packet flow description POST request. Groups mentioned as mandatory must be provided; in the absence of the Mandatory parameters, a 400 response is returned.

| Attribute name   | Mandatory | Description                                                                                                                            |
| ---------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| externalAppID    | Yes       | Unique Application identifier of a PFD                                                                                                 |
| Allowed Delay    | No        | Indicates that the list of PFDs in this request should be deployed within the time interval indicated by the Allowed Delay             |
| Caching Time     | No        | It shall be included when the allowed delayed cannot be satisfied (i.e., it is smaller than the caching time configured in fetching PFD) |
| pfdId            | Yes       | Identifies a PFD of an application identifier.                                                                                         |
| flowDescriptions | NOTE      | Represents a 3-tuple with protocol, server ip, and server port for UL/DL application traffic.                                           |
| Urls             | NOTE      | Indicates a URL or a regular expression that is used to match the significant parts of the URL.                                       |
| domainName       | NOTE      | Indicates an FQDN or regular expression as a domain name matching criteria.                                                          |

>**NOTE**: One of the attributes of flowDescriptions, URls, and domainName is mandatory.
