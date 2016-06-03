//get libraries required
var express = require('express');
var app = express();
var req = require('request');
var spotifyToken, categories, playList;
app.use('static', express.static(__dirname));//set the base directory to find resources
/*
* Function that gets initialized when navigating to base url, sends back index.html
* and gets authentication token from spotify
*/
app.get('/', function (request, response) {
  getToken();
  response.sendFile(__dirname + '/index.html');
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
function getToken() {
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
  //post to spotify requesting token
  req.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {//if status 200
    //spotifyToken = body.access_token;//store token
    //getCategories(spotifyToken, 'pop');
    //getPlayList(spotifyToken, 'spotify', '5FJXhjdILmRA2z5bvz4nzf');
  }
  });
}
function getCategories(spotifyToken, category) {
  var searchInfo = {
    url: 'https://api.spotify.com/v1/browse/categories/' + category + '/playlists',
    headers: {
      'Authorization': 'Bearer ' + spotifyToken
    }
  };
  req.get(searchInfo, function(error, response, body) {
    if (!error && response.statusCode === 200) {//if status 200
      categories = body;
      console.log(categories);
    }
  });
}
function getPlayList(spotifyToken, user, playListId) {
  var searchInfo = {
    url: 'https://api.spotify.com/v1/users/' + user + '/playlists/' + playListId,
    headers: {
      'Authorization': 'Bearer ' + spotifyToken
    }
  };
  req.get(searchInfo, function(error, response, body) {
    if (!error && response.statusCode === 200) {//if status 200
       playList = body;
       console.log(playList);
    }
  });
}
