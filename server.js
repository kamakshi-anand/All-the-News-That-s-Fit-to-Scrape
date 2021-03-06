var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware
//******************************************************************handlebars */
var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
//************************************************************************ */
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
//app.use(express.static("/public"));
app.use(express.static(process.cwd() + '/public'));
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect to the Mongo DB
// included "mongodb://localhost/mongoHeadlines"************************
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.anandtech.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    //console.log($);
    // Now, we grab every h2 within an article tag, and do the following:
    var count = 0;
    $("div").each(function (i, element) {
      // Save an empty result object
      var result = {};
      if ($(this).attr("class") == "cont_box1_txt") {
        count++;
        result.title = $(this).children("h2").children("a").text();

        result.link = $(this).children("h2").children("a").attr("href");
        result.summary = $(this).children("p").text();

        console.log("Link is " + $(this).children("h2").children("a").attr("href"));
        console.log("Text is " + $(this).children("h2").children("a").text());
        console.log("Summary is " + $(this).children("p").text());
        console.log("**********" + count);


      }
      // Add the text and href of every link, and save them as properties of the result object


      // Create a new Article using the `result` object built from scraping
      db.Headline.create(result)
        .then(function (dbHeadline) {
          // View the added result in the console
          console.log(dbHeadline);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

app.get('/', function(req, res) {
  db.Headline.find({})
    .then(function (data) {
      // If we were able to successfully find Articles, send them back to the client
      var headlineObject = {
        headlines: data
      };
      res.render('index', headlineObject);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all Articles from the db
app.get("/headlines", function (req, res) {
  // Grab every document in the Articles collection
  db.Headline.find({})
    .then(function (dbHeadline) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbHeadline);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific headline by id, populate it with it's comment
app.get("/headlines/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Headline.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("comment")
    .then(function (dbHeadline) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbHeadline);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/headlines/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function (dbComment) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Headline.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
    })
    .then(function (dbHeadline) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbHeadline);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
