$(document).ready(function() {
  var currentGame;
  $('#startGame').submit(function(e) {
    $('.status').removeClass('hide');
    $('.question').removeClass('hide');
    $('.quiz').removeClass('hide');
    $('.introduction').addClass('hide');
    $('.musicPlaceholder').addClass('musicImage');
    $('.titleScreen h1').addClass('titleAnimation');
    currentGame = newGame();
    e.preventDefault();
  });
  $('#answerForm').submit();
});
function newGame() {
  return new game();
}
function game() {
  var currentQuestion = 0;
  var answeredCorrectly = 0;
}
