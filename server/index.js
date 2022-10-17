const next = require('next');
const { parse } = require('url');

const express = require('express');
const spawn = require('child_process').spawn;

const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

(async () => {
  try {
    await app.prepare();
    const server = express();
    server.get('/api/scan', (req, res) => {
      let niktoP = null;
      const hostToScan = req.query.host;

      // Headers for Server-Sent Events
      res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      });

      req.on('close', () => {
        console.log('Web client connection closed.');
        // Stop spawned process
        if (niktoP) {
          niktoP.stdout.end();
          niktoP.kill();
        }
      });

      if (!hostToScan) {
        setTimeout(() => {
          res.write(`data: ${JSON.stringify({ type: 'error', event: 'A valid hostname is required' })}\n\n`);
        }, 1000);
      } else {
        // Spawns Nikto as a child process
        // Use only to scan non-CGI apps
        niktoP = spawn('nikto.pl', ['-h', hostToScan, '-Cgidirs', 'none']);
        niktoP.stdout.on('data', (data) => {
          setTimeout(() => {
            const stdout = data.toString();
            // console.log(stdout);
            // \n\n is the delimeter of every event
            res.write(`data: ${JSON.stringify({ type: 'feed', event: stdout })}\n\n`);
          }, 1000);
        });

        niktoP.on('close', (code) => {
          setTimeout(() => {
            console.log(`Nikto process exited with code ${code}`);
            res.write(`data: ${JSON.stringify({ type: 'done', event: `Scanning host: ${hostToScan} has ended!` })}\n\n`);
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
