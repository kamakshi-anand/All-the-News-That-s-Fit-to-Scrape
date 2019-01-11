// Grab the articles as a json
// $.getJSON("/headlines", function(data) {
//   // For each one
//   console.log("Data is "+data);
//   alert(data);
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//    $("#headlines").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link +"<br/>"+ data[i].summary +  "</p>" );
//   //  $("#headlinetable").append("<tr ><td>"+ data[i].title + "</td>" + 
//   //  "<td>"+ data[i].link + "</td>" +
//   //  "<td>"+ data[i].summary + "</td></tr>");
//   }
// });


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  //alert("I am in");
  $("#comments").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/headlines/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#comments").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title******************************************
     // $("#comments").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");
      $("#comments").append("<button data-id='" + data._id + "' id='deletecomment'>Delete Comment</button>");

      // If there's a note in the article
      console.log("data is "+ data.comment);
      if (data.comment) {
        console.log("data comment "+ data.comment.body);
        // Place the title of the note in the title input**********************
        // $("#titleinput").val(data.comment.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.comment.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savecomment", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/headlines/" + thisId,
    data: {
      // Value taken from title input**************
      // title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#comments").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#deletecomment", function() {
  $("#bodyinput").val("");
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/headlines/" + thisId,
    data: {
      // Value taken from title input**************
      // title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#comments").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");

});

