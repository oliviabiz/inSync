console.log('Client running');

const socket = io.connect();

const sendMsg = document.getElementById('chatControl');
const chatArea = document.getElementById('chatArea');
const messageArea = document.querySelector('.messageArea');
const msgThread = document.querySelector('#thread');
const msgInput = document.querySelector('#inputMsg');
const chatRoom = document.querySelector('#chatRoom');
const queueList = document.querySelector('#queueList');

const inQueueElements = [];
const inQueueVids = [];

var player;
var myName;

function onPlayerReady() {
    console.log('PLAYER ready', player);
 //   player.pauseVideo();
    //player.cueVideoById("9RTaIpVuTqE");
    socket.emit('player ready'); 
   
}

function updateCount(num){
    chatRoom.textContent = `${num} online`;
}
    
function onPlayerStateChange() {
    var state = player.getPlayerState();
    switch(state){
        case YT.PlayerState.UNSTARTED:
            console.log('unstarted');
           // play();
            break;
        case YT.PlayerState.PAUSED:
            console.log('paused');
            socket.emit('pause');
        break;
        case YT.PlayerState.PLAYING:
            console.log('playing');
            socket.emit('play');
        break;
        case YT.PlayerState.BUFFERING:
            console.log('buffering');
        break;
        case YT.PlayerState.ENDED:
            console.log('ended');
            socket.emit('next video');
        break;
        case YT.PlayerState.CUED:
            console.log('queued at',player.getCurrentTime());
            socket.emit('video ready');
           // play();
        break;
        default:
            console.log('state unknown', state);
        break;
    }
}

function initPlayer(vidId) {
    console.log('iFrame API ready');
    console.log('Initalizing with ID:', vidId);
    if (typeof(window.YT) == 'undefined' || typeof(window.YT.Player) == 'undefined') {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    player = new YT.Player('video', {
        "origin" : "https://www.youtube.com ", // "https://in-sync.azurewebsites.net",
        //'videoId': '9RTaIpVuTqE',
       // 'videoId': vidId,
        events: {
        'onReady':onPlayerReady,
        'onStateChange':onPlayerStateChange
    }
    });
    start();
}

function start() {
    console.log('Starting client');
    window.addEventListener('keydown', (e) => {
        if(e.keyCode === 32){
         //   play();
        }
    });
    
    sendMsg.addEventListener('submit', (e) => {
        e.preventDefault();
        var msg = [msgInput.value, myName];
        console.log('new message');
        socket.emit('message', msg);
        msgInput.value = '';
        displayMessage(msg, isSelf=true);
    });

    function displayMessage(msg, isSelf) {
        //Notify if chat is closed
        if(chat.style.display !== 'flex'){
            chatTab.style.backgroundColor = '#E87015';
            document.title = 'inSync (1)';
        }

        const newmsg = document.createElement('li');
        var text = msg[0];
        var user = msg[1];

        newmsg.classList.add('msg');
        if(isSelf == true){
            newmsg.classList.add('self');
        }
        else{
            newmsg.classList.add('other');
        }

        newmsg.innerHTML = `<span class="meta">${user} 9:54pm</span>
        <p class="text">
            ${text}
            </p>`;

        msgThread.insertBefore(newmsg, msgThread.firstChild);
    };

    socket.on('display message', msg => {
        displayMessage(msg);
    });
}


$(window).on('load', function() {
    console.log('window loaded');
    window.onYTReady = initPlayer();
});

socket.on('init', (id) => {
    window.onYTReady = initPlayer(id);
    console.log('Have been provided ID from server', id);
});

// Called when server receives notif that player is ready
socket.on('get name', () => {
    getName();
});

function getName(){
    myName = prompt('Enter a user name');
    socket.emit('new user', myName);
}

// Called when a new username+socket have been defined
socket.on('new user', (userName, userCount) => {
    if(userName == myName){
        alert(`Welcome, ${myName}!`);
    }
    else{
        alert(`${userName} entered the chat`);
    }
    console.log(userCount, 'currently online');
    updateCount(userCount);
});

// Called when a socket disconnects
socket.on('user left', (name, size) =>{
    updateCount(size);
    console.log(name,'left chat');
});

socket.on('pause video', () => {
    if(player.getPlayerState() == YT.PlayerState.PLAYING){
        player.pauseVideo();
    }
});

socket.on('play video', () => {
    play();
});

socket.on('sync video', (id,time) => {
    player.cueVideoById(id,time);
//    player.seekTo(time, true);
});

// Called after video ended if there is anything in queue
socket.on('next video', () => {
    if(inQueueVids.length > 0){
        removeVid(0);
        var nextvid = inQueueVids.pop();
        console.log('Next up:', nextvid[0], 'id:', nextvid[1]);
        var id = `${nextvid[1]}`;
        player.loadVideoById(id);
        play();
    }
});

// Loads 
socket.on('load', (id, time) => {
    //console.log('Loading next up:', nextvid[0], 'id:', nextvid[1]);
    //var id = `${nextvid[1]}`;
    //player.loadVideoById(id);
    if(time!== Infinity){
        player.cueVideoById(id, time);
   
      //  player.seekTo(time);

        console.log('loaded to', time);
        console.log('currently at', player.getCurrentTime());
    }
    else{
        player.cueVideoById(id);
    }
});

// Request from server to give time update
socket.on('poll', () => {
    console.log('POLLED');
    var t  = player.getCurrentTime();
    socket.emit('post', t);
});

socket.on('remove video', (num) => removeVid(num));

// Adds video to queue
socket.on('add video', (title,id,imgsrc) => {
    console.log('add', title, 'to queue');
    var vid = document.createElement('li');
    $(vid).addClass('list');
    $(vid).addClass('vid');

    $(vid).html(
        `<div class="info">
            <h2 class='title'>${title}</h2>
            <a href="${id}"></a>
        </div>
        <img class='thumbnail' src="${imgsrc}">`
    );

    inQueueElements.push(vid);
    var vidData = [title,id,imgsrc];
    inQueueVids.push(vidData);

    queueList.appendChild(vid);
    vid.addEventListener('click', (e) =>{
        if(confirm(`Remove "${title}" from queue?`)){
            //delete from playlist
            socket.emit('remove video', inQueueElements.indexOf(vid));
        }
    });

});

function removeVid(num) {
    console.log('Delete ', num , ' video in queue', inQueueElements.length);
    var elementToDelete = inQueueElements[num];
    elementToDelete.parentNode.removeChild(elementToDelete);
    inQueueElements.splice(elementToDelete);
    
    inQueueVids.splice(inQueueVids[num]);
}

function play(){
    console.log('play initiated');
    player.playVideo();
};