// Back end video provider
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const queue = [];

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));


//Client connection
io.on('connection', socket => {
    console.log('New User Streaming');
    console.log('Welcome! Currently', queue.length, 'videos in queue');

    queue.forEach((q) => {
        console.log(q[0], q[1], q[2]);
        socket.emit('add video', q[0],q[1],q[2]);
    });

    socket.on('disconnect', () =>{
        console.log('User Left');
    });

    socket.on('sync', (time) => {
        console.log('Sync to time', time);
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
    
    socket.on('add video', (title,id,imgsrc)=> {
        var vid = [title,id,imgsrc];
        queue.push(vid);
        console.log(queue.length);
        io.emit('add video', title,id,imgsrc);
    });

    socket.on('remove video', (num) => {
        queue.splice(num);
        io.emit('remove video', num);
    });

    socket.on('next video', () => {
        io.emit('next video');
    });
});

const PORT = process.env.PORT || 3000 ;

server.listen(PORT, () => console.log('Server running on port', PORT));