var socket = io.connect();
var map, heatmap;
var markersArray = [];
var sentimentMarkers = [];
var newTweet;
var positiveNum = 0;
var negativeNum = 0;
var neutralNum = 0;
var limitTweetsTable = 100;
var limitMarkers = 1000;
var mapType = 1;
var gameArray = new google.maps.MVCArray();
var sportArray = new google.maps.MVCArray();
var foodArray = new google.maps.MVCArray();
var theArray = new google.maps.MVCArray();
var musicArray = new google.maps.MVCArray();
var isArray = new google.maps.MVCArray();
var areArray = new google.maps.MVCArray();
var youArray = new google.maps.MVCArray();
var gameMarkers = [];
var sportMarkers = [];
var foodMarkers = [];
var theMarkers = [];
var musicMarkers = [];
var isMarkers = [];
var areMarkers = [];
var youMarkers = [];
var selectedWord = "the";
var geoTweetNum = 0;
var markerCluster;
var clickFlag = true;
var selectedCity = "Worldwide";

jQuery(function ($) {

    handleResetUiButton();
    changeKeyword();
    changeMaptype();
    changeTrends();
    showCluster();
    initialize();

    var tweetsWithGeoTable = $("#geotweetstable").find('tbody');

    socket.on('tweets', function (data) {
        if(data.text.toLowerCase().indexOf(selectedWord.toLowerCase()) !== -1) {
            var mood = data.sentiment;
            if (mood == 'positive') {
                updatePositiveTweets();
            } else if (mood == 'neutral') {
                updateNeutralTweets();
            } else if (mood == 'negative') {
                updateNegativeTweets();
            }
            
            if(data.geo){
                // add it to the table
                var aTweet = '<tr><td width="30%"><img src="'+data.profileimg+'" class="img-rounded"><br><span>' +data.username+ '</span><br><a style="font-size: 80%" href="https://twitter.com/' +data.user+'" target="_blank" >@' + data.user + '</a>' + '</td><td width="70%">' + data.text + '</td></tr>';
                tweetsWithGeoTable.prepend(aTweet);

                geoTweetNum++;
                newTweet = new google.maps.LatLng(data.latitude, data.longitude);
                // Add a marker to the map
                addMarker(data.latitude,data.longitude,data.user,data.text, mood);         
                // Check table limit
                if(geoTweetNum >= limitTweetsTable){ // table limit
                    removeTableRow($("#geotweetstable"));
                }
            } 
        }
    });

    socket.on('city', function (result) {
        $("span#1").html(result.trends[0]);
        $("span#2").html(result.trends[1]);
        $("span#3").html(result.trends[2]);
        $("span#4").html(result.trends[3]);
        $("span#5").html(result.trends[4]);
        $("span#6").html(result.trends[5]);
        $("span#7").html(result.trends[6]);
        $("span#8").html(result.trends[7]);
        $("span#9").html(result.trends[8]);
        $("span#10").html(result.trends[9]);
    })

    socket.on('dbdata', function (dbData) {

        if(mapType == 1){
            addMarker(dbData.latitude, dbData.longitude, dbData.user, dbData.text);
            
        }
        var latLng = new google.maps.LatLng(dbData.latitude, dbData.longitude);
        var marker = new google.maps.Marker({position: latLng});
        if(selectedWord == 'game') {
            gameArray.push(latLng);
            gameMarkers.push(marker);
        } else if (selectedWord == 'sport') {
            sportArray.push(latLng);
            sportMarkers.push(marker);
        } else if (selectedWord == 'food') {
            foodArray.push(latLng);
            foodMarkers.push(marker);
        } else if (selectedWord == 'music') {
            musicArray.push(latLng);
            musicMarkers.push(marker);
        } else if (selectedWord == 'the') {
            theArray.push(latLng);
            theMarkers.push(marker);
        } else if (selectedWord == 'is') {
            isArray.push(latLng);
            isMarkers.push(marker);
        } else if (selectedWord == 'are') {
            areArray.push(latLng);
            areMarkers.push(marker);
        } else if (selectedWord == 'you') {
            youArray.push(latLng);
            youMarkers.push(marker);
        }
        //pointArray.push(latLng);
        // var markerCluster = new MarkerClusterer(map markersArray);
    });
    /* */

});

function initialize() {
    /* 
     * Map setup
     */
    var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(40, 10),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
    };
    map = new google.maps.Map(document.getElementById('map'),mapOptions);
}

/**
 * Updating the global tweet counter
 *
 */
function updatePositiveTweets() {
    positiveNum = positiveNum + 1;
    $("span#positive").html(positiveNum);
}

/**
 * Updating geatagged tweets counter
 *
 */
function updateNeutralTweets() {
    neutralNum = neutralNum + 1;
    $("span#neutral").html(neutralNum);
}

/**
 * Updating  tweets counter without geotag
 *
 */
function updateNegativeTweets() {
    negativeNum = negativeNum + 1;
    $("span#negative").html(negativeNum);
}


/**
 * Adding a new marker to the map
 */
function addMarker(latitude, longitude, user, text, mood) {
    if(mapType == 1) {
        var infowindow = new google.maps.InfoWindow();
        infowindow.setContent('<a href="https://twitter.com/' +user+'" target="_blank">' + user + '</a> says: '+ '<p>'+ text+'</p>');
        var marker = new google.maps.Marker({
            map: map,
            draggable: false,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(latitude,longitude)
        });

        if(markersArray.length >= limitMarkers){
            markersArray[0].setMap(null);
            markersArray.shift();
        }
        markersArray.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });
        /*
         * for the sentiment
         */
        var image;
        if (mood == 'positive') {
            image = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        } else if (mood == 'neutral') {
            image = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        } else if (mood == 'negative') {
            image = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        }

        var infowindow = new google.maps.InfoWindow();
        infowindow.setContent('<a href="https://twitter.com/' +user+'" target="_blank">' + user + '</a> says: '+ '<p>'+ text+'</p>');
        
        var sentiment_marker = new google.maps.Marker({
            map: null,
            draggable: false,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(latitude,longitude),
            icon: image
        });

        if(sentimentMarkers.length >= limitMarkers){
            sentimentMarkers[0].setMap(null);
            sentimentMarkers.shift();
        }
        sentimentMarkers.push(sentiment_marker);
        google.maps.event.addListener(sentiment_marker, 'click', function() {
            infowindow.open(map, sentiment_marker);
        });

    } else if (mapType == 3) {
        /*
         * for the sentiment
         */
        var image;
        if (mood == 'positive') {
            image = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        } else if (mood == 'neutral') {
            image = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        } else if (mood == 'negative') {
            image = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        }

        var infowindow = new google.maps.InfoWindow();
        infowindow.setContent('<a href="https://twitter.com/' +user+'" target="_blank">' + user + '</a> says: '+ '<p>'+ text+'</p>');
        var sentiment_marker = new google.maps.Marker({
            map: map,
            draggable: false,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(latitude,longitude),
            icon: image
        });

        if(sentimentMarkers.length >= limitMarkers){
            sentimentMarkers[0].setMap(null);
            sentimentMarkers.shift();
        }
        sentimentMarkers.push(sentiment_marker);
        google.maps.event.addListener(sentiment_marker, 'click', function() {
            infowindow.open(map, sentiment_marker);
        });
        /*
         * for the normal 
         */
        var infowindow = new google.maps.InfoWindow();
        infowindow.setContent('<a href="https://twitter.com/' +user+'" target="_blank">' + user + '</a> says: '+ '<p>'+ text+'</p>');
        var marker = new google.maps.Marker({
            map: null,
            draggable: false,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(latitude,longitude)
        });

        if(markersArray.length >= limitMarkers){
            markersArray[0].setMap(null);
            markersArray.shift();
        }
        markersArray.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });       
    }
}


/**
 * Remove last table row
 */
function removeTableRow(jQtable) {
    jQtable.each(function(){
        if($('tbody', this).length > 0){
            $('tbody tr:last', this).remove();
        }else {
            $('tr:last', this).remove();
        }
    });
}

/**
 * Reseting the UI:
 */
function handleResetUiButton() {
    $("#clearMapButton").click(function (e) {
        e.preventDefault();
        // Clear the map
        if (markersArray) {
            for (i in markersArray) {
                markersArray[i].setMap(null);
            }
            markersArray.length = 0;
            positiveNum = 0;
            neutralNum = 0;
            negativeNum = 0;
            $("span#positive").html('0');
            $("span#neutral").html('0');
            $("span#negative").html('0');
        }
        // Clear the tables
        $('#geotweetstable tbody').empty();
        $('#nogeotweetstable tbody').empty();
    });
}

/*
 * Only when map is heatmap, cluster can be shown
 */
function showCluster() {
    $('#myButton').click(function (e) {
        e.preventDefault();
        if (mapType == 2) {
            if (clickFlag == true) {
                changeToCluster();
                clickFlag = false;
            } else {
                changeToHeatmap();
                clickFlag = true;
            }
            
        }
    });
}


/*
 * change trends
 */
function changeTrends() {
    $("#sel-trends").change(function (e) {
        e.preventDefault();
        selectedCity = $("#sel-trends").val();
        socket.emit('keyword', {
            keyword: selectedCity
        });
    });
}


/*
 * change keyword
 */
function changeKeyword() {
    $("#sel-keywords").change(function (e) {
        e.preventDefault();
        selectedWord = $("#sel-keywords").val();
        $("span#keycriteria").html(selectedWord);

        if (markersArray) {
            for (i in markersArray) {
                markersArray[i].setMap(null);
            }
            markersArray.length = 0;
            positiveNum = 0;
            neutralNum = 0;
            negativeNum = 0;
            $("span#positive").html('0');
            $("span#neutral").html('0');
            $("span#negative").html('0');
        }
        if (sentimentMarkers) {
            for (i in sentimentMarkers) {
                sentimentMarkers[i].setMap(null);
            }
            sentimentMarkers.length = 0;
        }
        if (mapType == 2) {
            if (selectedWord == 'the') {
                if (theMarkers.length == 0) {
                    socket.emit('keyword', {
                        keyword: selectedWord
                    });
                }
            } else if (selectedWord == 'sport') {
                if (sportMarkers.length == 0) {
                    socket.emit('keyword', {
                        keyword: selectedWord
                    });
                }
            } else if (selectedWord == 'music') {
                if (musicMarkers.length == 0) {
                    socket.emit('keyword', {
                        keyword: selectedWord
                    });
                }
            } else if (selectedWord == 'game') {
                if (gameMarkers.length == 0) {
                    socket.emit('keyword', {
                        keyword: selectedWord
                    });
                }
            } else if (selectedWord == 'food') {
                if (foodMarkers.length == 0) {
                    socket.emit('keyword', {
                        keyword: selectedWord
                    });
                }
            } else if (selectedWord == 'is') {
                if (isMarkers.length == 0) {
                    socket.emit('keyword', {
                        keyword: selectedWord
                    });
                }
            } else if (selectedWord == 'are') {
                if (areMarkers.length == 0) {
                    socket.emit('keyword', {
                        keyword: selectedWord
                    });
                }
            } else if (selectedWord == 'you') {
                if (youMarkers.length == 0) {
                    socket.emit('keyword', {
                        keyword: selectedWord
                    });
                }
            } 
            changeToHeatmap();
            clickFlag = true;
        }
    });
}

function changeMaptype() {
    $("#sel-maptype").change(function (e) {
        e.preventDefault();
        if ($("#sel-maptype").val() == 'Scatter') {
            if (mapType != 1) {
                mapType = 1;
                changeToScatter();
            }
        } else if ($("#sel-maptype").val() == 'HeatMap') {
            if (mapType != 2) {
                mapType = 2;
                if (selectedWord == 'the') {
                    if (theMarkers.length == 0) {
                        socket.emit('keyword', {
                            keyword: selectedWord
                        });
                    }
                } else if (selectedWord == 'sport') {
                    if (sportMarkers.length == 0) {
                        socket.emit('keyword', {
                            keyword: selectedWord
                        });
                    }
                } else if (selectedWord == 'music') {
                    if (musicMarkers.length == 0) {
                        socket.emit('keyword', {
                            keyword: selectedWord
                        });
                    }
                } else if (selectedWord == 'game') {
                    if (gameMarkers.length == 0) {
                        socket.emit('keyword', {
                            keyword: selectedWord
                        });
                    }
                } else if (selectedWord == 'food') {
                    if (foodMarkers.length == 0) {
                        socket.emit('keyword', {
                            keyword: selectedWord
                        });
                    }
                } else if (selectedWord == 'is') {
                    if (isMarkers.length == 0) {
                        socket.emit('keyword', {
                            keyword: selectedWord
                        });
                    }
                } else if (selectedWord == 'are') {
                    if (areMarkers.length == 0) {
                        socket.emit('keyword', {
                            keyword: selectedWord
                        });
                    }
                } else if (selectedWord == 'you') {
                    if (youMarkers.length == 0) {
                        socket.emit('keyword', {
                            keyword: selectedWord
                        });
                    }
                }
                changeToHeatmap();
            }
        } else if ($("#sel-maptype").val() == 'Sentiment') {
            if (mapType != 3) {
                mapType = 3;
                changeToSentiment();
            }
        } 
    })
}

function changeToHeatmap() {
    clearMarkers();
    clearSentimentMarkers();
    clearCluster();

    if (heatmap != null) {
        heatmap.setMap(null);
    }
    
    if(selectedWord == 'game') {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: gameArray,
        });
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
    if(selectedWord == 'sport') {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: sportArray,
        });
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
    if(selectedWord == 'food') {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: foodArray,
        });
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
    if(selectedWord == 'music') {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: musicArray,
        });
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
    if(selectedWord == 'the') {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: theArray,
        });
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
    if(selectedWord == 'is') {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: isArray,
        });
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
    if(selectedWord == 'are') {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: areArray,
        });
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
    if(selectedWord == 'you') {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: youArray,
        });
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
    // heatmap.setMap(map);
    mapType = 2;
    
}

function changeToCluster() {
    clearMarkers();
    clearSentimentMarkers();

    if (heatmap != null) {
        heatmap.setMap(null);
    }
    
    if (selectedWord == 'game') {
        markerCluster = new MarkerClusterer(map, gameMarkers);
    } else if (selectedWord == 'sport') {
        markerCluster = new MarkerClusterer(map, sportMarkers);
    } else if (selectedWord == 'food') {
        markerCluster = new MarkerClusterer(map, foodMarkers);
    } else if (selectedWord == 'music') {
        markerCluster = new MarkerClusterer(map, musicMarkers);
    } else if (selectedWord == 'the') {
        markerCluster = new MarkerClusterer(map, theMarkers);
    } else if (selectedWord == 'is') {
        markerCluster = new MarkerClusterer(map, isMarkers);
    } else if (selectedWord == 'are') {
        markerCluster = new MarkerClusterer(map, areMarkers);
    } else if (selectedWord == 'you') {
        markerCluster = new MarkerClusterer(map, youMarkers);
    }
}

function changeToScatter() {
    clearSentimentMarkers();
    clearCluster();
    if (heatmap != null) {
        heatmap.setMap(null);
    }
    showMarkers();
    mapType = 1;
}


function changeToSentiment() {
    clearMarkers();
    clearCluster();
    if (heatmap != null) {
        heatmap.setMap(null);
    }
    showSentimentMarkers();
    mapType = 3;
}

function clearMarkers() {
    if(heatmap != null) {
        heatmap.setMap(null);
    }
    for(i in markersArray) {
        markersArray[i].setMap(null);
    }
}

function showMarkers() {
    for(i in markersArray) {
        markersArray[i].setMap(map);
    }
}

function clearSentimentMarkers() {
    if(heatmap != null) {
        heatmap.setMap(null);
    }
    for(i in sentimentMarkers) {
        sentimentMarkers[i].setMap(null);
    }
}

function showSentimentMarkers() {
    for(i in sentimentMarkers) {
        sentimentMarkers[i].setMap(map);
    }
}

function clearCluster() {
    if(markerCluster != null) {
        markerCluster.clearMarkers();    
    }
}
