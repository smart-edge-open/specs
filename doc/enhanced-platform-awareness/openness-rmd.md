```text
SPDX-License-Identifier: Apache-2.0
Copyright (c) 2020 Intel Corporation
```
<!-- omit in toc -->
# Cache Allocation for Containers with Resource Management Daemon (RMD)

- [Resource allocation](#resource-allocation)
- [Intel® RDT framework](#intel-rdt-framework)
  - [Cache Monitoring Technology (CMT)](#cache-monitoring-technology-cmt)
  - [Cache Allocation Technology (CAT)](#cache-allocation-technology-cat)
  - [Code and Data Prioritization (CDP)](#code-and-data-prioritization-cdp)
  - [Memory Bandwidth Monitoring (MBM)](#memory-bandwidth-monitoring-mbm)
  - [Memory Bandwidth Allocation (MBA)](#memory-bandwidth-allocation-mba)
- [OpenNESS RDT support](#openness-rdt-support)
- [Usage](#usage)
- [Example setup for running the benchmarks](#example-setup-for-running-the-benchmarks)
  - [Pod1 on coreA](#pod1-on-corea)
  - [Pod2 on coreB](#pod2-on-coreb)
  - [RMD workload](#rmd-workload)
  - [Start monitoring the cache usage with the PQOS tool](#start-monitoring-the-cache-usage-with-the-pqos-tool)
  - [Starting the stress-ng command on the prepared pods](#starting-the-stress-ng-command-on-the-prepared-pods)
- [Links](#links)


## Resource allocation 
Intel® Resource Director Technology (Intel® RDT) brings new levels of visibility and control over how shared resources such as last-level cache (LLC) and memory bandwidth are used by applications, virtual machines (VMs), and containers. It’s the next evolutionary leap in workload consolidation density, performance consistency, and dynamic service delivery, helping to drive efficiency and flexibility across the data center while reducing overall total cost of ownership (TCO). As software-defined infrastructure and advanced, resource-aware orchestration technologies increasingly transform the industry, Intel® RDT is a key feature set to optimize application performance and enhance the capabilities of orchestration and virtualization management server systems using Intel® Xeon® processors.

## Intel® RDT framework
Intel® RDT framework provides a framework with several component features for cache and memory monitoring and allocation capabilities, including CMT, CAT, CDP, MBM, and MBA. These technologies enable tracking and control of shared resources, such as the LLC and main memory (DRAM) bandwidth, in use by many applications, containers, or VMs running concurrently on the platform. RDT can help with “noisy neighbor” detection and reduce performance interference, ensuring the performance of key workloads in complex environments.

### Cache Monitoring Technology (CMT)
Providing new insight by monitoring the last-level cache (LLC) utilization by individual threads, applications, or VMs, CMT improves workload characterization, enables advanced, resource-aware scheduling decisions, helps with “noisy neighbor” detection and improves performance debugging.

### Cache Allocation Technology (CAT)
Software-guided redistribution of cache capacity is enabled by CAT, enabling important data center VMs, containers, or applications to benefit from improved cache capacity and reduced cache contention. CAT may be used to enhance runtime determinism and prioritize important applications such as virtual switches or Data Plane Development Kit (DPDK) packet processing apps from resource contention across various priority classes of workloads.

### Code and Data Prioritization (CDP)
As a specialized extension of CAT, Code and Data Prioritization (CDP) enables separate control over code and data placement in the last-level (L3) cache. Certain specialized types of workloads may benefit from increased runtime determinism, enabling greater predictability in application performance.

### Memory Bandwidth Monitoring (MBM)
Multiple VMs or applications can be tracked independently via Memory Bandwidth Monitoring (MBM), which provides memory bandwidth monitoring for each running thread simultaneously. Benefits include detection of noisy neighbors, characterization and debugging of performance for bandwidth-sensitive applications, and more effective non-uniform memory access (NUMA)-aware scheduling.

### Memory Bandwidth Allocation (MBA)
MBA enables approximate and indirect control over memory bandwidth available to workloads, enabling new levels of interference mitigation and bandwidth shaping for “noisy neighbors” present on the system.

## OpenNESS RDT support
> OpenNESS supports Cache Allocation and Cache Monitoring in the current release.
>  
This feature allows you to allocate a guaranteed number of cache ways for a container. This is useful when you need consistent performance or need to meet real-time requirements.
This feature depends on the [RMD Daemon](https://github.com/intel/rmd/) and the Kubernetes [RMD Operator](https://github.com/intel/rmd-operator) to control it.
For more information about cache allocation and available cache pools, refer to the [RMD cache pools](https://github.com/intel/rmd/#cache-poolsgroups)
This feature is for the OpenNESS Network Edge deployment mode.

## Usage
Enable the RMD feature in *group_vars/all/10-default.yml* when installing OpenNESS (Under the Network Edge section):
> rmd_operator_enable: True
> 
This will install the underlying infrastructure.
Next, use the following shell function to determine which cores are used by your container:
```bash
#!/bin/sh

get_cores() {
        name="$1"

        uid=$(kubectl get pod "$1" -o json | awk -F \" ' /uid/ { print $4 } ' | sed -e 's/-/_/g')
        container_id=$(kubectl get pod "$1" -o json | awk -F \" ' /containerID/ { print $4 }' | sed -e 's|://|-|')
        path="/sys/fs/cgroup/cpuset/kubepods.slice/kubepods-pod${uid}.slice/${container_id}.scope/cpuset.cpus"
        echo "uid: $uid, containerID: $container_id"
        CORES=$(ssh node cat "$path")
        echo "container $1 is using cores: $CORES"
}
```

For information about how to assign an RMD workload to a core (how to allocate the cache-ways to that core), refer to:
https://github.com/intel/rmd-operator#examples

## Example setup for running the benchmarks
### Pod1 on coreA
```
apiVersion: v1
kind: Pod
metadata:
  name: pod1
  labels:
    name: pod1
spec:
  containers:
  - name: pod1
    image: stress-ng-im:latest
    imagePullPolicy: "Never"
    command: ["/bin/sh"]
    args: ["-c", "echo pod1 started; sleep 9999999"]
    resources:
      limits:
        cpu: "1"
        memory: "128Mi"
      requests:
        cpu: "1"
        memory: "128Mi"
```
### Pod2 on coreB
```
apiVersion: v1
kind: Pod
metadata:
  name: pod2
  labels:
    name: pod2
spec:
  containers:
  - name: pod2
    image: stress-ng-im:latest
    imagePullPolicy: "Never"
    command: ["/bin/sh"]
    args: ["-c", "echo pod2 started; sleep 9999999"]
    resources:
      limits:
        cpu: "1"
        memory: "128Mi"
      requests:
        cpu: "1"
        memory: "128Mi"
```
### RMD workload
Use the script from the Usage section to find out the core for Pod2. Prepare the following RMD workload file:
```
apiVersion: intel.com/v1alpha1
kind: RmdWorkload
metadata:
  name: rmdworkload1
spec:
  # Add fields here
  coreIds: ["INFERRED_CORE_ID"]
  cache:
    max: 6
    min: 6
  nodes: ["YOUR_WORKER_NODE_HERE"]
```
Apply and validate it:
```bash
kubectl delete rmdworkload --all	# make sure we have a clean slate
kubectl create -f rmdworkload.yaml	# create the workload as above
kubectl get rmdworkloads		# your workload should be listed now
kubectl describe rmdnodestate
```
At the end of the output you should see the following:
```
Status:
  Workloads:
    rmdworkload:
      Cache Max:  6
      Cache Min:  6
      Core IDs:   2
      Cos Name:   2-guarantee
      ID:         1
      Origin:     REST
      Status:     Successful
Events:           <none>
```
### Start monitoring the cache usage with the PQOS tool
```bash
# Install - once off
git clone https://github.com/intel/intel-cmt-cat.git
make install
# Run it
pqos
```
If the PQOS tool fails to start, download the following tool:
```bash
git clone https://github.com/opcm/pcm.git
make install
pcm	# run it for a second, then ctrl-c
```
After you start and stop pcm, you should be able to run the pqos tool without a further problem. Look especially at the cores your pods got assigned. The LLC column (last level cache / L3 cache) should change after you run the `stress-ng` commands below.

### Starting the stress-ng command on the prepared pods
Pod1
> kubectl exec -it pod1 -- stress-ng --matrix 1 -t 1h --metrics-brief --aggressive --maximize

Pod2
> kubectl exec -it pod2 -- stress-ng --matrix 1 -t 1h --metrics-brief --aggressive --maximize


## Links
* [RMD Daemon](https://github.com/intel/rmd/)
* [RMD Operator](https://github.com/intel/rmd-operator)
