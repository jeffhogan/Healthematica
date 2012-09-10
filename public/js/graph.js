/*
 * Javascript code for the home page data visualization
 */

// Grab the user data from the database
$.ajax({
    url: "/glucose/ajax",
    dataType: "json",

    success: function(data) {
        console.log(data.data);
        $.plot($("#graph"), [data.data] );
    }

});


// create an array of points for each user


// push each array into flot



//$.plot($("#graph"), [ [[0, 0], [1, 1]] ], { yaxis: { max: 1 } });
