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
var name;

function onPlayerReady() {
    console.log('Player ready', player);
    player.pauseVideo();
    //player.cueVideoById("9RTaIpVuTqE");
    socket.emit('ready'); 
   
}

function updateCount(num){
    chatRoom.textContent = `${num} online`;
}
    
function onPlayerStateChange() {
    var state = player.getPlayerState();
    switch(state){
        case YT.PlayerState.UNSTARTED:
            console.log('unstarted');
            play();
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
            console.log('queued');
            play();
        break;
        default:
            console.log('state unknown', state);
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
    player = new YT.Player('video', {
        "origin" : "http://localhost:3000",
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

    /*var results = document.querySelectorAll('.result'), i;
    for(i=0; i < results.length; ++i){
       forResults(results[i]);   
    };
    
    function forResults(result){
        var title = result.querySelector('.title').textContent;
        var id = result.querySelector('.url').textContent;
        var imgsrc = result.querySelector('.thumbnail').src;

        result.addEventListener('click', (e)  => {
            if(confirm(`Add "${title}" to queue?`)){
                socket.emit('add video', title,id,imgsrc);
            }
        });
    }*/
    
    sendMsg.addEventListener('submit', (e) => {
        e.preventDefault();
        var msg = [msgInput.value, name];
        console.log('new message');
        socket.emit('message', msg);
        msgInput.value = '';
        displayMessage(msg, isSelf=true);
    });

    function displayMessage(msg, isSelf) {
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

socket.on('get name', () => {
    getName();
});

function getName(){
    name = prompt('Enter a user name');
    socket.emit('new user', name);
}

socket.on('new user', (userName, userCount) => {
    console.log(name, 'entered the chat');
    console.log(userCount, 'currently online');
    updateCount(userCount);
});

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

socket.on('sync video', (time) => {
    player.seekTo(time, true);
});

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

socket.on('load current', (nextvid) => {
    console.log('Loading next up:', nextvid[0], 'id:', nextvid[1]);
    var id = `${nextvid[1]}`;
    player.loadVideoById(id);
});

socket.on('poll', () => {
    console.log('POLLED');
    var t  = player.getCurrentTime();
    socket.emit('post', t);
});

socket.on('remove video', (num) => removeVid(num));

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
    console.log('Delete ', num , ' element in queue', inQueueElements.length);
    var elementToDelete = inQueueElements[num];
    elementToDelete.parentNode.removeChild(elementToDelete);
    inQueueElements.splice(elementToDelete);
    //inQueueVids.splice(inQueueVids[num]);
}

function play(){
    console.log('play initiated');
    player.playVideo();
    /*var count = 0;
    while((player.getPlayerState() !== YT.PlayerState.PLAYING) && (count < 10)){
        player.playVideo();
        count = count + 1;
        console.log(count, 'tries to start video');
        setTimeout(function() {
            player.playVideo();
        }, 1500);
    }*/
};