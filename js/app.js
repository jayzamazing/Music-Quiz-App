$(document).ready(function() {
  var currentGame;
  /*
  * game initialization once start game button is pressed
  * hide initial items and show game items
  */
  $('#startGame').submit(function(e) {
    /*  hide introduction and show game items */
    $('.status').removeClass('hide');
    $('.question').removeClass('hide');
    $('.quiz').removeClass('hide');
    $('.introduction').addClass('hide');
    $('.musicPlaceholder').addClass('musicImage');
    $('.titleScreen h1').addClass('titleAnimation');
    /* initialize game  */
    currentGame = new newGame();
    /* get list of songs and pass in call back */
    currentGame.getSongInfo(songsCallBack);
    e.preventDefault();
  });
  $('#answerForm').submit();
  /*
  * Callback function for when json request comes back successfully
  */
  function songsCallBack() {
    $('.quiz .content').html(currentGame.songs.songDetails[0].lyrics);
  }
});
/*
* Initialize game and set game state
*/
function newGame() {
  return new Game();
}
/*
* Game object to store state
*/
function Game() {
  var currentQuestion = 0;
  var answeredCorrectly = 0;
  /* object to hold json query of songs */
  this.songs = [];
}
/*
* Function to get song data from json
*/
Game.prototype.getSongInfo = function(callback) {
  var context = this;
  $.getJSON("data/songs.json", "context", function(data) {
    context.songs = data;
  }).complete(function() {
    callback();
  });
};
