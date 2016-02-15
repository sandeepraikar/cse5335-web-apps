// Name : Sandeep N Raikar
// UTA ID : 1001103332 
// Put your zillow.com API key here
var zwsid = "X1-ZWz1dww26mecjv_a57uf";

var request = new XMLHttpRequest();

var map;
var icon;
var geocoder;
var address = "";
var amount;
var propertyAddress;
var markers = [];
var flag = 0;
var currentAddress;

function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(32.75, -97.13),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('googleMapLayout'), mapOptions);

    //Creating SVG marker icon
    icon = {
        path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
        //fillColor: '#00bf00',
        fillColor: '#0000ff',
        fillOpacity: .6,
        anchor: new google.maps.Point(0, 0),
        strokeWeight: 0,
        scale: 0.3
    }

    //Sample Zillow Property Location co-ordinates
    var propertyCoordinatesArray = [
        [32.751517, -97.13122],
        [32.752592, -97.128943],
        [32.753641, -97.131985],
        [32.746363, -97.125115],
        [32.753811, -97.126209]
    ];
    
    //Place all the marker icons on the map
    var sampleMarker = [];
    for (var k = 0; k < propertyCoordinatesArray.length; k++) {
        sampleMarker[k] = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(propertyCoordinatesArray[k][0], propertyCoordinatesArray[k][1]),
            icon: icon, //places the SVG icon on the Google Map
            zIndex: -20
        });

        google.maps.event.addListener(sampleMarker[k], 'click', function(event) {
            findProperty(event.latLng);
        });
    }

    google.maps.event.addListener(map, 'click', function(event) {
        findProperty(event.latLng);
    });
}

//google.maps.event.addDomListener(window, 'load', initialize);
function xml_to_string(xml_node) {
    if (xml_node.xml)
        return xml_node.xml;
    var xml_serializer = new XMLSerializer();
    return xml_serializer.serializeToString(xml_node);
}

function displayResult() {
    if (request.readyState == 4) {
        var xml = request.responseXML.documentElement;
        if (xml.getElementsByTagName("code")[0].childNodes[0].nodeValue == 0) {
            var myDiv = document.getElementById("description");
            var responseArray = [];
            responseArray.push({
                street: xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("street")[0],
                city: xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("city")[0],
                state: xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("state")[0],
                zipcode: xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("zipcode")[0],
                amount: xml.getElementsByTagName("zestimate")[0].getElementsByTagName("amount")[0],
                latitude: xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("latitude")[0],
                longitude: xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("longitude")[0],
            });
            var propertyStreet = document.createElement("SPAN");
            propertyStreet.setAttribute("id", "street");
            propertyStreet.innerHTML = "Address : " + xml_to_string(responseArray[0].street);
            myDiv.appendChild(propertyStreet);

            var propertyCity = document.createElement("SPAN");
            propertyCity.setAttribute("id", "city");
            propertyCity.innerHTML = ", " + xml_to_string(responseArray[0].city);
            myDiv.appendChild(propertyCity);

            var propertyState = document.createElement("SPAN");
            propertyState.setAttribute("id", "state");
            propertyState.innerHTML = ", " + xml_to_string(responseArray[0].state);
            myDiv.appendChild(propertyState);

            var propertyZipCode = document.createElement("SPAN");
            propertyZipCode.setAttribute("id", "zipCode");
            propertyZipCode.innerHTML = " " + xml_to_string(responseArray[0].zipcode);
            myDiv.appendChild(propertyZipCode);

            myDiv.appendChild(document.createElement("br"));
            var propertyAmount = document.createElement("SPAN");
	    propertyAmount.setAttribute("id", "amount");
            if(propertyAmount.length>0){
            	propertyAmount.innerHTML = "Property Amount : $" + xml_to_string(responseArray[0].amount);
            }else{
            	propertyAmount.innerHTML = "Property Amount : $" +0;
	    }
	    myDiv.appendChild(propertyAmount);

            myDiv.appendChild(document.createElement("br"));
            var propertyLatitude = document.createElement("SPAN");
            propertyLatitude.setAttribute("id", "latitude");
            propertyLatitude.innerHTML = "Location : " + xml_to_string(responseArray[0].latitude);
            myDiv.appendChild(propertyLatitude);

            var propertyLongitude = document.createElement("SPAN");
            propertyLongitude.setAttribute("id", "longitude");
            propertyLongitude.innerHTML = ", " + xml_to_string(responseArray[0].longitude);
            myDiv.appendChild(propertyLongitude);
            myDiv.appendChild(document.createElement("br"));
            myDiv.appendChild(document.createElement("br"));

            //amount = xml.getElementsByTagName("zestimate")[0].getElementsByTagName("amount")[0].childNodes[0].nodeValue;
            var checkIfNodeValueExists =  xml.getElementsByTagName("zestimate")[0].getElementsByTagName("amount")[0];
	    if(checkIfNodeValueExists && checkIfNodeValueExists.childNodes.length>0){
	    	amount=checkIfNodeValueExists.childNodes[0].nodeValue;
            }else{
		alert("Response retrieved from Zillow WebService,<zestimate><amount currency=USD></amount> does not have the amount!!\nSo setting the amount to $0");
		amount=0;
	    }
	    propertyAddress = xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("street")[0].childNodes[0].nodeValue + ", " + xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("city")[0].childNodes[0].nodeValue + ", " + xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("state")[0].childNodes[0].nodeValue + " " + xml.getElementsByTagName("result")[0].getElementsByTagName("address")[0].getElementsByTagName("zipcode")[0].childNodes[0].nodeValue;
            if (flag == 0) {
                drawMap(propertyAddress);
            } else {
                drawMap(currentAddress);
            }
        } else {
            alert("Sorry, the address you provided is not found in Zillow's property database.");
        }
    }
}

// Send asynchronous AJAX request via XMLHttpRequest object to Zillo API
function sendRequest(address) {
    if (address.length >= 1) {
        request.onreadystatechange = displayResult;
        var requestAttributes = formulateRequestParameters(address);
        request.open("GET", "proxy.php?zws-id=" + zwsid + "&address=" + requestAttributes[0] + "&citystatezip=" + requestAttributes[1]);
        request.withCredentials = "true";
        request.send();
    } else {
        alert("Please enter valid Address!!");
        document.getElementById("form-input").focus();
        return false;
    }
}

//This function captures the entered Address and invokes sendRequest method to make asynchronous AJAX request
function getPropertyDetails() {
    address = document.getElementById("address").value;
    sendRequest(address);
}

//This function is used to dynamically place markers on the Google Maps as well as display an info window
function drawMap(propertyAddress) {
    geocoder.geocode({
        'address': propertyAddress
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            markers.push(marker);
	    var contentString = '<div style="line-height:1.35;overflow:hidden;white-space:nowrap;"><span>' + propertyAddress + '</span><br><span>$' + amount + '</span></div>';

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            infowindow.open(map, marker);

        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

// This function is used to consturct the required request attributes for AJAX request.
function formulateRequestParameters(address) {
    var addressArray = address.split(",");

    var requestParameters = [];
    var cityStateZip;
    if (addressArray.length == 4) {
        cityStateZip = addressArray[1] + addressArray[2];
        cityStateZip.replace(/\s+/g, "");
        cityStateZip = cityStateZip.trim();
    } else if (addressArray.length == 3) {
        cityStateZip = addressArray[1] + addressArray[2];
        cityStateZip.replace(/\s+/g, "");
        cityStateZip = cityStateZip.trim();
    } else if (addressArray.length == 2) {
        cityStateZip = addressArray[1];
        cityStateZip.replace(/\s+/g, "");
        cityStateZip = cityStateZip.trim();
    } else {
        alert("Please enter valid address!!");
        return false;
    }
    var encodedAddress = encodeURI(addressArray[0]);
    requestParameters[0] = encodedAddress;
    requestParameters[1] = cityStateZip;
    return requestParameters;
}

//This function does reverse geocoding to obtain the human readable address format and redraw th location on the map.
function findProperty(location) {
    geocoder.geocode({
        'latLng': location
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0].formatted_address.length != 0) {
                flag = 1;
                currentAddress = results[0].formatted_address;
                sendRequest(results[0].formatted_address);
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });

}

// Sets the map on all markers in the array.
function setAllMap(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }
    
//This method is used to clear the div's for the next search request
function flush() {

    //Clearing the markers on the Google Map
    setAllMap(null);
    markers = [];

    //Flushing 'description' <div> container
    document.getElementById("description").innerHTML = "";
}
