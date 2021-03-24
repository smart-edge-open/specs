```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2019-2020 Intel Corporation
```
<!-- omit in toc -->
# Dedicated CPU core for workload support in OpenNESS
- [Overview](#overview)
  - [What is Kubernetes Native CPU management?](#what-is-kubernetes-native-cpu-management)
- [Details - CPU Manager support in OpenNESS](#details---cpu-manager-support-in-openness)
  - [Setup](#setup)
  - [CPU Manager QoS classes](#cpu-manager-qos-classes)
  - [POD definitions](#pod-definitions)
  - [Examples](#examples)

## Overview
Multi-core, commercial, off-the-shelf platforms are typical in any cloud or cloud-native deployment. Running processes in parallel on multiple cores helps achieve a better density of processes per platform. On a multi-core platform, one challenge for applications and network functions that are latency and throughput dependent is deterministic compute. It is important to achieve deterministic compute that can allocate dedicated resources. Dedicated resource allocation avoids interference with other applications (noisy neighbor). When deploying on a cloud-native platform, applications are deployed as PODs. And providing required information to the container orchestrator on dedicated CPU cores is key. CPU manager allows provisioning of a POD to dedicated cores.

Openness release 21.03 deprecated Intel CMK in favour of Kubernetes native CPU Management. 

The following are typical usages of this feature.

- Consider an edge application that uses an AI library such as OpenVINO™ for inference. This library uses a special instruction set on the CPU to get a higher performance for the AI algorithm. To achieve a deterministic inference rate, the application thread executing the algorithm needs a dedicated CPU core so that there is no interference from other threads or other application pods (noisy neighbor).


### What is Kubernetes Native CPU management?

- If the workload already uses a threading library (e.g., pthread) and uses set affinity like APIs, Kbernetes CPU Management may not be needed. For such workloads, to provide cores to use for deployment, Kubernetes ConfigMaps are the recommended methodology. ConfigMaps can be used to pass the CPU core mask to the application for use. However, Kubernetes CPU Management offers transparent and out of the box support for cpu management which does not need any additional configuration. The only issue is threading aware software can interfere with Kubernetes when Kubernetes is configured to use CPU Manager.
- The workload is a medium to long-lived process with interarrival times on the order of ones to tens of seconds or greater.
- After a workload has started executing, there is no need to dynamically update its CPU assignments.
- Kubernetes CPU management does not need to perform additional tuning to IRQ affinity, CFS settings, or process scheduling classes.
- The preferred mode of deploying additional infrastructure components is to run them in containers on top of Kubernetes.

Default kubelet configuration uses [CFS quota](https://en.wikipedia.org/wiki/Completely_Fair_Scheduler) to manage PODs execution times and enforce imposed CPU limits. For such a solution it is possible that individual PODs are moved between different CPU because of changing circumistances on Kubernetes node. When cetrains PODs end its lifespan or CPU throttling comes in place then a POD can be moved to another CPU.

Another, default for Openness, solution supported by Kubernetes is CPU manager. CPU manager uses [Linux CPUSET](https://www.kernel.org/doc/Documentation/cgroup-v1/cpusets.txt) mechanism to schedule PODS to invividual CPUs. Kubernetes defines shared pool of CPUs which initially contains all the system CPUs without CPUs reverved for system and kubelet itself. CPU selection is configurable with kubelet options. Kubernetes uses shared CPU pool to schedule PODs with three QoS classes `BestEffort`, `Burstable` and `Guaranteed`.
When POD is qualified as `Guaranteed` QoS class then kubelet removes requested CPUs amount from shared pool and assigns the POD exclusively to the CPUs.

## Details - CPU Manager support in OpenNESS

### Setup

**Deployment setup**

1. Kubernetes CPU Management needs CPU Manager Policy to be set to `static` which is a default option in Openness. This can be examined in `inventory/default/group_vars/all/10-default.yml` file.
   ```yaml
   # CPU policy - possible values: none (disabled), static (default)
   policy: "static"   ```
2. Amount of CPUs reserved for Kubernetes and operating system is defined in `inventory/default/group_vars/all/10-default.yml` file.
   ```yaml
   # Reserved CPUs for K8s and OS daemons - list of reserved CPUs
   reserved_cpus: "0,1"
   ```
3. Deploy the node with `deploy.py`.
> **NOTE**: for more details about deployment and defining inventory please refer to [CEEK](../../getting-started/converged-edge-experience-kits.md#converged-edge-experience-kit-explained) getting started page.

**Edge Controller / Kubernetes control plane**

No setup needed.

**Edge Node / Kubernetes node**

No setup needed.

### CPU Manager QoS classes
Kubernetes CPU Manager defines three quality of service classes for PODs.
- Best effort
  `BestEffort` QoS class is assigned to PODs which do not define any memory and CPU limits and requests. PODs from this QoC class run in the shared pool
- Burstable
  `Bustrable` QoS class is assigned to PODS which define memory or CPU limits and requests which do not match. PODs from `Bustrable` QoS class run in the shared pool.
- Guaranteed
  `Guaranteed` QoS class is assigned to PODs which define memory and CPU limits and requests and those two values are equal. The values set to CPU limits and request have to be integral, factional CPU specified caused the POD to be run on the shared pool. 

### POD definitions
POD defined without any constraints. This will ne assigned `BestEffort` QoS class and will run on shared poll.
```yaml
spec:
  containers:
  - name: nginx
    image: nginx
```

POD defined with some constraints. This will be assigned `Bustrable` QoS class and will run on shared poll.
```yaml
spec:
  containers:
  - name: nginx
    image: nginx
    resources:
      limits:
        memory: "200Mi"
        cpu: "2"
      requests:
        memory: "100Mi"
        cpu: "1"
```

POD defined with constraints, limits are equal to requests and CPU is integral bigger than or equal to one. This will be assigned `Guaranteed` QoS classs and will run exclusively on CPUs assigned by Kubernetes.
```yaml
spec:
  containers:
  - name: nginx
    image: nginx
    resources:
      limits:
        memory: "200Mi"
        cpu: "2"
      requests:
        memory: "200Mi"
        cpu: "2"
```

POD defined with constraints even when limits are equal to request but CPU is specified as a fractional number will not get exclusive CPUs but will be run on the shared pool. Still, QoS class for such a pod is `Guaranteed`.


### Examples

Example POD using CPU Manager feature.
```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: test-pod
  name: test-pod
spec:
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: "IfNotPresent"
    resources:
      limits:
        cpu: 1
        memory: "200Mi"
      requests:
        cpu: 1
        memory: "200Mi"
  restartPolicy: Never
  ```


  Scheduled POD is assigned `Guaranteed` quality of service class, this can be examined by issuing `kubectl describe pod/test-pod`.

Part of sample ouput is:
  ```yaml
  QoS Class:       Guaranteed
  ```

Invidual processes/threads processor affinity can be checked on the node where the pod was scheduled with `taskset` command.
Process started by a container with `Guaranteed` POD QoS class has set CPU affinity according to the POD definition. It runs exclusively on CPUs removed from shared pool. All processes spawned from POD assigned to `Guaranteed`  QoS class are scheduled to run on the same exclusive CPU. Processes from `Burstable` and `BestEffort` QoS classes PODs are scheduled to run on shared pool CPUs. This can be examined with example nginx container.

```bash
[root@vm ~]# for p in `top -n 1 -b|grep nginx|gawk '{print $1}'`; do taskset -c -p $p; done
pid 5194's current affinity list: 0,1,3-7
pid 5294's current affinity list: 0,1,3-7
pid 7187's current affinity list: 0,1,3-7
pid 7232's current affinity list: 0,1,3-7
pid 17715's current affinity list: 2
pid 17757's current affinity list: 2
```


