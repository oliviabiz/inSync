var myKey = 'AIzaSyC4RnG9lRwJGj4214HLsq6QGIbD0NCI33w';

const $form = $('#yt-search');
const $search = $('#searchInput')

const $results = $('#resultsArea');
const $clear = $('#clearSearch');
const $addVid = $('.addVid');

$(document).ready(function() {
    console.log('YouTube Search ready');

    $form.submit((e) => {
        e.preventDefault();
        clearResults();
        console.log('submit');
        var text = $search.val();

        if(text == ''){
            console.log(text, 'is invalid');
            return;
        }
        search(text, 15);
    });

    function search(keyword, num){ 
        console.log('Search for', keyword);
        $.get(
            'https://www.googleapis.com/youtube/v3/search', {
                part: "snippet",
                maxResults: num,
                q: keyword,
                order: 'relevance',
                type: 'video',
                key: myKey },
                function(data) {
                    $.each(data.items, function(i, item) {
                        display(item);
                    })
                }
        );
    }

    // Display search results
    function display(item){
        var title = item.snippet.title;
        var id = item.id.videoId;
        var imgsrc = item.snippet.thumbnails.high.url;
        
        var d = document.createElement('li');
        $(d).addClass('result');
        $(d).addClass('vid');
        $(d).html(
            `<img class='thumbnail' src="${imgsrc}">
            <div class="info">
                <h2 class='title'>${title}</h2>
                <button type="button" class="addVid">+<span class="url" href="${id}"></span></button>
            </div>`
        );
        var title = d.querySelector('.title').textContent;
        $(d).appendTo($results);

        d.addEventListener('click', (e)  => {
            if(inQueueElements.includes(d) == true){
                alert(`"${title}" is already in queue`);
            }
            else if(confirm(`Add "${title}" to queue?`)){
                socket.emit('add video', title,id,imgsrc);
                inQueueElements.push(d);
                var vid = [title,id,imgsrc];
                inQueueVids.push(vid);
            }
        });
    }

    function clearResults(){
        $results.html('');
    }

    $clear.click(function(e) {
        $search.val('');
    })
});
