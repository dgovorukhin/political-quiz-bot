const { stateFilename } = require('./settings'),
    express = require('express'), https = require('https'), ws = require('ws'), fs = require('fs'),
    app = express(), server = https.createServer({
        // DELETE AFTER DEBUG
        // key: fs.readFileSync('./src/certs/privkey.pem', 'utf-8'),
        // cert: fs.readFileSync('./src/certs/cert.pem', 'utf-8')
        key: fs.readFileSync('/letsencrypt/privkey.pem', 'utf-8'),
        cert: fs.readFileSync('/letsencrypt/cert.pem', 'utf-8')
    }, app),
    wss = new ws.Server({ server }), connections = new Set();

app.use(express.static('./static'));

wss.on('connection', conn => {
    connections.add(conn);
    conn.on('close', () => { connections.delete(conn); })
});

function updateResults(state, results) {
    const jsonState = JSON.stringify(state), jsonResults = JSON.stringify(results);
    fs.writeFileSync(stateFilename, jsonState);

    [...connections].forEach(conn => { try { conn.send(jsonResults); } catch (e) { } });
}

server.listen(443);

module.exports = { updateResults };