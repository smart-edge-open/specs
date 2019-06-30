SPDX-License-Identifier: Apache-2.0    
Copyright © 2019 Intel Corporation and Smart-Edge.com, Inc.    

# OpenNESS How to guide 

* [Introduction](#introduction)
* [Instructions](#Instructions)
  * [Prerequisites](#prerequisites)
    * [Creating HTTPS server for image download](#creating-https-server-for-image-download)
  * [First login](#first-login)
  * [Enrollment](#enrollment)
  * [NTS Configuration](#nts-configuration)
    * [Displaying Edge Node Interfaces](#displaying-Edge-Node-interfaces)
    * [Creating Traffic Policy](#creating-traffic-policy)
    * [Adding Traffic Policy to Interface](#adding-traffic-policy-to-interface)
    * [Configuring Interface](#configuring-interface)
    * [Starting NTS](#starting-nts)
  * [Creating Applications](#creating-applications)
  * [Deploying Applications](#deploying-applications)
  * [Managing Traffic Rules](#managing-traffic-rules)
  * [Managing DNS Rules](#managing-dns-rules)


## Introduction
The aim of this guide is to familiarize the user with OpenNESS controller's User Interface. This "How to" guide will provide instructions on how to create a sample configuration via UI.
 
## Instructions
TBD - Add description

### Prerequisites
1. As part of the Application deployment a HTTPs based Application Image download server is required. 
  - An example is provided in the "Creating HTTPS server for image download" section to deploy HTTPs image server on Controller.    
   
  ![HTTPs Image Server setup](howto-images/openness_apponboard.png)

#### Creating HTTPS server for image download
##### Instructions to setup HTTP server 
- Install apache and mod_ssl     
`yum install httpd mod_ssl`    
- Go into /etc/ssl/certs    
 `cd /etc/ssl/certs`    
- Acquire the controller root ca and key
```
docker cp edgecontroller_cce_1:/artifacts/certificates/ca/cert.pem .
docker cp edgecontroller_cce_1:/artifacts/certificates/ca/key.pem .
``` 
- Generate the apache key and crt
```
openssl genrsa -out apache.key 2048
openssl req -new -sha256 -key apache.key -subj "/C=IE/ST=Clare/O=ESIE/CN=$(hostname -f)" -out apache.csr
openssl x509 -req -in apache.csr -CA cert.pem -CAkey key.pem -CAcreateserial -out apache.crt -days 500 -sha256
```
- Edit apache config and point it to the new certs
```
sed -i 's|^SSLCertificateFile.*$|SSLCertificateFile /etc/ssl/certs/apache.crt|g' /etc/httpd/conf.d/ssl.conf 
sed -i 's|^SSLCertificateKeyFile.*$|SSLCertificateKeyFile /etc/ssl/certs/apache.key|g' /etc/httpd/conf.d/ssl.conf 
```
- Set the firewall to accept the traffic
```
firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 80 -j ACCEPT
firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 443 -j ACCEPT
firewall-cmd --reload  
``` 
- Enable and restart apache after the changes
```
systemctl enable httpd
systemctl restart httpd
```

##### Instruction to upload and access images
- Put the images into /var/www/html    
`cp test_image.tar.gz /var/www/html/`    
`chmod a+r /var/www/html/*`    
- Construct the URL (Source in Controller UI) as:    
`https://controller_hostname/test_image.tar.gz`

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
- Enrollment phase completed successfully.
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
- Enrollment phase completed successfully.
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
- Enrollment phase completed successfully.
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
Prerequisites:
- Enrollment phase completed successfully.
- User is logged in to UI.

In order to configure interface available on the Edge Node for the NTS the following steps are to be taken:
- From UI navigate to 'INTERFACES' tab of the Edge Node.
- Find the interface to be used in the interface list and click 'EDIT' button under 'Action' column for that interface.

![Configuring Interface 1](howto-images/AddingInterfaceToNTS.png)

- A window will pop-up titled "Edit Interface". The following fields need to be set:
  - Driver: userspace
  - Type: upstream
  - Fall-back Interface: PCI address of another available interface ie. '0000:3d:00.1'
- Click 'SAVE'.

![Configuring Interface 2](howto-images/AddingInterfaceToNTS1.png)

- The interface's 'Driver' and 'Type' columns will reflect changes made.

![Configuring Interface 3](howto-images/AddingInterfaceToNTS2.png)

#### Starting NTS
Prerequisite:
- Enrollment phase completed successfully.
- User is logged in to UI.
- Interfaces to be used by NTS configured correctly.

Note: In this example 2 interfaces are used by NTS. One interface of 'Type: upstream' and a second interface of 'Type: downstream'.

Once the interfaces are configured accordingly the following steps need to be done:
- From UI navigate to 'INTERFACES' tab of the Edge Node.
- Click 'COMMIT CHANGES'

![Starting NTS 1](howto-images/StartingNTS.png)

- NTS will start

![Starting NTS 2](howto-images/StartingNTS2.png)

### Creating Applications
Prerequisite:
- Enrollment phase completed successfully.
- User is logged in to UI.
- User has access to a HTTPS server providing a downloadable copy of Docker container image or VM image.
- A saved copy of Docker image or VM image in a location accessible by above HTTPS server.

To add an application to list of applications managed by Controller following steps need to be taken:

- From UI navigate to 'APPLICATIONS' tab.
- Click on 'ADD APPLICATION' button.

![Creating Application 1](howto-images/CreatingApplication1.png)

- After 'Add an Application' window pops up add details as per following example:
  - Name: SampleApp
  - Type: Container
  - Version: 1
  - Vendor: vendor
  - Description: description
  - Cores: 2
  - Memory: 100
  - Source: https://<IP_address_of_https_server_storing_the_image>/image_file_name
- Then memory unit used is MB. A sample path to image could be https://192.10.10.10/sample_docker_app.tar.gz.
- Click 'UPLOAD APPLICATION'

![Creating Application 2](howto-images/CreatingApplication2.png)

- The appliaction will be displayed in Controller's 'List of Applications'.

![Creating Application 3](howto-images/CreatingApplication3.png)


### Deploying Applications
TBD

### Managing Traffic Rules
TBD

### Managing DNS Rules
TBD