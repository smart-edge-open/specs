Procedure:

1.	Read controller IP from the interfaces
2.	Edit the env file with the new IP
3.	Makefile changes in edgecontroller, add ip-change-up
4.	Make ip-change-up Docker-compose timeout 120
5.	Check for crontab entry for reboot condition, if not, add it 
6.	Redirect logs to /dev/null
7.	Create an ansible script to edit controller endpoint in the node in config files in /var/lib/appliance/configs (ela.json, eva.json, appliance.json) and the controller host entry in the edgenode_appliance_1 container
8.	Create another makefile entry in the node, to rebuild the edgenode_appliance_1
9.	Run the script in background
10.	Sit back and have lunch

Functionality:

1.	Once the system detects an IP change, the IP change script changes the environment variables to the changed IP
2.	The REACT_API and the ui containers are rebuilt with the new IP
3.	The script reads the edgenode IPs from the inventory.ini and executes the IP change procedure in the edgenode
4.	The config files in edgenode appliance are updated with the new IP
5.	Hosts are updated in the edgenode appliance container 
6.	The edgenode appliance container is rebuilt and proxy authentication happens for the new appliance container

Test Cases:

1.	Rebooting controller, IP and containers reinstated  PASSED
2.	Manual IP change through systemctl restart network  PASSED
3.	Certificates for the new IP created and image pulling via https PASSED
4.	Login In to the controller  PASSED
5.	Adding Apps  PASSED
6.	Editing Node Interfaces  PASSED
7.	Deploying Apps  PASSED
8.	Config files editing on edge node  PASSED 
