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
  /*
  * Function to set the status bar, green is passed, red otherwise
  */
  $('#answerForm').submit(function(e) {
    currentGame.setCurrentQuestion();
    var music = currentGame.getStatus() + 1;
    var arrow = music + 1;
    //if item checked matches the correct answer for the question
    if ($("input[name=radios]:checked").val() == currentGame.correctAnswer) {
      $('.status li:nth-child(' + music + ')').find('i').css('color', 'green');
      $('.titleother').html('<h1>Correct!</h1>');
      $('.titleother h1').css('color', 'green');
      $('.titleother').removeClass('hide');
    } else {
      $('.status li:nth-child(' + music + ')').find('i').css('color', 'red');
      $('.titleother').html('<h1>Incorrect!</h1>').css('color', 'red');
      $('.titleother h1').css('color', 'red');
      $('.titleother').removeClass('hide');
    }
    $('.status li:nth-child(' + arrow + ')').find('i').css('color', 'blue');
    //disable the submit
    $('#button6').addClass('hide');
    //hide next if there are no more questions
    if (currentGame.getCurrentQuestion() != 5) {
      $('.next').removeClass('hide');
    }
    currentGame.setStatus();
    e.preventDefault();
  });
  /*
  * Function to load the next set of lyrics and music artists
  */
  $('.next').click(function() {
    /* set main question number */
    game.setQuestionNumbers();
    //show the items on the screen
    setAnswers();
    $('.next').addClass('hide');
    $('#button6').removeClass('hide');
    $('.titleother').addClass('hide');
    stopMusic('#music');
    $('.playbutton').find('i').attr("class", "fa fa-play-circle fa-2x");
    $('.playbutton').find('i').css("color", "green");
  });
  /*
  * Function to play and stop music. Also changes the play button picture and color.
  */
  $('.playbutton').click(function() {
    if ($('#music').get(0).paused === true) {
      playMusic('#music');
      $('.playbutton').find('i').attr("class", "fa fa-stop-circle-o fa-2x");
      $('.playbutton').find('i').css("color", "red");
    } else {
      stopMusic('#music');
      $('.playbutton').find('i').attr("class", "fa fa-play-circle fa-2x");
      $('.playbutton').find('i').css("color", "green");
    }
  });
  /*
  * Callback function for when json request comes back successfully
  */
  function songsCallBack() {
    setAnswers();
  }
  function setAnswers() {
    $('.quiz .content').html(currentGame.songs.songDetails[currentGame.getCurrentQuestion()].lyrics);
    for (i = 1; i <= 5; i++) {
      if (i === currentGame.correctAnswer) {
        $('#radio' + i).html(currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songName  + '<br>' +
          currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songArtist);
      } else {
        $('#radio' + i).html(currentGame.songs.otherSongDetails[currentGame.getcurrentOtherQuestion()].songName + '<br>' +
          currentGame.songs.otherSongDetails[currentGame.getcurrentOtherQuestion()].songArtist);
          /* increment count on bad answers */
          currentGame.setcurrentOtherQuestion();
      }
    }
    $('#music').attr('src', currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songUrl);
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
  var status = 0;
  /* object to hold json query of songs */
  this.songs = [];
  /* Number that has the correct answer for current question */
  this.correctAnswer = 0;
  /* get status number */
  this.getStatus = function() {
    return status;
  };
  /* set status + 2 (elements controlled) */
  this.setStatus = function() {
    status += 2;
  };
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
/*
* Function to play music
*/
function playMusic (music) {
  $(music)[0].volume = 0.5;
  $(music)[0].load();
  $(music)[0].play();
}
/*
* Function to stop music
*/
function stopMusic (music) {
  $(music)[0].pause();
}
