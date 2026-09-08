const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve our HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Store documents in memory (Account-free!)
const documents = {};

io.on('connection', (socket) => {
    console.log('A user connected to Poster5ync');

    // When a user opens or creates a document
    socket.on('join-doc', (docId) => {
        socket.join(docId);
        
        // If document doesn't exist, create it
        if (!documents[docId]) {
            documents[docId] = null;
        }
        
        // Send current content to the user if it exists
        if (documents[docId]) {
            socket.emit('load-doc', documents[docId]);
        }
    });

    // When a user edits the document
    socket.on('save-doc', (data) => {
        documents[data.docId] = data.doc;
        // Broadcast to everyone else viewing the same URL
        socket.to(data.docId).emit('sync-doc', data.doc);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Poster5ync is running on http://localhost:${PORT}`);
});