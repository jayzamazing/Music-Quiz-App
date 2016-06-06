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
    function(err, results) {
    console.log('err = ', err);
    console.log('results = ', results);
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
      getCategories(request, response, results.token);
      callback(null, 'category', 'got categories');
    }]
  },
    function(err, results) {
    console.log('err = ', err);
    console.log('results = ', results);
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
    console.log('token');
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
            // console.log(spotifyToken.token);
            callback(null, spotifyToken.token);
          }
        });

      }
    },
      function(err, results) {
        console.log('err = ', err);
        console.log('results = ', results);
        return callback(results.postToken);
    });
  }
}
function getCategories(request, response, token) {
  console.log('inside categories');
  var searchInfo = {
    url: 'https://api.spotify.com/v1/browse/categories/' + request.category + '/playlists',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  req.get(searchInfo, function(error, response, body) {
    if (!error && response.statusCode === 200) {//if status 200
      categories = JSON.parse(body);
      categories = categories.playlists.items.filter(function(item) {
        if (item.tracks.total > 50)//minimum number of songs needed for quiz with space for null values
          return item;
      })
      .map(function(obj) {
          var temp = {};
          temp[obj.name] = obj.id;
          return temp;
        });
        console.log(categories);
    }
  });
  //TODO randomize and choose playlist
}
function getPlayList(request, response, next) {
  var searchInfo = {
    url: 'https://api.spotify.com/v1/users/spotify/playlists/' + request.playListId,//TODO get playlist from request
    headers: {
      'Authorization': 'Bearer ' + spotifyToken.token
    }
  };
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
         var temp = {};
         temp[item.track.name] = [item.track.preview_url,
           item.track.artists[0].name, item.track.album.images[2].url];
         return temp;
       });
       console.log(playList);
    }
  });
  next();
}
