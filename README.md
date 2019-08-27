# draws-manager
Early development - NOT FOR DEPLOYMENT YET

<b>THIS CODE RUNS UNDER ROOT, DO NOT EXPOSE TO THE OPEN INTERNET</b>

<h3>Alpha Code</h3>
<h4>Prerequisites</h4>
<b>sudo apt-get install nodejs npm git lm-sensors</b>

<b>sudo npm install -g npm</b>   #this updates npm, it will throw a couple of warnings, just ignore.

<b>Get a recent version of <a href="https://github.com/nodesource/distributions/blob/master/README.md#debinstall" target="new">node.js and npm</a> using the Debian instructions.<b>

<b>cd /usr/local/var</b>

<b>sudo git clone https://github.com/nwdigitalradio/draws-manager.git</b>

<b>cd draws-manager</b>

<b>sudo cp draws-manager.service /lib/systemd/system</b>

<b>sudo cp draws-manager /etc/default</b>

<p># If you want to set the port, edit /etc/default/draws-manager and add a line with the port number, e.g. PORT=80 (it defaults to 8080)</p>

<b>cd webapp</b>

<b>sudo /usr/bin/npm install</b>  #this will take a while


<b>sudo systemctl start draws-manager</b>

Open a browser and point it at the IP-address:port

