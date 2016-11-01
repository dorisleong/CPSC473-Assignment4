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

// mongoDB
mongoose.connect('mongodb://localhost/trivia');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to mongoDB')
});
autoIncrement.initialize(db);

var questionSchema = mongoose.Schema({
  "question" : String,
  "answerId" : Number
});

var answerSchema = mongoose.Schema({
  "answerId" : Number,
  "answer" : String
});

var Question = mongoose.model("Question", questionSchema);
var Answer = mongoose.model("Answer", answerSchema);
// allow answerId to be automatically incremented after a document is saved
questionSchema.plugin(autoIncrement.plugin, { model: 'Question', field: 'answerId' });
answerSchema.plugin(autoIncrement.plugin, { model: 'Answer', field: 'answerId' });

// store some questions

var q = new Question({question: "Who was the first computer programmer?"});
var a = new Answer({answer: "Ada Lovelace"});
q.save();
a.save();
q = new Question({question: "Who led software development for NASA's Apollo lunar mission?"});
a = new Answer({answer: "Margaret Hamilton"});
q.save();
a.save();
q = new Question({question: "Who teaches CPSC 473 at CSU Fullerton?"});
a = new Answer({answer: "Kenytt Avery"});
q.save();
a.save();

// redis: store totals of right and wrong
var client = redis.createClient();
client.on('connect', function() {
  console.log('Connected to redis');
  client.set('right', 0);
  client.set('wrong', 0);
});

http.createServer(app).listen(3000);
console.log('Server running on port 3000');

// User creates new question -> add to mongodb
app.post('/question', function (req, res) {
  'use strict';
  var newQuestion = new Question({question: req.body.question});
  var newAnswer = new Answer({answerId: newQuestion.answerId, answer: req.body.answer});
  newQuestion.save();
  newAnswer.save();
  res.json({confirm: 'Question Added'});
});

// Return a random trivia question from mongodb
app.get('/question', function (req, res) {
  'use strict';
  var random;
  var randomQuestion = {question: "", answerId: 0};
  Question.distinct('answerId').count().exec(function (err, count) {
    random = Math.floor(Math.random() * count);
    console.log(random);
  });
  Question.findOne({ 'answerId': random }, function (err, question) {
    if (err) return handleError(err);
    console.log(question.question);
  });
  console.log(randomQuestion);
  res.json(randomQuestion);
});

// Determine if user answered question correctly
app.post('/answer', function (req, res) {
  'use strict';
  var result;
  Answer.findOne({ 'answerId': req.body.answerId }, function (err, answer) {
    if (err) return handleError(err);
    if (answer.answer == req.body.answer) {
      result = true;
    }
    else {
      result = false;
    }
  });
  res.json({
    correct: result
  });
});

// Return user's score
app.get('/score', function (req, res) {
  'use strict';
  var totalRight, totalWrong; 
  client.get('right', function(err, reply) {
    totalRight = reply;
  });
  client.get('wrong', function(err, reply) {
    totalWrong = reply;
  });
  res.json({
    right: totalRight,
    wrong: totalWrong
  });
});