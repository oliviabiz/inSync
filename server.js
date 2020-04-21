// Back end video provider
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));


//Client connection
io.on('connection', socket => {
    console.log('New User Streaming');

    socket.on('disconnect', () =>{
        console.log('User Left');
    });

    socket.on('sync', (time) => {
        console.log('Sync request to time', time);
        io.emit('sync video', time);
    });

    socket.on('pause', () => {
        socket.broadcast.emit('pause video');
    });
    socket.on('play', () => {
        socket.broadcast.emit('play video');
    });

    socket.on('message', msg => {
        console.log('Received:', msg);
        socket.broadcast.emit('display message', msg);
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log('Server running on port', PORT));