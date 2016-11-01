var main = function () {
  'use strict';
  $( ".game" ).hide();

  var sendAJAX = function (url, data, successFunction) {
    $.ajax({
      url: url, //'/route'
      dataType: 'json',
      type: 'POST', 
      data: data,
      contentType: 'application/json',
      success: function (response) {
        successFunction(response);
      }
    });
  };

  //Get question from server (GET /question)
  var getQuestion = function () {
    $.ajax({
      url: '/question',
      dataType: 'json',
      type: 'GET',
      contentType: 'application/json',
      success: function (response) {
        $('#question').text(response.question);
      }
    });
  }

  //Send guess to server returns if correct (POST /answer)
  var postGuess = function () {

  }

  //Send new question and answer from input to server (POST /question)
  var postQuestion = function () {
    sendAJAX('/question',JSON.stringify({question:"Test Q", answer: "Test A"}), function(response){
      $('#addConfirmation').text(response.confirm);
    });
  }

  //Get score - after each answer submitted (GET /score) 
  var getScore = function () {

  }

  $( "#start" ).click(function() {
    $( ".game" ).show();
    $('#start').hide();
    getQuestion();
  });

  $("#addQuestion").click(function() {
    postQuestion();
  });

};

$(document).ready(main);