$(document).ready(function() {
  $('#startGame').submit(function(e) {
    $('.status').removeClass('hide');
    $('.question').removeClass('hide');
    $('.quiz').removeClass('hide');
    $('.introduction').addClass('hide');
    $('.musicPlaceholder').addClass('musicImage');
    $('.titleScreen h1').addClass('titleAnimation');

    e.preventDefault();
  });
  $('#answerForm').submit();
});
function newGame() {}
function game() {}
