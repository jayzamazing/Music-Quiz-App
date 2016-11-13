//get libraries required
var SpotifyWebApi = require('spotify-web-api-node');
var express = require('express');
var app = express();
var req = require('request');
var auto = require('run-auto');
var tokenExpiration = 0;
var tries = 0;

app.use(express.static(__dirname + '/')); //set the base directory to find resources
var spotifyApi = new SpotifyWebApi({ //instantiate and set credentials for spotifywebapi
    clientId: process.env.client_id,
    clientSecret: process.env.client_secret
});
/*
 * Function to set the first page to load
 */
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});
/*
 * Function that gets initialized when navigating to base url. This function initially
 * gets the token from spotify.
 * @return /index.html page
 */
app.get('/getToken', function(request, response) {
    auto({
            //get credentials
            token: function(callback) {
                console.log('trying to get token');
                getToken(callback); //get token from spotify
            }
        },
        function(err, results) {
            tries = 0; //reset to 0
            console.log('err = ', err);
            console.log('results = ', results);
            //send 500 if there was an issue with the request
            if (results.token === null) {
                response.statusCode = 500;
                response.setHeader('Content-Type', 'application/json');
                response.send(results);
            } else { //send 200 if the request was good
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.send(results);
            }
        }
    );
});
/*
 * Function that gets called when /getMusic is called. Initially tries to get token,
 * calls category, and finally playlist.
 * @return playlist
 */
app.get('/getMusic', function(request, response) {
    auto({
            //get credentials
            token: function(callback) {
                console.log('trying to get token');
                getToken(callback); //get token from spotify
            },
            //get categories
            category: ['token', function(results, callback) {
                console.log('trying to get categories');
                getCategories(request, response, callback);
            }],
            /*
             * Function to get the playlist using a playListId
             * @require request.playListId = '5FJXhjdILmRA2z5bvz4nzf';
             */
            playlist: ['token', 'category', function(results, callback) {
                console.log('trying to get playlist');
                getList(request, response, callback, results);
            }]
        },
        function(err, results) {
            tries = 0; //reset to 9
            console.log('err = ', err);
            console.log('results = ', results);
            if (results.token === null) { //send 500 if there was an issue with the request
                response.statusCode = 500;
                response.setHeader('Content-Type', 'application/json');
                response.send(results.playlist);
            } else { //send 200 if the request was good
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.send(results.playlist);
            }
        });
});
/*
 * Function to get the lyrics from musixmatch.
 * @param request
 * @param response
 * @return lyrics
 */
app.get('/getLyrics', function(request, response) {
    auto({
            lyrics: function(callback) {
                console.log('trying to get lyrics');
                getLyrics(request, response, callback); //grab lyrics from musix
            }
        },
        function(err, results) {
            console.log('err = ', err);
            console.log('results = ', results);
            if (results.lyrics === null) {
                tries = 0;//reset to 0
                response.statusCode = 500;//send 500 if request was bad
                response.setHeader('Content-Type', 'application/json');
                response.send(results);
            } else {
                response.statusCode = 200;//send 200 if request was good
                response.setHeader('Content-Type', 'application/json');
                response.send(results);
            }
        });
});
/*
 * Start up node and listen on a specified port
 */
listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});
listener.timeout = 5000;//limit sockets to 5 seconds
/*
 * Function to get client credentials token from spotify
 * @param callback - status message
 */
function getToken(callback) {
    if (tokenExpiration <= (Date.now() / 1000.0)) {
        var options = {};
        //request to get token from spotify
        spotifyApi.clientCredentialsGrant(options, function(err, data) {
            if (err) {
                if (tries < 3) {//only try 3 times including initial request
                    tries++;//increment tries
                    getToken(callback);//recursive call to try again
                } else {
                    callback(err, null);//if tries failed, return error
                }
            }
            spotifyApi.setAccessToken(data.body.access_token); //store token locally
            tokenExpiration = (Date.now() / 1000.0) + data.body.expires_in;//set the expiration on the token
            callback(null, 'have token');
        });
    } else {
        callback(null, 'already have token');
    }
}
/*
 * Function to get the categories from the spotify server
 * @require request.query.category = 'pop';
 * @param callback - returns categories
 */
function getCategories(request, response, callback) {
    var options = {};
    //get playlist from spotify
    spotifyApi.getPlaylistsForCategory(request.query.category, options, function(err, data) {
        if (err) {
            if (tries < 3) {//only try 3 total times
                tries++;//increment tries
                getCategories(request, response, callback, results);//recursive call
            } else {
                callback(err, null);
            }
        }
        //filter list
        var filteredCategories = data.body.playlists.items.filter(function(item) {
                if (item.tracks.total > 50) //minimum number of songs needed for quiz with space for null values
                    return item;
            }) //return object with needed data
            .map(function(obj) {
                //creates object with name and list id's
                var temp = {
                    playlistName: obj.name,
                    playlistid: obj.id
                };
                return temp;
            });
        callback(null, filteredCategories);
    });
}
/*
* Function to get the playlist from spotify.
* @param request
* @param response
* @param callback
* @param results
* @return {songDetails}
*/
function getList(request, response, callback, results) {
    var list = results.category[randomizer(results.category.length)];
    //items to get from spotify call
    var options = {
        'fields': 'tracks.items.track.name,' +
            'tracks.items.track.preview_url,' +
            'tracks.items.track.artists,' +
            'tracks.items.track.album.images'
    };
    //get the specified playlist using options as filter
    spotifyApi.getPlaylist('spotify', list.playlistid,
        options,
        function(err, data) {
            if (err) {
                delete results.category[list.playlistName];//delete list so we don't try to use the same list again
                if (tries < 5) {//limit to 5 total tries
                    tries++;//increment tries
                    getList(request, response, callback, results);//recursive call
                } else {
                    callback(err, null);
                }
            }
            //sort list in random order
            var playList = sortList(data.body.tracks.items);
            //filter playlist
            playList = playList.filter(function(item) {
                    try {
                        //ensure all values are not null
                        if (item.track.name && item.track.preview_url &&
                            Array.isArray(item.track.artists) &&
                            Array.isArray(item.track.album.images) &&
                            item.track.artists[0].name) {
                            return item;
                        }
                    } catch (e) {
                        console.log('value undefined');
                    }
                })
                //create map of information needed
                .map(function(item, index) {
                    var temp;
                    //make object with certain names for access in app.js
                    temp = JSON.stringify({
                        songName: item.track.name,
                        songUrl: item.track.preview_url,
                        songArtist: item.track.artists[0].name,
                        album: item.track.album.images[1].url
                    });
                    return temp;
                });
            //filter out first 15 playlist objects and set as songdetails
            var songDetails = JSON.parse('{"songDetails": [' + playList.filter(function(item, index) {
                if (index <= 15) {
                    return item;
                }
            }) + ']}');
            //filter out playlist between 15 and 50 and set as othersongdetails
            var otherSongDetails = JSON.parse('{"otherSongDetails": [' + playList.filter(function(item, index) {
                if (index > 15 && index <= 50) {
                    return item;
                }
            }) + ']}');
            //join the two lists into one json object to return
            for (var key in otherSongDetails) {
                if (otherSongDetails.hasOwnProperty(key))
                    songDetails[key] = otherSongDetails[key];
            }
            callback(null, songDetails);
        });
}

/*
 * Function to get lyrics from Musix Api.
 * @param callback - returns lyrics
 * @require request.query.songName = 'Same Old Love';request.query.songArtist = 'Selena Gomez';
 * To test for copyright failure use the following:
 * @require request.query.songName = 'Just A Friend'; request.query.songArtist = 'Biz Markie';
 */
 function getLyrics(request, response, callback) {
     var searchInfo = { //set songname and artist to search for
         url: 'http://api.musixmatch.com/ws/1.1/matcher.lyrics.get?apikey=' + process.env.apikey + '&q_track=' + request.query.songName + '&q_artist=' + request.query.songArtist
     };
     req.get(searchInfo, function(error, response, body) {
       if (error || !response.statusCode === 200) {
         if (tries < 2) {
             tries++;//increment tries
             console.log(tries);
             getLyrics(request, response, callback);//recursive call
         } else {
           if (error) {
             callback(err, null);
           } else {
             callback('could not get lyrics', null);
           }
         }
       }
       lyrics = JSON.parse(body);
       if (lyrics.message.header.status_code === 200 && lyrics.message.body.lyrics &&
         lyrics.message.body.lyrics.lyrics_body && lyrics.message.body.lyrics.lyrics_body !== '') {
         lyrics = lyrics.message.body.lyrics.lyrics_body;
         callback(null, lyrics);
       } else {
             callback('could not get lyrics', null);
       }
     });
 }
/*
 *Function to get random number
 * @param number
 * @return random number
 */
function randomizer(number) {
    return parseInt(Math.random() * (number));
}
/*
 * Function to randomize playlist
 * @param playList
 * @return - sorted list
 */
function sortList(playList) {
    //randomize list
    for (var j, k, i = playList.length; i; j = Math.floor(Math.random() * i), k = playList[--i], playList[i] = playList[j], playList[j] = k);
    return playList;
}
