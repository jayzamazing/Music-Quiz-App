//get libraries required
var express = require('express');
var app = express();
var req = require('request');
var auto = require('run-auto');
var spotifyToken, categories = [],
    playList = [];
app.use(express.static(__dirname + '/')); //set the base directory to find resources
/*
 * Function that gets initialized when navigating to base url. This function initially
 * gets the token from spotify.
 * @return /index.html page
 */
app.get('/index', function(request, response) {
    auto({
            token: function(callback) {
                console.log('trying to get token');
                getToken(function(token) {
                    callback(null, token);
                });
            },
        },
        function() {
            response.sendFile(__dirname + '/index.html');
        });
});
/*
 * Function that gets called when /getMusic is called. Initially tries to get token,
 * calls category, and finally playlist.
 * @return response.playlist
 */
app.get('/getMusic', function(request, response) {
    auto({
        token: function(callback) {
            console.log('trying to get token');
            getToken(function(token) {
                callback(null, token);
            });
        },
        category: ['token', function(results, callback) {
            console.log('trying to get categories');
            getCategories(request, response, function(cat) {
                callback(null, cat);
            });
        }],
        playlist: ['token', 'category', function(results, callback) {
            console.log('trying to get playlist');
            getPlayList(request, response, function(list) {
                console.log(list);
                callback(null, response.send(list.getlist));
            });
        }]
    });
});
app.get('/getLyrics', function(request, response) {
    auto({
        lyrics: function(callback) {
            console.log('trying to get lyrics');
            getLyrics(request, response, function(lyric) {
                callback(null, response.send(lyric));
            });
        }
    });
});
/*
 * Start up node and listen on a specified port
 */
listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});
/*
 * Function to get client credentials token from spotify
 */
function getToken(callback) {
    var time = new Date();
    //checks if spotifytoken if not defined and the lifetime of the token
    if (spotifyToken === undefined || spotifyToken.expires_on <= (Date.now() / 1000.0)) {
        //Function to make the post to spotify for the token
        auto({
                postToken: function(callback) {
                    spotifyToken = undefined;
                    /*
                     * Authentication options used by spotify api for client credentials work flow
                     */
                    var authOptions = {
                        url: 'https://accounts.spotify.com/api/token',
                        headers: {
                            'Authorization': 'Basic ' + (new Buffer(process.env.client_id + ':' + process.env.client_secret).toString('base64'))
                        },
                        form: {
                            grant_type: 'client_credentials'
                        },
                        json: true
                    };
                    req.post(authOptions, function(error, response, body) {
                        if (!error && response.statusCode === 200) { //if status 200
                            spotifyToken = {
                                token: body.access_token,
                                expires_on: (Date.now() / 1000.0) + body.expires_in
                            }; //store token
                            callback(null, spotifyToken.token);
                        } else { //if failure, try again
                            getToken(callback);
                        }
                    });
                }
            },
            function(err, results) {
                console.log('err = ', err);
                console.log('results = ', results);
                callback(results);
            });
    } else {
        //Function that returns if we already have a token
        auto({
                haveToken: function(callback) {
                    callback(null, spotifyToken.token);
                }
            },
            function(err, results) {
                console.log('err = ', err);
                console.log('results = ', results);
                callback(results);
            });
    }
}
/*
 * Function to get the categories from the spotify server
 * @require request.query.category = 'pop';
 */
function getCategories(request, response, callback) {
    //Function to get a categories list of specific genre
    auto({
            getCat: function(callback) {
                //Url for request along with header
                var searchInfo = {
                    url: 'https://api.spotify.com/v1/browse/categories/' + request.query.category + '/playlists',
                    headers: {
                        'Authorization': 'Bearer ' + spotifyToken.token
                    }
                };
                req.get(searchInfo, function(error, response, body) {
                    if (!error && response.statusCode === 200) { //if status 200
                        categories = JSON.parse(body);
                        //Filter lists with less than 50 tracks
                        categories = categories.playlists.items.filter(function(item) {
                                if (item.tracks.total > 50) //minimum number of songs needed for quiz with space for null values
                                    return item;
                            })
                            //return object with needed data
                            .map(function(obj) {
                                var temp = {
                                    playlistName: obj.name,
                                    playlistid: obj.id
                                };
                                return temp;
                            });
                        callback(null, categories);
                    } else { //otherwise, try again
                      console.log('bad server response, calling getCategories');
                      getCategories(request, response, callback);
                    }
                });
            }
        },
        function(err, results) {
            console.log('err = ', err);
            console.log('results = ', results);
            callback(results);
        });
}
//Function to get random number
function randomizer(number) {
    return parseInt(Math.random() * (number));
}
/*
 * Function to get the playlist using a playListId
 * @require request.playListId = '5FJXhjdILmRA2z5bvz4nzf';
 */
function getPlayList(request, response, callback) {
    //Function to get the list of music
    auto({
            getlist: function(callback) {
                request.playListId = categories[randomizer(categories.length)].playlistid;
                //URL and header
                var searchInfo = {
                    url: 'https://api.spotify.com/v1/users/spotify/playlists/' + request.playListId,
                    headers: {
                        'Authorization': 'Bearer ' + spotifyToken.token
                    }
                };
                req.get(searchInfo, function(error, response, body) {
                    if (!error && response.statusCode === 200) { //if status 200
                        playList = JSON.parse(body);
                        //randomize list
                        for (var j, k, i = playList.length; i; j = Math.floor(Math.random() * i), k = playList[--i], playList[i] = playList[j], playList[j] = k);
                        //filter out items with null values
                        playList = playList.tracks.items.filter(function(item) {
                                //ensure all values are not null
                                if (item.track.name && item.track.preview_url && item.track.artists[0].name && item.track.album.images[1].url) {
                                    return item;
                                }
                            })
                            //create map of information needed
                            .map(function(item, index) {
                                var temp;
                                temp = JSON.stringify({
                                    songName: item.track.name,
                                    songUrl: item.track.preview_url,
                                    songArtist: item.track.artists[0].name,
                                    album: item.track.album.images[1].url
                                });
                                return temp;
                            });
                        var songDetails = JSON.parse('{"songDetails": [' + playList.filter(function(item, index) {
                            if (index <= 5) {
                                return item;
                            }
                        }) + ']}');
                        var otherSongDetails = JSON.parse('{"otherSongDetails": [' + playList.filter(function(item, index) {
                            if (index > 5 && index <= 25) {
                                return item;
                            }
                        }) + ']}');
                        //join the two lists into one json object to return
                        for (var key in otherSongDetails) {
                            if (otherSongDetails.hasOwnProperty(key))
                                songDetails[key] = otherSongDetails[key];
                        }
                        callback(null, songDetails);
                    } else { //otherwise try again
                      console.log('bad server response, calling getPlayList');
                      getPlayList(request, response, callback);
                    }
                });
            }
        },
        function(err, results) {
            console.log('err = ', err);
            console.log('results = ', results);
            callback(results);
        });
}
/*
 * Function to get the lyrics from musixmatch.
 * @require request.query.songName = 'Same Old Love';request.query.songArtist = 'Selena Gomez';
 * @return lyrics
 */
function getLyrics(request, response, callback) {
    var searchInfo = {
        url: 'http://api.musixmatch.com/ws/1.1/matcher.lyrics.get?apikey=' + process.env.apikey + '&q_track=' + request.query.songName + '&q_artist=' + request.query.songArtist
    };
    auto({
            getLyric: function(callback) {
                req.get(searchInfo, function(error, response, body) {
                  console.log(response.statusCode);
                  if (!error && response.statusCode === 200) {//if status 200
                    lyrics = JSON.parse(body);
                    lyrics = lyrics.message.body.lyrics.lyrics_body;
                    lyrics = lyrics.substr(0, 160);
                    lyrics = lyrics.substr(0, Math.min(160, lyrics.lastIndexOf(" ")));
                    callback(null, lyrics);
                  } else {//otherwise, try again
                    console.log('bad server response, calling getLyrics');
                    getLyrics(request, response, callback);
                  }
                });
            }
        },
        function(err, results) {
            console.log('err = ', err);
            console.log('results = ', results);
            callback(results);
        });
}
