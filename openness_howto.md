SPDX-License-Identifier: Apache-2.0    
Copyright © 2019 Intel Corporation and Smart-Edge.com, Inc.    

# OpenNESS How to guide 

* [Introduction](#introduction)
* [Instructions](#Instructions)
  * [First login](#first-login)
  * [Enrollment](#enrollment)
  * [NTS Configuration](#nts-configuration)
    * [Displaying Edge Node Interfaces](#displaying-Edge-Node-interfaces)
    * [Creating Traffic Policy](#creating-traffic-policy)
    * [Adding Traffic Policy to Interface](#adding-traffic-policy-to-interface)
    * [Configuring Interface](#configuring-interface)
    * [Starting NTS](#starting-nts)
  * [Creating Applications](#creating-applications)
  * [Managing Traffic Rules](#managing-traffic-rules)
  * [Managing DNS Rules](#managing-dns-rules)


## Introduction
The aim of this guide is to familiarize the user with OpenNESS controller's User Interface. This "How to" guide will provide instructions on how to create a sample configuration via UI.
 
## Instructions
TBA

### First login
In order to access the UI the user needs to provide credentials during login.

Prerequisites:
- An internet browser to access the login page.
- REACT_APP_CONTROLLER_API='http://<Controller_IP_address>:8080' added to Controller's "~/controller-ce/ui/controller/.env.production" file.
- If working behind proxy or firewall appropriate ports open.
- Controller set up (including the UI application) and running.

The following steps need to be done for successful login:
- Open internet browser.
- Type in http://10.237.223.158:3000/login in address bar.
- Enter you username and password (default username: admin) (the password to be used is the same that which was provided during Controller bring-up with the "-adminPass <pass>" parameter).
- Click on "SIGN IN" button.

![Login screen](howto-images/login.png)

### Enrollment

In order for the Controller and Edge Node to work together the Edge Node needs to enroll with the Controller. The Edge Node will continuously try to connect to the controller until its serial key is recognized by the Controller.

Prerequisites:
- Controller's IP address must be provided in Edge Node's "scripts/ansible/deploy_server/vars/defaults.yml" file. This IP needs to be added/edited in the file in following format: enrollment_endpoint: "<Controller_IP_address>:8081"
- Controller's ROOT CA  needs to be added to "/etc/pki/tls/certs/controller-root-ca.pem" on Edge Node. The Controller's ROOT CA is printed out to the terminal during Controller bring up.
- The Edge Node's deployment script has been started.
- Upon Edge Node's deployment a Serial Key has been printed out to the terminal and retrieved to be used during enrollment.
- User has logged in to UI.

In order to enroll and add new Edge Node to be managed by the Controller the following steps are to be taken:
- Navigate to 'NODES' tab.
- Click on 'ADD EDGE NODE' button.

![Add Edge Node 1](howto-images/Enroll1.png)

- Enter previously obtained Edge Node Serial Key into 'Serial*' field.
- Enter the name and location of Edge Node.
- Press 'ADD EDGE NODE'.

![Add Edge Node 2](howto-images/Enroll2.png)

- Check that your Edge Node is visible under 'List of Edge Nodes' (Also at this stage the Ansible script for bringing up Edge Node should successfully finish executing).

![Add Edge Node 3](howto-images/Enroll3.png)

### NTS Configuration
TBA

#### Displaying Edge Node's Interfaces
Prerequisites:
- Enrollment phase completed succesfully.
- User is logged in to UI.

To check the interfaces available on the Edge Node execute following steps:
- From UI go to 'NODES' tab.
- Find you Edge Node on the list.
- Click 'EDIT'.

![Check Edge Node Interfaces 1](howto-images/CheckingNodeInterfaces.png)

- Navigate to 'INTERFACES' tab.
- Available interfaces are listed.

![Check Edge Node Interfaces 2](howto-images/CheckingNodeInterfaces1.png)

#### Creating Traffic Policy
Prerequisites:
- Enrollment phase completed succesfully.
- User is logged in to UI.

The steps to create a sample traffic policy are as follows:
- From UI navigate to 'TRAFFIC POLICIES' tab.
- Click 'ADD POLICY'.

![Creating Traffic Policy 1](howto-images/CreatingTrafficPolicy.png)
- Give policy a name.
- Click 'ADD' next to 'Traffic Rules*' field.
- Fill in following fields:
  - Description: "Sample Description"
  - Priority: 99
  - Source -> IP Filter -> IP Address: 1.1.1.1
  - Source -> IP Filter -> Mask: 24
  - Source -> IP Filter -> Begin Port: 10
  - Source -> IP Filter -> End Port: 20
  - Source -> IP Filter -> Protocol: all
  - Target -> Description: "Sample Description"
  - Target -> Action: accept
- Click on "CREATE".

![Creating Traffic Policy 2](howto-images/CreatingTrafficPolicy2.png)

After creating Traffic Policy it will be visible under 'List of Traffic Policies' in 'TRAFFIC POLICIES' tab.

![Creating Traffic Policy 3](howto-images/CreatingTrafficPolicy3.png)

#### Adding Traffic Policy to Interface
Prerequisites:
- Enrollment phase completed succesfully.
- User is logged in to UI.
- Traffic Policy Created.

To add a previously created traffic policy to an interface available on Edge Node the following steps need to be completed:
- From UI navigate to "NODES" tab.
- Find Edge Node on the 'List Of Edge Nodes'.
- Click "EDIT".

![Adding Traffic Policy To Interface 1](howto-images/AddingTrafficPolicyToInterface1.png)

- Navigate to "INTERFACES" tab.
- Find desired interface which will be used to add traffic policy.
- Click 'ADD' under 'Traffic Policy' column for that interface.
- A window titled 'Assign Traffic Policy to interface' will pop-up. Select a previously created traffic policy.
- Click on 'ASSIGN'.

![Adding Traffic Policy To Interface 2](howto-images/AddingTrafficPolicyToInterface2.png)

On success the user is able to see 'EDIT' and 'REMOVE POLICY' buttons under 'Traffic Policy' column for desired interface. These buttons can be respectively used for editing and removing traffic rule policy on that interface.

![Adding Traffic Policy To Interface 3](howto-images/AddingTrafficPolicyToInterface3.png)


#### Configuring Interface


#### Starting NTS
TBA

### Creating Applications
TBA

### Managing Traffic Rules
TBA

### Managing DNS Rules
TBA