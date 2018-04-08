var streams = [];
var playlist = [];

function loadStream() {
    if(streamAlreadyExists()) {
        //TODO: ERROR STREAM ALREADY EXIST
        document.getElementById("streamURL").value = "";
        return;
    }

    var url = "https://crossorigin.me/" + document.getElementById("streamURL").value;
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.setRequestHeader("Origin", "http://localhost/");

    request.onerror = function() {
        //TODO: ERROR BAD URL
    };

    request.onload = function() {
        if (request.status === 200) {
            var xmlStream = (new DOMParser()).parseFromString(request.responseText, "text/xml");
            var stream = {
                url: document.getElementById("streamURL").value,
                title: xmlStream.querySelector("channel > title").textContent,
                description: xmlStream.querySelector("channel > description").textContent
            };

            //If we can't get the image from legacy RSS tags we try with ITunes tags that are often implemented
            stream.image = xmlStream.querySelector("channel > image > url") === null ? xmlStream.getElementsByTagNameNS("http://www.itunes.com/dtds/podcast-1.0.dtd", "image")[0].getAttribute("href") : xmlStream.querySelector("channel > image > url").textContent;

            var podcasts = [];
            xmlStream.querySelectorAll("item").forEach(function(item) {
                var podcast = {
                    id: (streams.length + "-" + podcasts.length),
                    title: item.querySelector("title").textContent,
                    description: htmlDecode(item.querySelector("description").textContent),
                    date: new Date(item.querySelector("pubDate").textContent).toLocaleDateString("fr-FR"),
                    url: item.querySelector("enclosure").getAttribute("url"),
                    type: item.querySelector("enclosure").getAttribute("type"),
                };

                podcasts.push(podcast);
            });

            stream.podcasts = podcasts;

            streams.push(stream);
            addStream(stream);
        } else {
            //TODO: ERROR BAD RESPONSE
        }
    };

    request.send();
}

function addStream(stream) {
    document.getElementById("streamURL").value = "";

    var dom_stream = buildDOMStream(stream);
    document.getElementsByClassName("streams")[0].appendChild(dom_stream);
    fadeIn(dom_stream);
}

function buildDOMStream(stream) {
    var dom_stream = document.createElement("div");
    dom_stream.classList.add("stream");
    dom_stream.onclick = function() { selectStream(stream) };

    var img = document.createElement("img");
    img.setAttribute("src", stream.image);

    var description = document.createElement("div");
    description.classList.add("description");

    var h1 = document.createElement("h1");
    h1.textContent = stream.title;

    var p = document.createElement("p");
    p.textContent = stream.description;

    description.appendChild(h1);
    description.appendChild(p);

    dom_stream.appendChild(img);
    dom_stream.appendChild(description);

    return dom_stream;
}

function selectStream(stream) {
    var podcasts = document.getElementsByClassName("podcasts")[0];
    while(podcasts.firstChild) podcasts.removeChild(podcasts.firstChild);

    stream.podcasts.forEach(function(podcast) {
        podcasts.appendChild(buildDOMPodcast(podcast));
    });

    document.getElementById("streamCover").setAttribute("src", stream.image);
    document.getElementById("streamTitle").textContent = stream.title;

    streamsToPodcasts();
}

function buildDOMPodcast(podcast) {
    var dom_podcast = document.createElement("div");
    dom_podcast.classList.add("podcast");
    dom_podcast.setAttribute("podcastid", podcast.id);
    dom_podcast.onclick = function() { onClickOnPodcastList(podcast, dom_podcast) };

    var h1 = document.createElement("h1");
    h1.textContent = podcast.title + " (" + podcast.date + ")";

    var p = document.createElement("p");
    p.textContent = podcast.description;

    dom_podcast.appendChild(h1);
    dom_podcast.appendChild(p);

    return dom_podcast;
}

function buildVideoTag(stream) {
    var video = document.getElementsByTagName("video")[0];
    while(video.firstChild) video.removeChild(video.firstChild);

    stream.podcasts.forEach(function(podcast) {
        var source = document.createElement("source");
        source.setAttribute("src", podcast.url);
        source.setAttribute("type", podcast.type);

        video.appendChild(source);
    });

    return video;
}

function onClickOnPodcastList(podcast, dom_podcast) {
    var items = document.getElementsByClassName("items")[0];

    if(!podcastAlreadyInPlaylist(podcast)) {
        dom_podcast.classList.add("selected");

        var playlistItem = document.createElement("div");
        playlistItem.classList.add("item");
        playlistItem.setAttribute("podcastid", podcast.id);
        playlistItem.textContent = streams[podcast.id.split("-")[0]].title + " - " + podcast.title + " (" + podcast.date + ")";

        var controls = document.createElement("div");
        controls.classList.add("itemControls");

        var upArrow = document.createElement("webicon");
        upArrow.setAttribute("icon", "entypo:chevron-with-circle-up");
        upArrow.onclick = function () { podcastUp(podcast) };
        if(playlist.length === 0) upArrow.style.display = "none";

        var downArrow = document.createElement("webicon");
        downArrow.setAttribute("icon", "entypo:chevron-with-circle-down");
        downArrow.style.display = "none";
        downArrow.onclick = function () { podcastDown(podcast) };

        var remove = document.createElement("webicon");
        remove.setAttribute("icon", "maki:cross");
        remove.onclick = function() { removePodcastFromList(podcast) };

        controls.appendChild(upArrow);
        controls.appendChild(downArrow);
        controls.appendChild(remove);

        playlistItem.appendChild(controls);

        if(playlist.length > 0) items.lastChild.children[0].children[1].style.display = "inline-block";
        items.appendChild(playlistItem);

        //Needed to update icons, this is the only use of JQuery in the code
        $(document).webicons();

        playlist.push(podcast);
    } else {
        removePodcastFromList(podcast);
    }

    document.getElementById("addItemHint").style.display = playlist.length === 0 ? "inline" : "none";
}

function removePodcastFromList(podcast) {
    var podcasts = document.getElementsByClassName("podcasts")[0];
    for(var i = 0; i < podcasts.children.length; i++) {
        if(podcasts.children[i].getAttribute("podcastid") === podcast.id) {
            podcasts.children[i].classList.remove("selected");
            break;
        }
    }

    var playlistItems = document.getElementsByClassName("items")[0];
    for(i = 0; i < playlistItems.children.length; i++) {
        if(playlistItems.children[i].getAttribute("podcastid") === podcast.id) {
            playlistItems.removeChild(playlistItems.children[i]);
            break;
        }
    }

    playlist.splice(playlist.indexOf(podcast), 1);

    document.getElementById("addItemHint").style.display = playlist.length === 0 ? "inline" : "none";

    if(playlist.length > 0) playlistItems.lastChild.children[0].children[1].style.display = "none";
    if(playlist.length > 0) playlistItems.firstChild.children[0].children[0].style.display = "none";
}

function podcastUp(podcast) {
    //TODO: Podcast up
}

function podcastDown() {
    //TODO: podcast down
}

//  UTILS
function streamAlreadyExists() {
    for(var i = 0; i < streams.length; i++) {
        if(streams[i].url === document.getElementById("streamURL").value) return true;
    }

    return false;
}

function podcastAlreadyInPlaylist(podcast) {
    for(var i = 0; i < playlist.length; i++) {
        if(playlist[i].url === podcast.url) return true;
    }

    return false;
}

function htmlDecode(input){
    var element = document.createElement('div');
    element.innerHTML = input;
    return element.childNodes.length === 0 ? "" : element.childNodes[0].nodeValue;
}

//  ANIMATIONS
function fadeIn(element) {
    var op = 0.1;
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}

function streamsToPodcasts() {
    window.scrollTo(0, 0);

    document.querySelector(".screen#streams").animate([
        {transform: "translateX(0)"},
        {transform: "translateX(-100vw)"}
    ], {
        duration: 250
    });

    document.querySelector(".screen#podcasts").animate([
        {transform: "translateX(0)"},
        {transform: "translateX(-100vw)"}
    ], {
        duration: 250
    });

    setTimeout(function() {
        document.querySelector(".screen#podcasts").style.left = "0";
        document.querySelector(".screen#streams").style.left = "-100vw";
    }, 250);
}

function podcastsToStreams() {
    document.querySelector(".screen#streams").animate([
        {transform: "translateX(0)"},
        {transform: "translateX(100vw)"}
    ], {
        duration: 250
    });

    document.querySelector(".screen#podcasts").animate([
        {transform: "translateX(0)"},
        {transform: "translateX(100vw)"}
    ], {
        duration: 250
    });

    setTimeout(function() {
        document.querySelector(".screen#podcasts").style.left = "100vw";
        document.querySelector(".screen#streams").style.left = "0";
    }, 250);
}