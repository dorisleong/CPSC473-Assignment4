var express = require('express'),
  http = require('http'),
  bodyParser = require('body-parser'),
  mongoose = require("mongoose"),
  autoIncrement = require('mongoose-auto-increment'),
  redis = require("redis"),
  app = express();

app.use(express.static(__dirname + '/static'));

// tell Express to parse incoming
// JSON objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://localhost/trivia');
// schemas
// question collection{question: string, answerId: int}
// answer collection{answerId: int, answer: string}
var questionSchema = mongoose.Schema({
  "question" : String,
  "answerId" : Number
});

// redis: store totals of right and wrong

http.createServer(app).listen(3000);
console.log('Server running on port 3000');

// User creates new question -> add to mongodb
app.post('/question', function (req, res) {
  'use strict';
  var question = req.body.question;
  var answer = req.body.answer;
  //add to db (question/answerId) + (answerId/answer)
  //questionSchema.plugin(autoIncrement.plugin, { model: 'question', field: 'answerId' });
  //get answerId of question from question collection -> add answerId + answer to answer collection
});

// Return a trivia question from mongodb
app.get('/question', function (req, res) {
  'use strict';
  var result = req.body.array;
  res.json({
    result: result
  });
});

// Determine if user answered question correctly
app.post('/answer', function (req, res) {
  'use strict';
  var question = req.body.answerId;
  var guess = req.body.answer;
  //var result = fcn if guess == correct answer to answerId
  //if correct/incorrect then add to score
  res.json({
    correct: result
  });
});

// Return user's score
app.get('/score', function (req, res) {
  'use strict';
  //var score = redis return score as json;
  res.json({//score
    right: totalRight,
    wrong: totalWrong
  });
});