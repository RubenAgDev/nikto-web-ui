const path = require('path')
const express = require('express');
const spawn = require('child_process').spawn;

const PORT = process.env.PORT || 8080;

const app = express();

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/scan', (req, res) => {
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
            res.write(`data: ${JSON.stringify({ type: "error", event: "A valid hostname is required" })}\n\n`);
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
                res.write(`data: ${JSON.stringify({ type: "feed", event: stdout })}\n\n`);
            }, 1000);
        });

        niktoP.on('close', (code) => {
            setTimeout(() => {
                console.log(`Nikto process exited with code ${code}`);
                res.write(`data: ${JSON.stringify({ type: "done", event: `Scanning host: ${hostToScan} has ended!` })}\n\n`);
            }, 1000);
        });
    }
});

app.listen(PORT, () => {
    console.log(`Web server listening on port: ${PORT}`);
});
