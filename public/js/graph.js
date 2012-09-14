/*
 * Javascript code for the home page data visualization
 */

//setup Flot options
var options = {
    series: {
        lines: { show: false },
        points: { show: true }
    },
    xaxis: {
       minTickSize: 1
   },
};


// Grab the user data from the database
var loadGraph = function() {
    $.ajax({
        url: "/glucose/ajax",
        dataType: "json",

        success: function(data) {
            $.plot($("#graph"), data.data, options);
        }

    });
};

// Initial Load
loadGraph();

// Cheesy socket reload...
var socket = io.connect(location);
socket.on("newData", function() {
    loadGraph(); 
});

socket.on("connect", function(data) {
    $("#connections").html(data.total);
});

