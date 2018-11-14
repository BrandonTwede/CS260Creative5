var express = require('express');
var router = express.Router();

/* Set up mongoose in order to connect to mongo database */
var mongoose = require('mongoose'); //Adds mongoose as a usable dependency

mongoose.connect('mongodb://localhost/plinkoDB',{ useNewUrlParser: true }); //Connects to a mongo database called "commentDB"

var plinkoSchema = mongoose.Schema({ //Defines the Schema for this database
    Name: String,
    Points: String
});

var Highscore = mongoose.model('Highscore', plinkoSchema); //Makes an object from that schema as a model

var db = mongoose.connection; //Saves the connection as a variable to use
db.on('error', console.error.bind(console, 'connection error:')); //Checks for connection errors
db.once('open', function() { //Lets us know when we're connected
    console.log('Connected');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html', { title: 'Express' });
});

//CREATE score
router.post('/highscores', function(req, res, next) {
    console.log("POST highscore route"); 
    var newscore = new Highscore(req.body); 
    console.log(newscore); 
    newscore.save(function(err, post) { 
      if (err) return console.error(err);
      console.log(post);
      res.sendStatus(200);
    });
});

/* GET scores from database */
router.get('/highscores', function(req, res, next) {
  console.log("In the GET route");
  Highscore.find()
    .sort({'Points': -1})
    .limit(10)
    .exec(function(err, scoreList) {
      if (err) return console.error(err); //If there's an error, print it out
      else {
        //console.log(commentList); //Otherwise console log the comments you found
        console.log("Scores successfully retrieved");
        res.json(scoreList); //Then send the comments
      }
    });
});

router.delete('/highscores', function(req, res, next) {
  console.log("Deleting Comments");
  Highscore.find().deleteMany(function(){});
  res.sendStatus(200);
});

//Favicon (because I'm getting sick of the error)
 const favicon = new Buffer('AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEREQAAAAAAEAAAEAAAAAEAAAABAAAAEAAAAAAQAAAQAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD8HwAA++8AAPf3AADv+wAA7/sAAP//AAD//wAA+98AAP//AAD//wAA//8AAP//AAD//wAA', 'base64'); 
 router.get("/favicon.ico", function(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Length', favicon.length);
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader("Cache-Control", "public, max-age=2592000");                // expiers after a month
  res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
  res.end(favicon);
 });

module.exports = router;
