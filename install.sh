#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

apt install python3 python3-pip -y 
pip3 install -r requirements.txt
pip3 install flask
cp -r  client/ /opt

USER_HOME=$(eval echo ~${SUDO_USER})
echo "alias py-share='python3 /opt/client/server.py'" >> $USER_HOME/.bash_aliases
source $USER_HOME/.bashrc