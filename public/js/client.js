console.log('Client running');
console.log(window);

var socket = io.connect();
// const play = document.getElementById('play');
// const pause = document.getElementById('pause');
// const sync = document.getElementById('sync');
// const chat = document.getElementById('chat');

const sendMsg = document.getElementById('chatControl');
const chatArea = document.getElementById('chatArea');
const messageArea = document.querySelector('.messageArea');
const msgThread = document.querySelector('#thread');
const msgInput = document.querySelector('#inputMsg');
const chatRoom = document.querySelector('#chatRoom');

//const closeChat = document.getElementById('closeChat');
// const player = document.getElementById('player');
var player;

function onPlayerReady() {
    console.log('Player ready');
    player.playVideo();
}

    
function onPlayerStateChange() {
    var state = player.getPlayerState();  
    switch(state){
        case YT.PlayerState.UNSTARTED:
            console.log('unstarted');
            player.playVideo();
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
    }
}

function initPlayer() {
    console.log('iFrame API ready');
    if (typeof(window.YT) == 'undefined' || typeof(window.YT.Player) == 'undefined') {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    console.log(typeof(YT), typeof(YT.Player)); //doesn't always work :(

    player = new YT.Player('video', {
        events: {
        'onReady':onPlayerReady,
        'onStateChange':onPlayerStateChange
    }
    });
    console.log('player:', player);
    start();
}

function start() {
    console.log('Starting client fr');
    window.addEventListener('keydown', (e) => {
        if(e.keyCode === 32){
            togglePlay();
        }
    });
    
    function togglePlay(){
        //alert(player);
        //fill in
    }


    
    // play.addEventListener('click', (e) => {
    //     e.preventDefault();
    //     player.playVideo();
    //     socket.emit('play');
    // });

    // pause.addEventListener('click', (e) => {
    //     e.preventDefault();
    //     player.pauseVideo();
    //     socket.emit('pause');
    // });

    // sync.addEventListener('click', (e) => {
    //     var time = player.getCurrentTime();
    //     console.log('current time:', time);

    //     socket.emit('sync', time);
    // });

    socket.on('pause video', () => {
        player.pauseVideo();
    });

    socket.on('play video', () => {
        player.playVideo();
    });

    socket.on('sync video', (time) => {
        player.seekTo(time);
    });


    sendMsg.addEventListener('submit', (e) => {
        e.preventDefault();
        var msg = msgInput.value;
        console.log('new message');
        socket.emit('message', msg);
        msgInput.value = '';

        displayMessage(msg, isSelf=true);
    });

    function displayMessage(msg, isSelf) {
        const newmsg = document.createElement('li');
        newmsg.classList.add('msg');
        if(isSelf === true){
            newmsg.classList.add('self');
        }
        else{
            newmsg.classList.add('other');
        }

        newmsg.innerHTML = `<span class="meta">Olivia 9:54pm</span>
        <p class="text">
            ${msg}
            </p>`;

        // msgThread.appendChild(newmsg);
        msgThread.insertBefore(newmsg, msgThread.firstChild);
    };

    socket.on('display message', msg => {
        displayMessage(msg);
        // const newmsg = document.createElement('li');
        // newmsg.classList.add('msg');
        // newmsg.classList.add('other');

        // newmsg.innerHTML = `<span class="meta">Olivia 9:54pm</span>
        // <p class="text">
        //     ${msg}
        //     </p>`;

        // msgThread.appendChild(newmsg);
    });
}


//$(document).ready(function() {
$(window).on('load', function() {
    console.log('window loaded');
    //window.onYouTubeIframeAPIReady 
    window.onYTReady = initPlayer();
});