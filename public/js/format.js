const searchTab = document.querySelector('#searchTab');
const chatTab = document.querySelector('#chatTab');
const queueTab = document.querySelector('#queueTab');

//const chatRoom = document.querySelector('#chatRoom');

const search = document.querySelector('.search');
const chat = document.querySelector('.chat');
const queue = document.querySelector('.queue');

$(document).ready(function() {
    console.log('Format.js ready');

    chatRoom.addEventListener('click', () => {
        console.log('CLICKED');
        var name = chatRoom.textContent;
        if(confirm(`Leave chat "${name}?"`) === true){
            //Redirect to home page
        }
        else{
            //Do nothing
        }
    });

    searchTab.addEventListener('click', function(e) {
       // var arrow = searchTab.childNodes[1];
        
        if(search.style.display === 'none') {
            searchTab.style.transform = 'rotate(0deg)';
            search.style.display = 'initial';
            chatTab.style.display = 'none';
        }
        else{
            searchTab.style.transform = 'rotate(180deg)';
            search.style.display = 'none';
            chatTab.style.display = 'unset';
        }
    });

    chatTab.addEventListener('click', function() {
        // var arrow = chatTab.childNodes[1];
        if(chat.style.display === 'none'){
            chatTab.style.transform = 'rotate(180deg)';
            chat.style.display = 'flex';
            searchTab.style.display = 'none';
        }
        else{
            chatTab.style.transform = 'rotate(0deg)';
            chat.style.display = 'none';
            searchTab.style.display = 'unset';
        }
    });

    queueTab.addEventListener('click', function() {
        if(queue.style.display === 'none'){
            queueTab.style.transform = 'rotate(270deg)';
            queue.style.display = 'unset';
        }
        else{
            queueTab.style.transform = 'rotate(90deg)';
            queue.style.display = 'none';
        }
    });

});