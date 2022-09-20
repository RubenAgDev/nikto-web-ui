const path = require('path')
const express = require('express');
const spawn = require('child_process').spawn;

const PORT = process.env.PORT;

const app = express();

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/scan', (req, res) => {
    const hostToScan = req.query.host
    if (!hostToScan) return res.send(400);

    // Spawns Nikto as a child process
    const niktoP = spawn('nikto.pl', ['-h', hostToScan, '-Cgidirs', 'none']);
    // Headers for Server-Sent Events
    res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
    });
    
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
            res.write(`data: ${JSON.stringify({ type: "close", event: `Scanning host: ${hostToScan} has ended!` })}\n\n`);
        }, 1000);
    });

    req.on('close', () => {
        console.log('Web client connection closed.');
        // Stop spawned process
        if (niktoP) {
            niktoP.stdout.end();
            niktoP.kill();
        }
    });
});

app.listen(PORT, () => {
    console.log(`Web server listening on port: ${PORT}`);
});
