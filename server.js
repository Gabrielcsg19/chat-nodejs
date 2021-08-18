const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server)

server.listen(3000, () => console.log('Servidor em execução. Acesse http://localhost:3000'));

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

// Ao iniciar a conexão...
io.on('connection', (socket) => {
    console.log('Conexão detectada...');

    // Ouvindo o sinal "join-request"
    socket.on('join-request', (username) => {
        socket.username = username;
        connectedUsers.push(username);
        console.log(connectedUsers);

        socket.emit('user-ok', connectedUsers);
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });

    // Ouvindo o sinal "disconnect"
    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter((user) => user != socket.username);
        console.log(connectedUsers);
    
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });

    // Ouvindo o sinal "send-message"
    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            message: txt
        };

        socket.emit('show-msg', obj);
        socket.broadcast.emit('show-msg', obj)
    });
});

