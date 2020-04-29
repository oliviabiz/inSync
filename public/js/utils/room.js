// List of usernames
// Own name
// ...

//const users = new Map();
const users = [];
const rooms = [];

function newRoom(myRoomname){
    const myTimes = [];
    const myQueue = [];
    var myCurrent = -1;
    var CONNECTING, PREV_STATE;
    // prev state and connecting stuff
    const room = {
        name:myRoomname,
        times:myTimes,
        queue:myQueue,
        current:myCurrent,
        PREV_STATE:'UNSTARTED',
        CONNECTING: false
    };
    rooms.push(room);
    return room;
}

function deleteRoom(roomname){
    var theRoom = rooms.find(room => room.name == roomname);
    var index = rooms.indexOf(theRoom);
    rooms.splice(index,1);
}

function roomExists(roomname){
    var index = rooms.find(room => room.name === roomname);
    if(index == null){
        return false;
    }
    else{
        return true;
    }
}

function userJoin(userid, username, userroom){
    if(roomExists(userroom) === false){
        var theRoom = newRoom(userroom);
        console.log('Created new room', theRoom);
    }
    const user = {
        id:userid,
        name:username,
        room:userroom
    };
    users.push(user);
    return user;
}

function getCurrentUser(id){
    return users.find(user => user.id === id);
}

function getUserName(id){
    return getCurrentUser(id).name;
}

function getUserRoomname(id){
    return getCurrentUser(id).room;
}

function getUserRoom(id){
    var roomname = getCurrentUser(id).room;
    if(roomExists(roomname) === true){
        return rooms.find(room => room.name === roomname);
    }
    else{
        return -1;
    }
}

function userLeave(id){
    var toDelete = users.find(user => user.id === id);
    users.splice(users.indexOf(toDelete),1);
    return toDelete;
}

function getRoomUsers(roomname){
    return users.filter(user => user.room == roomname);
}

function numRoomUsers(roomname){
    return getRoomUsers(roomname).length;
}

function getUsers(){
    return users;
}

module.exports = {
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
};