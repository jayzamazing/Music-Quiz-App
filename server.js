//get libraries required
var SpotifyWebApi = require('spotify-web-api-node');
var express = require('express');
var app = express();
var req = require('request');
var auto = require('run-auto');
var tokenExpiration = 0;
//set user token for musicmatch api
var music = require('musicmatch')({
    usertoken: process.env.apikey,
    format: 'json',
    appid: 'community-app-v1.0'
});

app.use(express.static(__dirname + '/')); //set the base directory to find resources
var spotifyApi = new SpotifyWebApi({ //instantiate and set credentials for spotifywebapi
    clientId: process.env.client_id,
    clientSecret: process.env.client_secret
});
/*
 * Function that gets initialized when navigating to base url. This function initially
 * gets the token from spotify.
 * @return /index.html page
 */
app.get('/index', function(request, response) {
    auto({
            //get credentials
            token: function(callback) {
                console.log('trying to get token');
                getToken(callback);//get token from spotify
            }
        },
        function(err, results) {
            console.log('err = ', err);
            console.log('results = ', results);
            response.sendFile(__dirname + '/index.html');
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
                getToken(callback);//get token from spotify
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
                console.log(results.category);
                getPlayList(request, response, callback, results.category);
            }]
        },
        function(err, results) {
            console.log('err = ', err);
            console.log('results = ', results);
            response.send(results.playlist);
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
                getLyrics(request, response, callback);//grab lyrics from musix
            }
        },
        function(err, results) {
            console.log('err = ', err);
            console.log('results = ', results);
            response.send(results.lyrics);
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
* @param callback - status message
*/
function getToken(callback) {
  var tries = 0;
  auto({
    token: function(callback) {
      if (tokenExpiration === undefined || tokenExpiration <= (Date.now() / 1000.0)) {
        var options = {};
        //request to get token from spotify
        spotifyApi.clientCredentialsGrant(options, function(err, data) {
            spotifyApi.setAccessToken(data.body.access_token); //store token locally
            if (err && tries <= 3) {//retry query 3 times
              tries++;
              getToken(callback);
            }
            callback(err, 'have token');//resurcive call to try again
        });
      } else {
        callback(null, 'already have token');
      }
    }
  },
  function(err, results) {
      console.log('err = ', err);
      console.log('results = ', results);
      callback(err, results);
  });
}
/*
 * Function to get the categories from the spotify server
 * @require request.query.category = 'pop';
 * @param callback - returns categories
 */
function getCategories(request, response, callback) {
  var tries = 0;
  auto({
    category: function(callback) {
      var options = {};
      //get playlist from spotify
      spotifyApi.getPlaylistsForCategory(request.query.category, options, function(err, data) {
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
              if (err && tries <= 3) {//retry query 3 times
                tries++;
                getCategories(callback);//resurcive call to try again
              }
          callback(err, filteredCategories);
      });
    }
  },
  function(err, results) {
      console.log('err = ', err);
      console.log('results = ', results);
      callback(err, results);
  });
}
function getPlayList(request, response, callback, results) {
  auto({
    playList: function(callback) {
      //items to get from spotify call
      var options = {
          'fields': 'tracks.items.track.name,' +
              'tracks.items.track.preview_url,' +
              'tracks.items.track.artists,' +
              'tracks.items.track.album.images'
      };
      //get the specified playlist using options as filter
      spotifyApi.getPlaylist('spotify', results.category[randomizer(results.category.length)].playlistid,
          options,
          function(err, data) {
            //sort list in random order
              var playList = sortList(data.body.tracks.items);
              //filter playlist
              playList = playList.filter(function(item) {
                      try {
                          //ensure all values are not null
                          if (item.track.name && item.track.preview_url && item.track.artists && item.track.album.images) {
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
              //filter out first 5 playlist objects and set as songdetails
              var songDetails = JSON.parse('{"songDetails": [' + playList.filter(function(item, index) {
                  if (index <= 5) {
                      return item;
                  }
              }) + ']}');
              //filter out playlist between 5 and 25 and set as othersongdetails
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
              if (err && tries <= 3) {//retry query 3 times
                tries++;
                getPlayList(callback);//resurcive call to try again
              }
              callback(err, songDetails);
          });
    }
  },
  function(err, results) {
      console.log('err = ', err);
      console.log('results = ', results);
      callback(err, results.playList);
  });
}

/*
* Function to get lyrics from Musix Api.
*@param callback - returns lyrics
*@require request.query.songName = 'Same Old Love';request.query.songArtist = 'Selena Gomez';
*/
function getLyrics(request, response, callback) {
  var tries = 0;
  auto({
    lyrics: function(callback) {
      //set songname and artist to search for and then perform query for lyrics
      music.matcherLyrics({
              q_track: request.query.songName,
              q_artist: request.query.songArtist
          })
          .then(function(data) {
              //take the lyrics and shorten to a max of 160 characters
              lyrics = data.message.body.lyrics.lyrics_body;
              lyrics = lyrics.substr(0, 160);
              //ensure last word is not cut in half
              lyrics = lyrics.substr(0, Math.min(160, lyrics.lastIndexOf(" ")));
              console.log(lyrics);
              callback(null, lyrics);
          })
          .catch(function(err) {
            if (tries <= 3) {//retry query 3 times
              tries++;
              getLyrics(callback);//resurcive call to try again
            }
            callback(err, null);//return error
          });
    }
  },
  function(err, results) {
      console.log('err = ', err);
      console.log('results = ', results);
      console.log(results.lyric);
      callback(err, results.lyrics);
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
