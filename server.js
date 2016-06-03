//get libraries required
var express = require('express');
var app = express();
var req = require('request');
var spotifyToken;//store the token once authenticated
app.use('static', express.static(__dirname));//set the base directory to find resources
/*
* Function that gets initialized when navigating to base url, sends back index.html
* and gets authentication token from spotify
*/
app.get('/', function (request, response) {
  req.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {
    spotifyToken = body.access_token;
    console.log(spotifyToken);
    }
});
  response.sendFile(__dirname + '/index.html');
});


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
/*
* Start up node and listen on a specified port
*/
listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
