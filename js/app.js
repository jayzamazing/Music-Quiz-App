$(document).ready(function() {
  var currentGame, context = {};
  $('.main').append(Handlebars.templates.intro);
  //Have the server get its token for spotify
  $.ajax({
    url: '/getToken',
    type: 'GET'
  }).fail(function(err) {
    displayError();
  });
  /*
  * game initialization once start game button is pressed
  * hide initial items and show game items
  */
  $('form').on('submit', function(e) {
    var genreChecked = $('.genre input:checked').val();
    if (genreChecked) {
      displayWait();
      /* initialize game  */
      currentGame = new newGame(songsCallBack, displayError, genreChecked);
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
    currentGame.setQuestionNumber();
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
    setStatus();
    //show next if there are more questions
    if (currentGame.getQuestionNumber() < 5) {
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
      $('.playbutton').attr("class", "glyphicon glyphicon-stop playbutton pull-left");
      $('.playbutton').css("color", "red");
    } else {
      stopMusic('#music');
      $('.playbutton').attr("class", "glyphicon glyphicon-play-circle playbutton pull-left");
      $('.playbutton').css("color", "green");
    }
  });
  //Function to detect when song has stopped playing, resets the playbutton
  $('#music').on('ended', function() {
    $('.playbutton').attr("class", "glyphicon glyphicon-play-circle playbutton pull-left");
    $('.playbutton').css("color", "green");
  });
  $('body').on('click', '.newGame', function() {
    //hide and change changed elements back to original
    $('.main').html(Handlebars.templates.intro);
  });
  function resetInGame() {
    displayWait();
    stopMusic('#music');
    songsCallBack();
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
        $('.stats li:nth-child(' + i + ')').find('i').css('color', 'blue');
      }
    }
  }
  /*
  * Callback function for when json request comes back successfully
  */
  function songsCallBack() {
    setAnswers();
    currentGame.getLyrics(lyricsCallBack, displayError, currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songName,
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
  /*
  * Function to add lyrics to the context which is used by handlebars
  */
  function setLyrics() {
    context.lyrics = trimLyrics(currentGame.currentSongLyrics);
  }
  /*
  * Function to trim the lyrics
  * @params lyrics - song lyrics to trim
  * @returns string - trimed lyrics
  */
  function trimLyrics(lyrics) {
    //proceed if lyrics are longer than 160 characters long
    if (lyrics.length > 160) {
      //trim to 160 characters
      lyrics = lyrics.substr(0, 160);
      //ensure last word is not cut in half
      lyrics = lyrics.substr(0, Math.min(160, lyrics.lastIndexOf(' ')));
    }
    //handle not for commercial use tag in lyrics
    if (lyrics.includes('*******')) {
      //set lyrics to cut off where commercial tag begins
      lyrics = lyrics.substr(0, lyrics.indexOf('*******'));
    }
    return lyrics;
  }
  /*
  * Function to deal with triming the song name
  * @params songName - song name to triming
  * @returns string - trimed song name
  */
  function trimSongName(songName) {
    //if song name is longer than 105 characters
    if (songName.length > 105) {
      //trim to 105 characters
      songName = songName.substr(0, 105);
      //ensure last word is not cut in half
      songName = songName.substr(0, Math.min(105, songName.lastIndexOf(" ")));
    }
    return songName;
  }
  /*
  * Function to deal with trimming artist name
  * @params artistName - name of artist to trim
  * @returns string - trimed artist name
  */
  function trimSongArtist(artistName) {
    //if song name is longer than 35 characters
    if (artistName.length > 35) {
      //trim to 35 characters
      artistName = artistName.substr(0, 35);
      //ensure last word is not cut in half
      artistName = artistName.substr(0, Math.min(35, artistName.lastIndexOf(" ")));
    }
    return artistName;
  }
  /*
  * Function to add artist and album info the the buttons, also sets the lyrics,
  * and the song that can be listened to
  */
  function setAnswers() {
    for (i = 1; i <= 4; i++) {
      if (i === currentGame.correctAnswer) {
        context['artist' + i] = trimSongArtist(currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songName);
        context['song' + i] = trimSongName(currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songArtist);
      } else {
        context['artist' + i] = trimSongArtist(currentGame.songs.otherSongDetails[currentGame.getcurrentOtherQuestion()].songName);
        context['song' + i] =  trimSongName(currentGame.songs.otherSongDetails[currentGame.getcurrentOtherQuestion()].songArtist);
          /* increment count on bad answers */
          currentGame.setcurrentOtherQuestion();
      }
    }
    $('#music').attr('src', currentGame.songs.songDetails[currentGame.getCurrentQuestion()].songUrl);
  }
  /*
  * Function that will end the game on any kind of game stopping error
  */
  function displayError() {
    //display error on the page
    $('.main').html(Handlebars.templates.error);
    //sets the questionNumber to 5 to ensure there is no continuation
    currentGame.serverError();
  }
  function displayWait() {
    $('.main').html(Handlebars.templates.wait);
  }
});
/*
* Initialize game and set game state
*/
function newGame(songsCallBack, failCallBack, genre) {
  game = new Game();
  /* get list of songs and pass in callback */
  game.getSongInfo(songsCallBack, failCallBack, genre);
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
  var questionNumber = 0;
  /* hold song lyrics from server */
  this.currentSongLyrics = '';
  /* object to hold json query of songs */
  this.songs = [];
  /* Number that has the correct answer for current question */
  this.correctAnswer = 0;
  this.serverError = function() {
    questionNumber = 5;
  }
  this.getQuestionNumber = function() {
    return questionNumber;
  }
  this.setQuestionNumber = function() {
    questionNumber++;
  }
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
Game.prototype.getSongInfo = function(callback, failCallBack, genre) {
  var ctx = this;
  $.ajax({
    url: '/getMusic',
    data: {category: genre},
    type: 'GET'
  }).done(function(result) {
    ctx.songs = result;
    callback();
  }).fail(function(err) {
    failCallBack();
  });
};
/*
* Method to get song lyrics from node server. Node server queries musixmatch for data.
* Due to access limits, queries are limited on a per call bases.
*/
Game.prototype.getLyrics = function (callback, failCallBack, song, artist) {
  var ctx = this;
  $.ajax({
    url: '/getLyrics',
    data: {songName: song, songArtist: artist},
    datatype: "json",
    type: 'GET'
  }).done(function(result) {
    ctx.currentSongLyrics = result.lyrics;
    callback();
  }).fail(function(err) {
      ctx.setCurrentQuestion();//increment currentquestion
      if (ctx.songs.songDetails[ctx.getCurrentQuestion()].songName &&
      ctx.songs.songDetails[ctx.getCurrentQuestion()].songArtist) {
        //recursive call to lyrics
        ctx.getLyrics(callback, failCallBack, ctx.songs.songDetails[ctx.getCurrentQuestion()].songName,
        ctx.songs.songDetails[ctx.getCurrentQuestion()].songArtist);
      } else {
        failCallBack();
      }
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
  var nowPlaying = $('#music')[0];
  nowPlaying.volume = 0.5;
  nowPlaying.load();
  nowPlaying.play();
}
/*
* Function to stop music
*/
function stopMusic (music) {
  $(music)[0].pause();
}
/*
* Function to deal with setting the volume of the musing playing
*/
function setVolume(val) {
  var nowPlaying = $('#music')[0];
  nowPlaying.volume = val / 100;
}
