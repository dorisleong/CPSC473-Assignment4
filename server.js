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

// store some questions-- Note: these questions will add duplicates if server is restarted
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
  var newAnswer = new Answer({answer: req.body.answer});
  newQuestion.save();
  newAnswer.save();
  res.json({confirm: 'Question Added'});
});

// Return a random trivia question from mongodb
app.get('/question', function (req, res) {
  'use strict';
  var randomId;
  //BUG: cannot save total count of records in a collection
  // Question.distinct('answerId').count().exec(function (err, count) {
  //   console.log('total questions: '+ count);
  //   randomId = Math.floor(Math.random() * count);
  //   console.log('choose answer id: ' + random);
  // });

  //TEMP FIX: using random question from 0-2
  randomId = Math.floor(Math.random() * 3);

  Question.findOne({ answerId: randomId }, function (err, result) {
    if (err) return handleError(err);
    console.log('findOne: '+result);
    res.json({question: result.question,
      answerId: result.answerId});
  });  
});

// Determine if user answered question correctly
app.post('/answer', function (req, res) {
  'use strict';
  var result;
  Answer.findOne({ 'answerId': req.body.answerId }, function (err, answer) {
    if (err) return handleError(err);
    if (answer.answer == req.body.answer) {
      result = true;
      client.incr('right', function(err, reply) {
        console.log('answer is right - total: '+reply); 
      });
    }
    else {
      result = false;
      client.incr('wrong', function(err, reply) {
        console.log('answer is wrong - total: '+reply); 
      });
    }
    console.log('returning: '+ result);
    res.json({
      correct: result
    });
  });
});

// Return user's score
app.get('/score', function (req, res) {
  'use strict';
  client.mget('right','wrong', function(err, reply) {
    console.log(reply);
    res.json({
      right: reply[0],
      wrong: reply[1]
    });
  });  
});