//get libraries required
var express = require('express');
var app = express();
var req = require('request');
var auto = require('run-auto');
var spotifyToken, categories = [], playList = [];
app.use(express.static(__dirname + '/'));//set the base directory to find resources
/*
* Function that gets initialized when navigating to base url. This function initially
* gets the token from spotify.
* @return /index.html page
*/
app.get('/', function(request, response) {
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
app.get('/getMusic', function (request, response) {
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
      request.playListId = categories[randomizer(categories.length)].playlistid;
      getPlayList(request, response, function(list) {
        callback(null, response.send(list));
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
listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
/*
* Function to get client credentials token from spotify
*/
function getToken(callback) {
  var time = new Date();
  //checks if spotifytoken if not defined and the lifetime of the token
  if (spotifyToken === undefined || spotifyToken.expires_on <= (Date.now() / 1000.0)) {
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
    //Function to make the post to spotify for the token
    auto({
      postToken: function(callback) {
        req.post(authOptions, function(error, response, body) {
          if (!error && response.statusCode === 200) {//if status 200
            spotifyToken = {token : body.access_token, expires_on : (Date.now() / 1000.0) + body.expires_in};//store token
            callback(null, spotifyToken.token);
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
* @require request.category = 'pop';
*/
function getCategories(request, response, callback) {
  //Url for request along with header
  var searchInfo = {
    url: 'https://api.spotify.com/v1/browse/categories/' + request.query.category + '/playlists',
    headers: {
      'Authorization': 'Bearer ' + spotifyToken.token
    }
  };
  //Function to get a categories list of specific genre
  auto({
    getCat: function(callback) {
      req.get(searchInfo, function(error, response, body) {
        if (!error && response.statusCode === 200) {//if status 200
          categories = JSON.parse(body);
          //Filter lists with less than 50 tracks
          categories = categories.playlists.items.filter(function(item) {
            if (item.tracks.total > 50)//minimum number of songs needed for quiz with space for null values
              return item;
          })
          //return object with needed data
          .map(function(obj) {
              var temp = {playlistName: obj.name, playlistid: obj.id};
              return temp;
            });
          callback(null, categories);
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
* @return response.playlist
*/
function getPlayList(request, response, callback) {
  //URL and header
  var searchInfo = {
    url: 'https://api.spotify.com/v1/users/spotify/playlists/' + request.playListId,
    headers: {
      'Authorization': 'Bearer ' + spotifyToken.token
    }
  };
  //Function to get the list of music
  auto({
    getlist: function(callback) {
      req.get(searchInfo, function(error, response, body) {
        if (!error && response.statusCode === 200) {//if status 200
           playList = JSON.parse(body);
           //filter out items with null values
           playList = playList.tracks.items.filter(function(item) {
             //ensure all values are not null
             if (item.track.name && item.track.preview_url && item.track.artists[0].name && item.track.album.images[1].url){
               return item;
             }
           })
           //create map of information needed
           .map(function(item) {
             var temp = {songName: item.track.name, songUrl: item.track.preview_url, songArtist: item.track.artists[0].name,
             album: item.track.album.images[1].url};
             return temp;
           });
           callback(null, playList);
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
* @require request.songName = 'Same Old Love';request.songArtist = 'Selena Gomez';
* @return lyrics
*/
function getLyrics(request, response, callback) {

  var searchInfo = {
    url: 'http://api.musixmatch.com/ws/1.1/matcher.lyrics.get?apikey=' + process.env.apikey + '&q_track=' + request.query.songName + '&q_artist=' + request.query.songArtist
  };
  auto({
    getLyrics: function(callback){
        req.get(searchInfo, function(error, response, body) {
          lyrics = JSON.parse(body);
          callback(null, lyrics.message.body.lyrics.lyrics_body);
        });
    }
  }, function(err, results) {
    console.log('err = ', err);
    console.log('results = ', results);
    callback(results);
});
}
