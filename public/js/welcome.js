//const socket = io.connect('/init');

const form = $('#joinRoom');
//const roomID = $('#roomID');
const roomName = $('#roomName');
const name = $('#name');
var re = /^[A-Za-z0-9]+$/
//import { roomExists } from "utils/room.js";

$(document).ready( function() {
    $(form).submit((e) => {
        e.preventDefault();
        //alert('submitty');

        if(validString($(roomName).val()) == false || validString($(name).val()) == false) {
            alert('invalid input: must only contain letters and numbers and be at least 5 characters');
        }
      /*else if(roomExists(roomName)){
            alert('Room name already exists');
        }*/
        else{
           // window.location.replace('index.html');
           var room = $(roomName).val();
           var user = $(name).val();

           //socket.emit('joinRoom',room, user);
           console.log('Join room', room,user);
           
           console.log(window.location);
           //socket.emit('new user', user);
           window.location.assign(`insync.html?room=${room}&user=${user}`);
        }
    });
});

function validString(string){
    if(re.test(string) == false){
        return false;
    }
    else if(string.length < 5){
        return false;
    }
    else{
        return true;
    }
}