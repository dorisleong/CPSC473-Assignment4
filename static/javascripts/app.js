var main = function () {
  'use strict';
  
  var sendAJAX = function (url, type, data, outputId, responseKey) {
    $.ajax({
      url: url, //'/route'
      dataType: 'json',
      type: type, // 'POST' 'GET'
      data: data,
      contentType: 'application/json',
      success: function (response) {
        $(outputId).text(response.responseKey);
      }
    });
  };

  //TODO get question from server (GET /question)

  //TODO send guess to server returns if correct (POST /answer)

  //TODO send new question and answer from input to server (POST /question)

  //TODO get score - after each answer submitted (GET /score) 

};

$(document).ready(main);