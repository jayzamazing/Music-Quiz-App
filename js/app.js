$(document).ready(function() {
  var currentGame = newGame();
  currentGame.getSongInfo();
  var data;
  $('#startGame').submit(function(e) {
    $('.status').removeClass('hide');
    $('.question').removeClass('hide');
    $('.quiz').removeClass('hide');
    $('.introduction').addClass('hide');
    $('.musicPlaceholder').addClass('musicImage');
    $('.titleScreen h1').addClass('titleAnimation');
    $('.quiz .content').html(currentGame.songs.songDetails[0].lyrics);
    e.preventDefault();
  });
  $('#answerForm').submit();
});
function newGame() {
  return new Game();
}
function Game() {
  var currentQuestion = 0;
  var answeredCorrectly = 0;
  this.songs = [];
}
Game.prototype.getSongInfo = function() {
  var context = this;
  $.getJSON("data/songs.json", "context", function(data) {
    context.songs = data;
  });
};
