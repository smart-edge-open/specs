SPDX-License-Identifier: Apache-2.0     
Copyright © 2019 Intel Corporation  

# CNCA kubectl plugin
Kubernetes adopts plugins concepts to extend its functionality. The `kube-cnca` plugin executes CNCA related functions within Kubernetes eco-system. The plugin performs remote callouts against NGC OAM, AF and LTE CUPS OAM agent.

Available management with `kube-cnca` against NGC OAM are:
1. Registration of AF service
2. Un-registration of AF service

Available management with `kube-cnca` against NGC Application Function (AF) are:
1. Creation of subscriptions
2. Deletion of subscriptions
3. Updating (patching) subscriptions

Available management with `kube-cnca` against LTE CUPS OAM agent are:
1. Creation of LTE CUPS userplanes
2. Deletion of LTE CUPS userplanes
3. Updating (patching) LTE CUPS userplanes

The `kube-cnca` plugin is installed automatically on the master node during the installation phase of the [OpenNESS Experience Kit](https://github.com/open-ness/specs/blob/master/doc/getting-started/openness-experience-kits.md).
In the following sections, a detailed explanation with examples is provided about CNCA management.

## NGC OAM management

To register AF service through NGC OAM function, execute:
```shell
kubectl cnca register --dnai=<DNAI> --dnn=<DNN> --tac=<TAC> --priDns=<pri-DNS> --secDns=<sec-DNS> --upfIp=<UPF-IP> --snssai=<SNSSAI>
```

The following parameters MUST be provided to the command in order to succeed:
1. Data Network Access Identifier (DNAI)
2. Data Network Name (DNN)
3. Primary DNS (priDns)
4. Secondary DNS (secDns)
5. UPF IP Address (upfIp)
6. Network Slice Identifier (SNSSAI)

Upon successful registration, subscriptions can be instantiated over with NGC AF. The `af-service-id` is returned by the `register` command to be used in further correspondence with NGC OAM & AF functions.

Un-registration of the AF service can be performed as in the command below:
```shell
kubectl cnca unregister <af-service-id>
```

## NGC AF management

Creation the AF subscription is performed based on the configuration provided by the given YAML file. The YAML configuration should follow the provided sample YAML in [Sample YAML NGC AF subscription configuration](#sample-yaml-ngc-af-subscription-configuration) section. Use the `apply` command as below to post a subscription creation request onto AF:
```shell
kubectl cnca apply -f <config.yml>
```

When the subscription is created successfully, the `apply` command will return the subscription identifier `<subscription-id>`, which should be used in further correspondence with AF concerning this particular subscription. It is the responsibility of the user to retain the `<subscription-id>` as `kube-cnca` is a stateless function.

> NOTE: All active subscriptions can be retrieved from AF through command `kubectl cnca get subscriptions`.

To retrieve an existing subscription with a known subscription ID, use the below command:
```shell
kubectl cnca get subscription <subscription-id>
```

To retrieve all active subscriptions at AF, execute this command:
```shell
kubectl cnca get subscriptions
```

To modify an active subscription, use the `patch` command providing a YAML file with the subset of the configuration to be modified:
```shell
kubectl cnca patch <subscription-id> -f <config.yml>
```

To delete an active subscription, use the `delete` command as below:
```shell
kubectl cnca delete subscription <subscription-id>
```

## LTE CUPS management

Creation the LTE CUPS userplane is performed based on the configuration provided by the given YAML file. The YAML configuration should follow the provided sample YAML in [Sample YAML LTE CUPS userplane configuration](#sample-yaml-lte-cups-userplane-configuration) section. Use the `apply` command as below to post a userplane creation request onto AF:
```shell
kubectl cnca apply -f <config.yml>
```

When the userplane is created successfully, the `apply` command will return the userplane identifier `<userplane-id>`, which should be used in further correspondence with LTE CUPS OAM agent concerning this particular userplane. It is the responsibility of the user to retain the `<userplane-id>` as `kube-cnca` is a stateless function.

> NOTE: All active userplanes can be retrieved from AF through command `kubectl cnca get userplanes`.

To retrieve an existing userplane with a known userplane ID, use the below command:
```shell
kubectl cnca get userplane <userplane-id>
```

To retrieve all active userplanes at LTE CUPS OAM agent, execute this command:
```shell
kubectl cnca get userplanes
```

To modify an active userplane, use the `patch` command providing a YAML file with the subset of the configuration to be modified:
```shell
kubectl cnca patch <userplane-id> -f <config.yml>
```

To delete an active userplane, use the `delete` command as below:
```shell
kubectl cnca delete userplane <userplane-id>
```

## Sample YAML NGC AF subscription configuration

The `kube-cnca` expects the YAML configuration as in the format below. The file must contain the topmost configurations; `apiVersion`, `kind` and `policy`. The configuration `policy` retains the NGC AF-specific subscription information.

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

## Sample YAML LTE CUPS userplane configuration

Similarly, the `kube-cnca` expects the YAML configuration as in the format below for the LTE CUPS-specific information. The file must contain the topmost configurations; `apiVersion`, `kind` and `policy`.

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
