// Back end video provider
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

var queue = [];
var users = new Map();
var current = -1;

var times;

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));


//Client connection
io.on('connection', socket => {
    socket.broadcast.emit('pause video');

    console.log('New User Streaming');
    console.log('Welcome! Currently', queue.length, 'videos in queue and', users.size, 'users');

    socket.on('ready', () => {
       // socket.emit('get name');
       socket.emit('get name');
        if(current !== -1){ //There is already something playing
          //  socket.emit('get name', 'load');
            console.log('load current video', current);
            socket.emit('load current', current);
            times = [];
            var t;
            pollTime();
            setTimeout(function() {
                t = getTime();
                console.log('Sync to time', t);
                socket.emit('sync video',t);
             }, 3000);
        }
        else{
            console.log('Nothing playing');
        }
        io.emit('play video');
    });

    socket.on('new user', name => {
        users.set(socket, name);
        io.emit('new user', name, users.size);
    });
    
    queue.forEach((q) => {
        console.log(q[0], q[1], q[2]);
        socket.emit('add video', q[0],q[1],q[2]);
    });

    socket.on('disconnect', () =>{
        var name = users.get(socket);
        console.log(name, 'left chat');
        users.delete(socket);
        io.emit('user left', name, users.size);
     
        if(users.size == 0){
            users.clear();
            queue = [];
            times = [];
            current = -1;
        }
    });

    socket.on('sync', (time) => {
        console.log('Sync to time', time);
        io.emit('sync video', time);
    });

    socket.on('pause', () => {
        //socket.broadcast.
        io.emit('pause video');
    });
    socket.on('play', () => {
        //socket.broadcast.
        io.emit('play video');
    });

    socket.on('message', (msg) => {
        console.log('Received:', msg[0], 'from', msg[1]);
        socket.broadcast.emit('display message', msg, isSelf=false);
    });
    
    socket.on('add video', (title,id,imgsrc)=> {
        var vid = [title,id,imgsrc];
        queue.push(vid);
        console.log(queue.length, 'in queue');
        io.emit('add video', title,id,imgsrc);
        if(queue.length == 1 && current == -1){
            io.emit('next video');
            io.emit('remove video');
            current = queue.pop();
        }
    });

    socket.on('remove video', (num) => {
        queue.splice(num);
        io.emit('remove video', num);
    });

    socket.on('next video', () => {
        if(queue.length == 0){
            current = -1;
        }
        else{
            io.emit('next video');
            //io.emit('remove video');
        }
    });

    socket.on('post', (time) => {
        console.log('POST');
        times.push(time);
    });


    function pollTime() {
        times = [];
        socket.broadcast.emit('poll');
        setTimeout(function() {
            console.log(`${times.length}/${users.size - 1} responses in 2000ms`);
            console.log(times);
        }, 2000);
    }
    
    function getTime(){
        return Math.min(...times);
    }
});

const PORT = process.env.PORT || 3000 ;

server.listen(PORT, () => console.log('Server running on port', PORT));

