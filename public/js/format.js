const searchTab = document.querySelector('#searchTab');
const chatTab = document.querySelector('#chatTab');

//const chatRoom = document.querySelector('#chatRoom');
const search = document.querySelector('.search');
const chat = document.querySelector('.chat');

$(document).ready(function() {
    console.log('Format.js ready');

    chatRoom.addEventListener('click', () => {
        var name = chatRoom.textContent;
        if(confirm(`Leave chat "${name}?"`) === true){
            //Redirect to home page
        }
        else{
            //Do nothing
        }
    });

    searchTab.addEventListener('click', function(e) {
        var arrow = searchTab.childNodes[1];
        
        if(search.style.display === 'none') {
            arrow.style.transform = 'rotate(0deg)';
            search.style.display = 'initial';
        }
        else{
            arrow.style.transform = 'rotate(180deg)';
            search.style.display = 'none';
        }
    });

    chatTab.addEventListener('click', function() {
        var arrow = chatTab.childNodes[1];
        if(chat.style.display === 'none'){
            arrow.style.transform = 'rotate(180deg)';
            chat.style.display = 'flex';
        }
        else{
            arrow.style.transform = 'rotate(0deg)';
            chat.style.display = 'none';
        }
    });

});