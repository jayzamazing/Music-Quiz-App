$(document).ready(function() {
  var currentGame;
  var context = {};
  $('.main').append(Handlebars.templates.intro);
  //Have the server get its token for spotify
  $.ajax({
    url: '/getToken',
    type: 'GET'
  });
  /*
  * game initialization once start game button is pressed
  * hide initial items and show game items
  */
  $('form').on('submit', function(e) {
    var genreChecked = $('.genre input:checked').val();
    if (genreChecked) {
      /* initialize game  */
      currentGame = new newGame(songsCallBack, lyricsCallBack, $('.genre input:checked').val());
      $('.main').html('<h3>Please wait</h3>');
      $('h3').css('text-align', 'center');
    }
    e.preventDefault();
  });
  //Function to show which genre is active on the page
  $('.main').on('click', '.genre label', function(e) {
    $('.genre label').each(function() {
      $(this).removeClass('active');
    });
  $('#' + e.currentTarget.id).addClass('active');
  });
  //Function to show which artist and song is active on the page
  $('.main').on('click', '.artists label', function(e) {
    $('.artists label').each(function() {
      $(this).removeClass('active');
    });
  $('#' + e.currentTarget.id).addClass('active');
  });
  /*
  * Function to set the status bar, green is passed, red otherwise
  */
  $('.main').on('submit', '#answerForm', function(e) {
    e.preventDefault();
    currentGame.setCurrentQuestion();
    context = {};

    //if item checked matches the correct answer for the question
    if ($('input[name=options]:checked').val() == currentGame.correctAnswer) {
      context.correct = 'Correct!!!!';
      currentGame.setansweredCorrectly();
      currentGame.setStatusHistory(1);
    } else {
      context.correct = 'Wrong Answer!!!!';
      currentGame.setStatusHistory(2);
    }
    currentGame.setStatusHistory(1);
    setStatus();
    $('.main').html('');
    context.amount = currentGame.getansweredCorrectly();
    context.max = 5;
    context.percent = currentGame.getansweredCorrectly() / 5 * 100;
    context.artist = currentGame.songs.songDetails[currentGame.getCurrentQuestion() - 1].songArtist;
    context.song = currentGame.songs.songDetails[currentGame.getCurrentQuestion() - 1].songName;
    context.songUrl = currentGame.songs.songDetails[currentGame.getCurrentQuestion() - 1].album;
    currentGame.setStatus();
    var template = Handlebars.templates.artist;
    $('.main').append(template(context));

    //show next if there are more questions
    if (currentGame.getCurrentQuestion() != 5) {
      $('.next-button').removeClass('hide');
    } else {
      $('.newGame').removeClass('hide');
    }

  });
  /*
  * Function to load the next set of lyrics and music artists
  */
  $('.main').on('click', '.next', function() {
    /* set main question number */
    game.setQuestionNumbers(4);
    resetInGame();
  });
  /*
  * Function to play and stop music. Also changes the play button picture and color.
  */
  $('.main').on('click', '.playbutton', function() {
    if ($('#music').get(0).paused === true) {
      playMusic('#music');
      $('.playbutton').attr("class", "glyphicon glyphicon-stop playbutton");
      $('.playbutton').css("color", "red");
    } else {
      stopMusic('#music');
      $('.playbutton').attr("class", "glyphicon glyphicon-play-circle playbutton");
      $('.playbutton').css("color", "green");
    }
  });
  //Function to detect when song has stopped playing, resets the playbutton
  $('#music').on('ended', function() {
    $('.playbutton').attr("class", "glyphicon glyphicon-play-circle playbutton");
    $('.playbutton').css("color", "green");
  });
  $('body').on('click', '.newGame', function() {
    //hide and change changed elements back to original
    $('.main').html(Handlebars.templates.intro);
  });
  function resetInGame() {
    $('.main').html('');
    stopMusic('#music');
    songsCallBack(lyricsCallBack);
  }
  /*
  * Function to handle status bar color changes based on right or
  * wrong answer history.
  */
  function setStatus() {
    var statHist = currentGame.getStatusHistory();
    //iterates over the stats history and changes color for each glyphicon
    for (i = 1; i <= statHist.length; i++) {
      if (i % 2) {
        if (statHist[i - 1] === 1) {
          $('.stats li:nth-child(' + i + ')').find('i').css('color', 'green');
        } else {
          $('.stats li:nth-child(' + i + ')').find('i').css('color', 'red');
        }
      } else {
        $('.status li:nth-child(' + i + ')').find('i').css('color', 'blue');
      }
    }
  }
  /*
  * Callback function for when json request comes back successfully
  */
  function songsCallBack(lyricsCallBack) {
    setAnswers();
    currentGame.getLyrics(lyricsCallBack, currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songName,
    currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songArtist);
  }
  /*
  * Callback function for when json request comes back successfully
  */
  function lyricsCallBack() {
    setLyrics();
    var template = Handlebars.templates.quiz;
    $('.main').html(template(context));
    setStatus();
  }
  function setLyrics() {
    context.lyrics = currentGame.currentSongLyrics;
  }
  /*
  * Function to add artist and album info the the buttons, also sets the lyrics,
  * and the song that can be listened to
  */
  function setAnswers() {
    for (i = 1; i <= 4; i++) {
      if (i === currentGame.correctAnswer) {
        context['artist' + i] = currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songName;
        context['song' + i] = currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songArtist;
      } else {
        context['artist' + i] = currentGame.songs.otherSongDetails[currentGame.getcurrentOtherQuestion()].songName;
        context['song' + i] =  currentGame.songs.otherSongDetails[currentGame.getcurrentOtherQuestion()].songArtist;
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
function newGame(songsCallBack, lyricsCallBack, genre) {
  game = new Game();
  /* get list of songs and pass in callback */
  game.getSongInfo(songsCallBack, lyricsCallBack, genre);
  /* set main question number */
  game.setQuestionNumbers(4);
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
  var statusHistory = [];
  /* hold song lyrics from server */
  this.currentSongLyrics = '';
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
    return answeredCorrectly;
  };
  /* Increment currentQuestion */
  this.setansweredCorrectly = function() {
    answeredCorrectly++;
  };
  /* return bad question count */
  this.getcurrentOtherQuestion = function() {
    return currentOtherQuestion;
  };
  /* increment bad question count */
  this.setcurrentOtherQuestion = function() {
    currentOtherQuestion++;
  };
  this.setStatusHistory = function(num) {
    statusHistory.push(num);
  };
  this.getStatusHistory = function() {
    return statusHistory;
  };
}
/*
* Function to get song data from node server. Node server queries spotify for data.
*/
Game.prototype.getSongInfo = function(callback, lyricsCallBack, genre) {
  var ctx = this;
  $.ajax({
    url: '/getMusic',
    data: {category: genre},
    type: 'GET'
  }).done(function(result) {
    ctx.songs = result;
    callback(lyricsCallBack);
  });
};
/*
* Method to get song lyrics from node server. Node server queries musixmatch for data.
* Due to access limits, queries are limited on a per call bases.
*/
Game.prototype.getLyrics = function lyrics(callback, song, artist) {
  var ctx = this;
  $.ajax({
    url: '/getLyrics',
    data: {songName: song, songArtist: artist},
    datatype: "json",
    type: 'GET'
  }).done(function(result) {
    ctx.currentSongLyrics = result.lyrics;
    callback();
  }).error(function(err) { //recursive call to move to next song and try getting those lyrics
    ctx.setCurrentQuestion();//increment currentquestion
    //recursive call to lyrics
    lyrics(callback, ctx.songs.songDetails[ctx.getCurrentQuestion()].songName,
    ctx.songs.songDetails[ctx.getCurrentQuestion()].songArtist);
  });
};
/*
* Function to get random number between 1 and some number as the correct answer to the
* current question
*/
Game.prototype.setQuestionNumbers = function(number) {
  this.correctAnswer = parseInt(Math.random() * (number) + 1);
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
