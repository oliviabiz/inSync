var myKey = 'AIzaSyC4RnG9lRwJGj4214HLsq6QGIbD0NCI33w';

const $search = $('#searchInput');
const $results = $('#resultsArea');
const $clear = $('#clearSearch');
const $addVid = $('.addVid');

$(document).ready(function() {
    console.log('YouTube Search ready');

    $('#yt-search').submit(function(e) {
        e.preventDefault();
        clearResults();
        console.log('submit');
        var text = $search.val();
        console.log(text);
        //$search.val('');
        search(text, 10);
    });

    function search(keyword, num){ 
        console.log('search for', keyword);
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
                        //console.log(item.snippet.title);
                        display(item);
                    })
                }
        );
    }

    function display(item){
        var title = item.snippet.title;
        var imgsrc = item.snippet.thumbnails.high.url;
        var id = item.id.videoId;

        var link = `https://youtube.com/watch?v=${id}`

        var d = document.createElement('li');
        $(d).addClass('result')
        $(d).html(
            `<img class='thumbnail' src="${imgsrc}">
            <div class="info">
                <h2 class='title'>${title}</h2>
                <button type="button" class="addVid">+<a href="${link}"></a></button>
            </div>`
        );
        $(d).appendTo($results);
    }

    function clearResults(){
        $results.html('');
    }

    $clear.click(function(e) {
        $search.val('');
    })

    $addVid.click(function(e) {
        console.log(e.target);
    })


});
