// Back end video provider
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const welcomeVid = '9RTaIpVuTqE'; //'jPan651rVMs';

var queue = [];
var users = new Map();
var current = -1;

var times;

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));
var numUsers = 0;

var PREV_STATE;
var CONNECTING = false;

//Client connection
io.on('connection', socket => {
    CONNECTING = true;
    numUsers++;
    socket.broadcast.emit('pause video'); // Everybody freeze


    console.log('NEW USER -', queue.length, 'vids in queue and', numUsers, 'users');

    var initID;
    function initialize(){
        if(current !== -1){
            initID = current[1];
            console.log('Start with current vid', current[0]);
        }
        else{
            initID = welcomeVid;
            console.log('Start with welcome vid');
        }
    }
    
    initialize();
    //socket.emit('init', initID);

    //Called when client's player is initialized
    socket.on('player ready', () => {
       console.log('new users window is loaded');
       socket.emit('get name');
    });

    socket.on('video ready', () => {
        console.log('READY FOR TAKEOFF BOYS');

        // Reset players to previous state
        CONNECTING = false;
        if(PREV_STATE == 'PLAY'){
            io.emit('play video');
        }
    });

    // Called when client responds to username prompt
    socket.on('new user', name => {
        users.set(socket, name);
        console.log('---------------Welcome,',name);

        setTime(); //Sets time and cues current player
      
        // Lets everyone know of a new user, update their count
        io.emit('new user', name, users.size);
    });
    
    // Fill in new user's queue
    queue.forEach((q) => {
        console.log(q[0], q[1], q[2]);
        socket.emit('add video', q[0],q[1],q[2]);
    });

    socket.on('disconnect', () =>{
        numUsers--;
        var name = users.get(socket);
        console.log(name, 'left chat');
        users.delete(socket);
        io.emit('user left', name, users.size);
     
        // Refresh server if no connections remaining
        if(users.size == 0){
            console.log('CLEAR SERVER');
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

        // Prevents pause from propagating when initalizing new player
        if(CONNECTING == false){
            io.emit('pause video');
            PREV_STATE = 'PAUSE';
        }

    });
    socket.on('play', () => {
        //socket.broadcast.
        io.emit('play video');
        PREV_STATE = 'PLAY';
    });

    // Receive new message from user
    socket.on('message', (msg) => {
        console.log('Received:', msg[0], 'from', msg[1]);
        socket.broadcast.emit('display message', msg, isSelf=false);
    });
    
    socket.on('add video', (title,id,imgsrc)=> {
        var vid = [title,id,imgsrc];
        queue.push(vid);
        console.log('Adding', title),'.', queue.length, 'now in queue';

        io.emit('add video', title,id,imgsrc);

        //One item in queue AND not playing
        // Might not need to be only one
        if(queue.length == 1 && current == -1){
            io.emit('next video');
           // io.emit('remove video');
            current = queue.pop();
        }
    });

    // Client requested to remove video from queue
    socket.on('remove video', (num) => {
        queue.splice(num);
        io.emit('remove video', num);
    });

    // Video ended -- will result in pushing everyone forward
    socket.on('next video', () => {
        if(queue.length == 0){
            current = -1;
        }
        else{
            io.emit('next video');
            queue.pop();
            //io.emit('remove video');
        }
    });

    // Received time update from client
    socket.on('post', (time) => {
        times.push(time);
    });

    // Polls all clients (except current) for time update
    // Loads current client's time to minimum time polled
    function setTime() {
        if(numUsers <= 1){
            socket.emit('load', initID, 0);
        }
        times = [];
        socket.broadcast.emit('poll');
        setTimeout(function() {
            console.log(`${times.length}/${users.size - 1} responses in 2000ms`);
            console.log(times);

            var t =  Math.min(...times);
            console.log('Syncing to time', t);
            socket.emit('load', initID, t);
        }, 2000);
    }
    
});

const PORT = process.env.PORT || 3000 ;

server.listen(PORT, () => console.log('Server running on port', PORT));