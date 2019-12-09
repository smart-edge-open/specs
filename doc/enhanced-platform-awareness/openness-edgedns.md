SPDX-License-Identifier: Apache-2.0    
Copyright  2019 Intel Corporation

# OpenNESS EdgeDNS
  - [Overview](#overview)
  - [Usage](#usage)
    - [Example usage](#example-usage)

## Overview 

EdgeDNS service is an application running in K8s pod on each worker node of OpenNESS K8s cluster. It allows to add and remove DNS entry of the worker host. Services on each worker can be controlled from master node using kubectl plugin.

## Usage

* `kubectl edgedns --help` to learn about usage
* `kubectl edgedns set <node_hostname> <JSON filename>` to set DNS entry of node
* `kubectl edgedns del <node_hostname> <JSON filename>` to delete DNS entry of node

> NOTE: `node_hostname` must be valid worker node name - can be found using `kubectl get nodes`
> NOTE: `JSON filename` is a path to the file containing record_type, fqdn and addresses in case of setting operation. JSON file without record_type also is valid, and as default value "A" is set.
### Example usage

Here is an example of setting and deleting DNS entry on worker1 using set.json and del.json files:

```bash
  [root@master1 ~] cat set.json
  {
  "record_type":"A",
  "fqdn":"www.example.com",
  "addresses":["1.1.1.1", "1.1.1.2", "1.1.1.3", "1.1.1.4"]
  }
  [root@master1 ~] cat del.json
  {
  "record_type":"A",
  "fqdn":"www.example.com"
  }
  [root@master1 ~] kubectl edgednscli set worker1 set.json
  [root@master1 ~] kubectl edgednscli del worker1 del.json
```

