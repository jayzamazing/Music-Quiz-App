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
    currentGame = new newGame(songsCallBack);
    e.preventDefault();
  });
  $('#answerForm').submit();
  /*
  * Callback function for when json request comes back successfully
  */
  function songsCallBack() {
    $('.quiz .content').html(currentGame.songs.songDetails[currentGame.getCurrentQuestion()].lyrics);
    setAnswers();
  }
  function setAnswers() {
    for (i = 1; i <= 5; i++) {
      if (i === currentGame.correctAnswer) {
        $('#radio' + i).html(currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songName  + '<br>' +
          currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songName);
      } else {
        $('#radio' + i).html(currentGame.songs.otherSongDetails[i].songName + '<br>' +
          currentGame.songs.otherSongDetails[i].songArtist);
          /* increment count on bad answers */
          currentGame.setcurrentOtherQuestion();
      }
    }
  }
});
/*
* Initialize game and set game state
*/
function newGame(songsCallBack) {
  game = new Game();
  /* get list of songs and pass in call back */
  game.getSongInfo(songsCallBack);
  /* set main question number */
  game.setQuestionNumbers();
  return game;
}
/*
* Game object to store state
*/
function Game() {
  var currentQuestion = 0;
  var currentOtherQuestion = 0;
  var answeredCorrectly = 0;
  /* object to hold json query of songs */
  this.songs = [];
  /* Number that has the correct answer for current question */
  this.correctAnswer = 0;
  /* get currentQuestion */
  this.getCurrentQuestion = function() {
    return currentQuestion;
  };
  /* Increment currentQuestion */
  this.setCurrentQuestion = function() {
    currentQuestion++;
  };
  this.getansweredCorrectly = function() {
    return currentQuestion;
  };
  /* Increment currentQuestion */
  this.setansweredCorrectly = function() {
    currentQuestion++;
  };
  /* return bad question count */
  this.getcurrentOtherQuestion = function() {
    return currentOtherQuestion;
  };
  /* increment bad question count */
  this.setcurrentOtherQuestion = function() {
    currentOtherQuestion++;
  };
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
/*
* Function to get random number between 1 and 5 as the correct answer to the
* current question
*/
Game.prototype.setQuestionNumbers = function() {
  this.correctAnswer = parseInt(Math.random() * (5 - 1 + 1) + 1);
};
