console.log('Client running');

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
const queueList = document.querySelector('#queueList');

const inQueueElements = [];
const inQueueVids = [];

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
        case YT.PlayerState.ENDED:
            socket.emit('next video');;
        break;
    }
    var time = player.getCurrentTime();
    socket.emit('sync',time);
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
        console.log(inQueueVids);
        if(inQueueVids.length > 1){
            var nextvid = inQueueVids.pop();
            console.log(nextvid);
            var id = `${nextvid[1]}`;
            console.log('switchint to id', id);
            player.loadVideoById(id);
            return false;
        }
    }

    var results = document.querySelectorAll('.result'), i;
    console.log(results);
    for(i=0; i < results.length; ++i){
        console.log(results[i]);
       forResults(results[i]);   
    };
    
    function forResults(result){
        var title = result.querySelector('.title').textContent;
        var id = result.querySelector('.url').textContent;
        var imgsrc = result.querySelector('.thumbnail').src;

        //var vid = (title,link,imgsrc);

        console.log(imgsrc.textContent);
        result.addEventListener('click', (e)  => {
            console.log('title',title);
            if(confirm(`Add "${title}" to queue?`)){
                socket.emit('add video', title,link,imgsrc);
            }
        });
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
    });
}


//$(document).ready(function() {
$(window).on('load', function() {
    console.log('window loaded');
    //window.onYouTubeIframeAPIReady 
    window.onYTReady = initPlayer();
});

socket.on('pause video', () => {
    player.pauseVideo();
});

socket.on('play video', () => {
    player.playVideo();
});

socket.on('sync video', (time) => {
    player.seekTo(time);
});

socket.on('remove video', (num) => {
    var toDelete = queue[num];
    toDelete.parentNode.removeChild(toDelete);
    inQueue.splice(toDelete);
});

socket.on('add video', (title,link,imgsrc) => {
    console.log('add', title);

    console.log('Adding to queue');
    var vid = document.createElement('li');
    $(vid).addClass('list');
    $(vid).addClass('vid');

    $(vid).html(
        `<div class="info">
            <h2 class='title'>${title}</h2>
            <a href="${link}"></a>
        </div>
        <img class='thumbnail' src="${imgsrc}">`
    );

    inQueueElements.push(vid);
    var vidData = [title,link,imgsrc];
    inQueueVids.push(vidData);

    queueList.appendChild(vid);
    vid.addEventListener('click', (e) =>{
        if(confirm(`Remove "${title}" from queue?`)){
            //delete from playlist
            socket.emit('remove video', queue.indexOf(vid));
        }
    });

});