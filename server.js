//get libraries required
var express = require('express');
var app = express();
var req = require('request');
var spotifyToken, categories = [], playList = [];
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
    spotifyToken = body.access_token;//store token
    //getCategories(spotifyToken, 'pop');
    getPlayList(spotifyToken, 'spotify', '5FJXhjdILmRA2z5bvz4nzf');
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
}
