const next = require('next');
const { parse } = require('url');

const express = require('express');
const spawn = require('child_process').spawn;
const fs = require('fs');

const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let connectedClients = [];

const Event = (type, content, output = null) => {
  // \n\n is the delimeter of every event
  return `data: ${JSON.stringify({ type, content, output })}\n\n`
}

(async () => {
  try {
    await app.prepare();
    const server = express();
    server.get('/api/scan', (req, res) => {
      const newClientId = Date.now();
      const outputFilename = `scanner_output_${newClientId}.json`;

      let niktoP = null;
      const hostToScan = req.query.host;
      const options = ['-h', hostToScan, '-nointeractive', '-output', outputFilename];
      if (req.query.staticCookie) options.push('-Option', "STATIC_COOKIE", req.query.staticCookie);
      if (req.query.tunning) options.push('-Tunning', req.query.tunning.replace(',', ''));

      // Headers for Server-Sent Events
      res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      });

      req.on('close', () => {
        console.log('Web client connection closed.');
        // Removes client and its output file
        connectedClients = connectedClients.filter(client => client !== newClientId);
        fs.unlink(outputFilename, (unlinkErr) => {
          if (unlinkErr) console.log(`Error deleting file: ${outputFilename} ${unlinkErr}`) 
        });
        // Stop spawned process
        if (niktoP) {
          niktoP.stdout.end();
          niktoP.kill();
        }
      });

      if (!hostToScan) {
        setTimeout(() => {
          res.write(Event('error', 'A valid hostname is required'));
        }, 1000);
      } else {
        console.log(`New web client has connected: ${newClientId}`);
        connectedClients.push(newClientId);
        // Spawns Nikto as a child process
        niktoP = spawn('nikto.pl', options);
        niktoP.stdout.on('data', (data) => {
          setTimeout(() => {
            const stdout = data.toString();
            res.write(Event('feed', stdout));
          }, 1000);
        });

        niktoP.on('close', (code) => {
          console.log(`Nikto process exited with code: ${code}`);
          setTimeout(() => {
            if (code === 1) {
              fs.readFile(outputFilename, (err, data) => {
                if (err) {
                  res.write(Event('error', `Error while reading the output: ${err}`));
                } else {
                  res.write(Event('done', `Scanning host: ${hostToScan} has ended.`, data.toString()));
                }
              });
            } else {
              res.write(Event('error', `Error while scanning host: ${hostToScan}`));
            }
          }, 1000);
        });
      }
    });

    // Default route
    server.all('*', async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`Server listening on port: ${port}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
