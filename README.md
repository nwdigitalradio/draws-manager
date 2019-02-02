# draws-manager
Early development - NOT FOR DEPLOYMENT YET

<h3>Alpha Code</h3>
<h4>Prerequisites</h4>
<b>sudo apt-get install nodejs npm git</b>

<b>sudo npm install -g npm</b>   #updates npm, it will throw a couple of warnings, just ignore.

<b>cd /usr/local/var</b>

<b>git clone https://github.com/nwdigitalradio/draws-manager.git</b>

<b>cd draws-manager</b>

<b>sudo cp draws-manager.service /lib/systemd/system</b>

<b>cd webapp</b>

<b>sudo /usr/bin/npm install</b>  #this will take a while

<b>sudo touch /etc/default/draws-manager</b> # If you want to set the port, edit /etc/default/draws-manager and add a line with the port number, e.g. PORT=80 (it defaults to 8080)

<b>sudo systemctl start draws-manager</b>

Open a browser and point it at the IP-address:port

