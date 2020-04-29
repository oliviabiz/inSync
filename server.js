// Back end video provider
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const {
    newRoom,
    deleteRoom,
    roomExists,
    userJoin,
    getCurrentUser,
    getUserName,
    getUserRoomname,
    getUserRoom,
    userLeave,
    getRoomUsers,
    numRoomUsers,
    getUsers
} = require('./public/js/utils/room');

const welcomeVid = '9RTaIpVuTqE'; //'jPan651rVMs';


//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Client connection
io.on('connection', socket => {   
    console.log('New Connection');

    var initID;
    function initialize(){
        var room = getUserRoom(socket.id);
        if(room.current !== -1){
            initID = room.current[1];
            console.log('Start with current vid', room.current[0]);
        }
        else{
            initID = welcomeVid;
            console.log('Start with welcome vid');
        }
    }
    
    //Called when client's player is initialized
    socket.on('player ready', () => {
       socket.emit('get user');
    });

    // Called when client responds to username prompt
    socket.on('new user', (name, room) => {
        var user = userJoin(socket.id, name, room);
        socket.to(room).emit('pause video'); // Everybody freeze

        socket.join(user.room);
        getUserRoom(user.id).CONNECTING = true;

        initialize();

        console.log(user.name, 'has entered', user.room);
        console.log(numRoomUsers(user.room), 'in', user.room);

        setTime(getUserRoom(user.id)); //Sets time and cues current player

        // Lets everyone know of a new user, update their count
        io.in(user.room).emit('new user', user.name, numRoomUsers(room));
        fillQueue();
    });

    socket.on('video ready', () => {
        var room = getUserRoom(socket.id);
   
        // Reset players to previous state
        room.CONNECTING = false;
        if(room.PREV_STATE == 'PLAY'){
            //socket.emit('play video');
            // will it trickle?            
            io.in(room.name).emit('play video');
        }
    });

    // Fill in new user's queue
    function fillQueue(){    
        var myRoom = getUserRoom(socket.id);
        myRoom.queue.forEach((q) => {
            console.log(q[0], q[1], q[2]);
            socket.emit('add video', q[0],q[1],q[2]);
        });
    }

    socket.on('disconnect', () =>{
        var user = getCurrentUser(socket.id);
        
        if(user == 'undefined'){
            console.log('PROBLEM - DELETING UNDEFINED');
            return;
        }
      //  console.log('DELETING', user);
       

        userLeave(socket.id);

        var numLeft = numRoomUsers(user.room);
        console.log(user.name, 'left', user.room, numLeft, 'remaining');

        io.in(user.room).emit('user left', user.name, numRoomUsers(user.room));
     
        // Refresh server if no connections remaining
        if(numRoomUsers(user.room) == 0){
            console.log('CLEARING ROOM', user.room);
            deleteRoom(user.room);
        }
    });

    socket.on('sync', (time) => {
        //console.log('Sync to time', time);
        io.in(getUserRoomname(socket.id)).emit('sync video', time);
    });

    socket.on('pause', () => {
        // Prevents pause from propagating when initalizing new player
        var room = getUserRoom(socket.id);
        if(room.CONNECTING == false){
            io.in(room.name).emit('pause video');
            room.PREV_STATE = 'PAUSE';
        }
    });
    socket.on('play', () => {
        var room = getUserRoom(socket.id);
        io.in(room.name).emit('play video');
        room.PREV_STATE = 'PLAY';
    });

    // Receive new message from user
    socket.on('message', (msg) => {
        //console.log('Received:', msg[0], 'from', msg[1]);
        socket.to(getUserRoomname(socket.id)).emit('display message', msg, isSelf=false);
    });
    
    socket.on('add video', (title,id,imgsrc)=> {
        var room = getUserRoom(socket.id);
        var vid = [title,id,imgsrc];

        room.queue.push(vid);
        console.log('Adding', title,'. Now', room.queue.length, 'vids in', room.name,'queue');

        io.in(room.name).emit('add video', title,id,imgsrc);

        //One item in queue AND not playing
        //Might not need to be only one
        if(room.queue.length == 1 && room.current == -1){
            io.in(room.name).emit('next video');
            room.current = room.queue.pop();
        }
    });

    // Client requested to remove video from queue
    socket.on('remove video', (num) => {
        var room = getRoom(socket.id);
        room.queue.splice(num);
        io.in(room,name).emit('remove video', num);
    });

    // Video ended -- will result in pushing everyone forward
    socket.on('next video', () => {
        var room = getRoom(socket.id);
        if(room.queue.length == 0){
            room.current = -1;
        }
        else{
            io.in(room).emit('next video');
            room.current = room.queue.pop();
        }
    });

    // Received time update from client
    socket.on('post', (time) => {
        var user = getCurrentUser(socket.id);
        //console.log('POST from', socket.id, user);
        getUserRoom(socket.id).times.push(time);
    });

    // Polls all clients (except current) un room for time update
    // Loads current client's time to minimum time polled
    function setTime(room) {
        if(numRoomUsers(room.name) <= 1){
            socket.emit('load', initID, 0);
            return;
        }
        room.times = [];
        socket.to(room.name).emit('poll'); //Poll users in room
        setTimeout(function() {
            console.log(`${room.times.length}/${numRoomUsers(room.name)-1} responses in 2000ms`);
            var t =  Math.min(...room.times);
            console.log('Syncing to time', t);
            socket.emit('load', initID, t);
        }, 2000);
    }
    
});

const PORT = process.env.PORT || 3000 ;

server.listen(PORT, () => console.log('Server running on port', PORT));