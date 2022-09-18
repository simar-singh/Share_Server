# Share Server
---

## What is Share Server
Share server is a simple application to make file transfers between a host machine and virtual machine or between two machines a lot more user friendly. The inspiration came from my experience with CTFs. Usually if you want to share files between two machines, one needs to start a server and the other needs to make a request to said server (in CTFs you usally use wget to download the file from the CLI). 

Share Server is an easy GUI solution to sharing files. It comes with two options, either uploading or downloading files from the host machine. With the IP link generated, the other machine can download files from the host machine with ease. Uploading is also as easy as ever, with a simple drag and drop interface. 

## Getting Started
```
git clone https://github.com/simar-singh/Share-Server
cd Share-Server/
chmod +x install.sh
./install.sh
```
*Note root access will be required to install and run the application

You can then simply run the application by using the command 
```
py-share
```

## Technologies Used
* [Svelte](https://svelte.dev/) for the frontend of the application
* [Flask](https://flask.palletsprojects.com/en/2.0.x/) for the backend of the application using [Python](https://www.python.org/)

## Licence 
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
