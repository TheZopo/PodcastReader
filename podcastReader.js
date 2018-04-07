var streams = [];

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

            streams.push(stream);
            addStream(stream);
        } else {
            //TODO: ERROR BAD RESPONSE
        }
    };

    request.send();
}

function streamAlreadyExists() {
    for(var i = 0; i < streams.length; i++) {
        if(streams[i].url === document.getElementById("streamURL").value) return true;
    }

    return false;
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