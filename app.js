const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
const port = process.env.PORT || 3000;
const sessions = [];

app.use(express.json());
app.use(express.static('public'));

let server = require('http').createServer();

const sockserver = new WebSocketServer({ server });
sockserver.on('connection', (socket) => {
    console.log('WebSocket connection established');
});
sockserver.on('close', () => {
    console.log('WebSocket connection closed');
});
sockserver.on('error', (error) => {
    console.error('WebSocket error:', error);
});

function publishSession(session) {
    sockserver.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(session));
        }
    });
}

app.post('/api/make-session', (req, res) => {
    console.log('POST /api/make-session');
    const newSession = {
        id: uuidv4(),
        name: `Session ${sessions.length}`,
        counters: [],
    };
    sessions.push(newSession);
    res.send(newSession);
});

app.post('/api/add-counter/:id', (req, res) => {
    const id = req.params.id;
    console.log(`POST /api/add-counter/${id}`);
    const session = sessions.find(s => s.id === id);
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    const { name } = req.body;
    session.counters.push({ name, value: 0 });
    
    res.send(session);
    publishSession(session);
});

app.post('/api/increment-counter/:sessionId/:counterIndex', (req, res) => {
    const sessionId = req.params.sessionId;
    const counterIndex = parseInt(req.params.counterIndex);
    console.log(`POST /api/increment-counter/${sessionId}/${counterIndex}`);
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    const counter = session.counters[counterIndex];
    if (!counter) {
        res.status(404).send('Counter not found');
        return;
    }
    counter.value++;
    
    res.send(session);
    publishSession(session);
});

app.post('/api/decrement-counter/:sessionId/:counterIndex', (req, res) => {
    const sessionId = req.params.sessionId;
    const counterIndex = parseInt(req.params.counterIndex);
    console.log(`POST /api/decrement-counter/${sessionId}/${counterIndex}`);
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    const counter = session.counters[counterIndex];
    if (!counter) {
        res.status(404).send('Counter not found');
        return;
    }
    counter.value--;
    
    res.send(session);
    publishSession(session);
});

app.get('/session/:id', (req, res) => {
    const id = req.params.id;
    console.log(`GET /session/${id}`);
    const session = sessions.find(s => s.id === id);
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    res.send(session);
});

server.on('request', app);

server.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

//app.listen(port, () => {
//    console.log(`Example app listening on port ${port}`);
//});