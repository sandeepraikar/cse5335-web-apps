// Student Name :  Sandeep N Raikar
// UTA ID : 1001103332 
// http://omega.uta.edu/~snr3332/project1/music.html

// API key from last.fm 
//var api_key = "f25d360ab5d3ea457396771fac4e1bd5";
var api_key = "30d0a0173d9fa55d47d6fd546a40059c";
//Creating new XMLHttpRequest objects
var artistInfoRequest = new XMLHttpRequest();
var topAlbumsRequest = new XMLHttpRequest();
var upcomingEventsRequest = new XMLHttpRequest();

//This method is used to clear the div's for the next search request
function flushDivContainers() {
    //Flushing Artist Top Albums  <div> container
    document.getElementById("artistTopAlbums").innerHTML = "";

    //Flushing Artist Info <div> container
    document.getElementById("artistUpcomingEvents").innerHTML = "";

    //Show the 'artistInfo' <div> container
    document.getElementById("artistInfo").style.visibility = "visible";

}

// This function is executed on page load, and hides the artistinfo <div> tag
function initialize() {
    //Hide the 'artistInfo'<div> container
    document.getElementById('artistInfo').style.visibility = "hidden";
}

// This function sends the XMLHttpRequest for fetching the artist Info, Top Albums and Upcoming Events via the proxy.php 
function sendRequest() {
    var artist = document.getElementById("form-input").value;
    flushDivContainers();
    if (artist.length >= 1) {

        var requestMethod = "artist.getinfo";
        artistInfoRequest.onreadystatechange = displayArtistInfo;
        artistInfoRequest.open("GET", "proxy.php?method=" + requestMethod + "&artist=" + artist + "&api_key=" + api_key + "&format=json", true);
        artistInfoRequest.withCredentials = "true";
        artistInfoRequest.send();

        requestMethod = "artist.getTopAlbums";
        topAlbumsRequest.onreadystatechange = displayTopAlbums;
        topAlbumsRequest.open("GET", "proxy.php?method=" + requestMethod + "&artist=" + artist + "&api_key=" + api_key + "&format=json", true);
        topAlbumsRequest.withCredentials = "true";
        topAlbumsRequest.send();


        requestMethod = "artist.getEvents";
        upcomingEventsRequest.onreadystatechange = displayUpcomingEvents;
        upcomingEventsRequest.open("GET", "proxy.php?method=" + requestMethod + "&artist=" + artist + "&api_key=" + api_key + "&format=json", true);
        upcomingEventsRequest.withCredentials = "true";
        upcomingEventsRequest.send();

    } else {
        alert("Please enter the Artist Name");
        document.getElementById("form-input").focus();
        return false;
    }
}

//This function displays the http response retrieved via the REST API for fetching the artist info
function displayArtistInfo() {
    if (artistInfoRequest.readyState == 4) {
        var json = JSON.parse(artistInfoRequest.responseText);
        var str = JSON.stringify(json, undefined, 2);

        document.getElementById("artistName").innerHTML = JSON.stringify(json.artist.name).replace(/"/g, '');
        document.getElementById("artistURL").href = JSON.stringify(json.artist.url).replace(/"/g, '');
        document.getElementById("spanURLLink").innerHTML = JSON.stringify(json.artist.url).replace(/"/g, '');
        var imageURL = json.artist.image[2]["#text"];
        document.getElementById("artistImage").src = imageURL.replace(/"/g, '');

        var tags = [];
        for (var i = 0; i < json.artist.tags.tag.length; i++) {
            tags.push(json.artist.tags.tag[i].name);
        }
        document.getElementById("artistTags").innerHTML = tags;
        document.getElementById("artistBioLink").href = JSON.stringify(json.artist.bio.links.link.href).replace(/"/g, '');
        document.getElementById("spanBioLink").innerHTML = JSON.stringify(json.artist.bio.links.link.href).replace(/"/g, '');
        document.getElementById("artistBioSummary").innerHTML = json.artist.bio.summary;
    }
}

//This function displays the http response retrieved via the REST API for fetching Top Albums of the artist
function displayTopAlbums() {
    if (topAlbumsRequest.readyState == 4) {
        var json = JSON.parse(topAlbumsRequest.responseText);
        var str = JSON.stringify(json, undefined, 2);
        var arrayLength = json.topalbums.album.length;
        if (arrayLength >= 1) {
            var topAlbumsArray = [];
            for (var i = 0; i < arrayLength; i++) {
                topAlbumsArray.push({
                    name: json.topalbums.album[i].name,
                    url: json.topalbums.album[i].url,
                    imageurl: json.topalbums.album[i].image[1]["#text"],
                    playcount: json.topalbums.album[i].playcount
                });
            }

            var myTableDiv = document.getElementById("artistTopAlbums");
            var table = document.createElement('TABLE');
            table.setAttribute("align", "center");
            table.setAttribute("align", "center");
            table.createCaption().innerHTML = "<h2> \"" + document.getElementById("form-input").value + "'s\" Top Albums </h2>";
            var tableBody = document.createElement('TBODY');

            table.border = '1';
            table.appendChild(tableBody);


            var heading = new Array();
            heading[0] = "Album Rank"
            heading[1] = "Albums";
            heading[2] = "Details";

            //TABLE COLUMNS
            var tr = document.createElement('TR');
            tableBody.appendChild(tr);
            for (i = 0; i < heading.length; i++) {
                var th = document.createElement('TH')
                th.width = '75';
                th.appendChild(document.createTextNode(heading[i]));
                tr.appendChild(th);
            }
            //TABLE ROWS
            for (var i = 0; i < topAlbumsArray.length; i++) {
                var tr = document.createElement('TR');
                for (var j = 0; j < 3; j++) {
                    var td = document.createElement('TD');
                    if (j == 0) {
                        var rank = i + 1;
                        td.appendChild(document.createTextNode(rank.toString()));
                        tr.appendChild(td);
                    } else if (j == 1) {
                        //td.appendChild(document.createTextNode(topAlbumsArray[i].imageurl));
                        var image = document.createElement("IMG");
                        image.setAttribute("id", i.toString());
                        image.setAttribute("src", topAlbumsArray[i].imageurl);
                        td.appendChild(image);
                        tr.appendChild(td);
                    } else {
                        td.appendChild(document.createTextNode("Name: " + topAlbumsArray[i].name));
                        td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode("Playcount: " + topAlbumsArray[i].playcount));
                        td.appendChild(document.createElement("br"));
                        var href = document.createElement("A");
                        var linkText = document.createTextNode(topAlbumsArray[i].url);
                        href.setAttribute("href", topAlbumsArray[i].url);
                        href.setAttribute("target", "_blank");
                        href.appendChild(linkText);
                        td.appendChild(href);
                        tr.appendChild(td);
                    }
                }
                tableBody.appendChild(tr);
            }
            myTableDiv.appendChild(table);
        } else {
            alert("No TopAlbums for this artist");
            return false;
        }
    }
}

//This function displays the http response retrieved via the REST API for getching Upcoming Events 
function displayUpcomingEvents() {
    if (upcomingEventsRequest.readyState == 4) {
        var json = JSON.parse(upcomingEventsRequest.responseText);
        var str = JSON.stringify(json, undefined, 2);
        if (json.events.event.length > 0) {
            var upcomingEvents = [];
            var arrayLength = json.events.event.length;
            for (var i = 0; i < arrayLength; i++) {
                upcomingEvents.push({
                    artists: json.events.event[i].artists.artist,
                    venue: json.events.event[i].venue.name,
                    venuelocation: json.events.event[i].venue.location["geo:point"]["geo:lat"] + "," + json.events.event[i].venue.location["geo:point"]["geo:long"],
                    venuecity: json.events.event[i].venue.location.city,
                    venuecountry: json.events.event[i].venue.location.country,
                    venuestreet: json.events.event[i].venue.location.street,
                    venuepostalcode: json.events.event[i].venue.location.postalcode,
                    imageurl: json.events.event[i].venue.image[2]["#text"],
                    eventdate: json.events.event[i].startDate,
                    tags: json.events.event[i].tags.tag,
                    url: json.events.event[i].url
                })
            }


            var myTableDiv = document.getElementById("artistUpcomingEvents");
            var table = document.createElement('TABLE');
            table.setAttribute("align", "center");
            table.createCaption().innerHTML = "<h2> \"" + document.getElementById("form-input").value + "'s\" Upcoming Events </h2>";
            var tableBody = document.createElement('TBODY');

            table.border = '1';
            table.appendChild(tableBody);

            var heading = new Array();
            heading[0] = "Event Dates"
            heading[1] = "Venue";
            heading[2] = "Details";

            //TABLE COLUMNS
            var tr = document.createElement('TR');
            tableBody.appendChild(tr);
            for (i = 0; i < heading.length; i++) {
                var th = document.createElement('TH')
                th.width = '95';
                th.appendChild(document.createTextNode(heading[i]));
                tr.appendChild(th);
            }
            //TABLE ROWS
            for (var i = 0; i < upcomingEvents.length; i++) {
                var tr = document.createElement('TR');
                for (var j = 0; j < 3; j++) {
                    var td = document.createElement('TD');
                    if (j == 0) {
                        td.appendChild(document.createTextNode(upcomingEvents[i].eventdate));
                        tr.appendChild(td);
                    } else if (j == 1) {
                        var image = document.createElement("IMG");
                        image.setAttribute("id", i.toString());
                        image.setAttribute("src", upcomingEvents[i].imageurl);
                        td.appendChild(image);
                        td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode(upcomingEvents[i].venue));
                        tr.appendChild(td);
                    } else {
                        td.appendChild(document.createTextNode("Artists: " + upcomingEvents[i].artists));
                        td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode("Tags: " + upcomingEvents[i].tags));
                        td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode("Venue: " + upcomingEvents[i].venue));
                        td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode("Location Co-ordinates: " + upcomingEvents[i].venuelocation));
                        td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode("City: " + upcomingEvents[i].venuecity));
                        td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode("Street: " + upcomingEvents[i].venuestreet));
                        td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode("Country: " + upcomingEvents[i].venuecountry));
                        td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode("Postal code: " + upcomingEvents[i].venuepostalcode));
                        td.appendChild(document.createElement("br"));
                        var href = document.createElement("A");
                        var linkText = document.createTextNode(upcomingEvents[i].url);
                        href.setAttribute("href", upcomingEvents[i].url);
                        href.setAttribute("target", "_blank");
                        href.appendChild(linkText);
                        td.appendChild(href);
                        td.width = "200";
                        tr.appendChild(td);
                    }
                }
                tableBody.appendChild(tr);
            }
            myTableDiv.appendChild(table);


        } else {
            alert("No Upcoming events  for this artist");
            return false;

        }
    }
}