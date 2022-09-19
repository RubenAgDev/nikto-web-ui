# A Web UI for Nikto Web Server Scanner

This is a Express (Node.js) application that runs Nikto to scan a web server and then it streams the std ouput to the web browser using Server-Sent Events.

The Web UI is simply built with the help of Bootstrap.

You need Docker and compose to run the Dev version (with hot reloading):

```
docker-compose up --build -d
```

Then just visit:

```
http://localhost:8000/
```
