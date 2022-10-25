# A Web UI for Nikto Web Server Scanner

This is a [Next.js application] with Express as its custom server that runs Nikto to scan a web server and then it streams the std ouput to the web browser using Server-Sent Events.

The Web desing is built with the help of Bootstrap.

You need Docker and compose to run the Dev version (with hot reloading):

```
docker-compose up --build -d
```

Then just visit:

```
http://localhost:3000/
```

Note: User inputs are not validated, DO NOT host this in a public web server.
