# draws-manager
Early development - NOT FOR DEPLOYMENT YET

**THIS CODE RUNS UNDER ROOT, DO NOT EXPOSE TO THE OPEN INTERNET**

## Alpha Code

## Prerequisites

    sudo apt-get install nodejs npm git lm-sensors
    sudo npm install -g npm  # this updates npm, it will throw a couple of warnings, just ignore.

Get a recent version of [node.js and npm](https://github.com/nodesource/distributions/blob/master/README.md#debinstall) using the Debian instructions.

    cd /usr/local/var
    sudo git clone https://github.com/nwdigitalradio/draws-manager.git
    cd draws-manager
    sudo cp draws-manager.service /lib/systemd/system
    sudo cp draws-manager /etc/default

If you want to set the port, edit `/etc/default/draws-manager` and add a line with the port number, e.g. `PORT=80` (it defaults to 8080).

    cd webapp
    sudo /usr/bin/npm install  # this will take a while
    sudo systemctl start draws-manager

Open a browser and point it at the IP-address:port

