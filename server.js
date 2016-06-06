//get libraries required
var express = require('express');
var app = express();
var req = require('request');
var auto = require('run-auto');
var spotifyToken, categories = [], playList = [];
app.use('static', express.static(__dirname));//set the base directory to find resources
/*
* Function that gets initialized when navigating to base url, sends back index.html
* and gets authentication token from spotify
*/
app.get('/', function(request, response) {
  request.category = 'pop';
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
//pop, rock, rap, ???? TODO
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
      request.category = 'pop';
      getCategories(request, response, function(cat) {
        callback(null, cat);
      });
    }],
    playlist: ['token', 'category', function(results, callback) {
      console.log('trying to get playlist');
      request.playListId = categories[randomizer(categories.length)].playlistid;
      getPlayList(request, response, function(list) {
        callback(null, list);
      });
    }]
  },
    function() {
    response.sendFile(__dirname + '/index.html');
  });
});
/*
* Start up node and listen on a specified port
*/
listener = app.listen(process.env.PORT, getToken, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
/*
* Function to get client credentials token from spotify
*/
function getToken(callback) {
  var time = new Date();
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
function getCategories(request, response, callback) {
  var searchInfo = {
    url: 'https://api.spotify.com/v1/browse/categories/' + request.category + '/playlists',
    headers: {
      'Authorization': 'Bearer ' + spotifyToken.token
    }
  };
  auto({
    getCat: function(callback) {
      req.get(searchInfo, function(error, response, body) {
        if (!error && response.statusCode === 200) {//if status 200
          categories = JSON.parse(body);
          categories = categories.playlists.items.filter(function(item) {
            if (item.tracks.total > 50)//minimum number of songs needed for quiz with space for null values
              return item;
          })
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
function randomizer(number) {
  return parseInt(Math.random() * (number));
}
function getPlayList(request, response, callback) {
  var searchInfo = {
    url: 'https://api.spotify.com/v1/users/spotify/playlists/' + request.playListId,
    headers: {
      'Authorization': 'Bearer ' + spotifyToken.token
    }
  };
  auto({
    getlist: function(callback) {
      req.get(searchInfo, function(error, response, body) {
        if (!error && response.statusCode === 200) {//if status 200
           playList = JSON.parse(body);
           playList = playList.tracks.items.filter(function(item) {
             //ensure all values are not null
             if (item.track.name && item.track.preview_url && item.track.artists[0].name && item.track.album.images[2].url){
               return item;
             }
           })
           .map(function(item) {
             //var temp = {playlistName: obj.name, playlistid: obj.id};
             var temp = {trackname: item.track.name, preview_url: item.track.preview_url, artistname: item.track.artists[0].name,
             albumimage: item.track.album.images[2].url};
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
