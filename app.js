/**
 * Healthematica - real time health information sharing
 * Created by Jeffrey Hogan for WDIM493j - Node.js 
 * Instructor: Peter Wooley
 * August, 2012
 */

/* Dependencies ****************************/
var express = require('express')
  , routes = require('./routes')
  , db = require('./lib/hm_db.js')
  , auth = require('./lib/hm_auth.js')
  , util = require('./lib/hm_util.js')
  , http = require('http')
  , socketio = require('socket.io')
  , path = require('path')
  , fs = require('fs')
  , nconf = require('nconf')
  , passport = require('passport')
  , flash = require('connect-flash')
  , async = require('async')
  , LocalStrategy = require('passport-local').Strategy;

/* nconf setup ****************************/
nconf.argv()
    .env()
    .file({ file: 'config.json' });

/* Configuration **************************/
var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('view options', {
        layout: false,
    });
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(nconf.get('COOKIE_SECRET')));
    app.use(express.session());
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Globals
app.locals.title = 'Healthematica';

//TEST: create user
//db.saveUser("peter", "freedom", "e@e.org", function(err, test){
//    console.log("password hash is " + test);
//});

//TEST: find a user
//db.findUserByName("jeff", function(err, results){
//    if(err) { 
//        console.log(err); 
//    } else {
//        console.log("Found: " + results); 
//    }
//});



/* Passport setup *******************************/
passport.use(new LocalStrategy(

    function(username, password, done) {
        db.findUserByName(username, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }

            util.getHash(password, function(err, hash) {
                if(err || hash !== user[0].value.password) return done(null, false, {message: 'Invalid password'});
                return done(null, user[0].value);
            });
        })
    }
));

passport.serializeUser(function(user, done) {
        done(null, user.name);
});

passport.deserializeUser(function(username, done) {
    db.findUserByName(username, function (err, user) {
        done(err, user[0].value);
    });
});


/* Routes *******************************/
    /* Base Routes ****/
app.get('/', function(req, res){

    res.render('index', { 
        user: req.user 
    });
});

    /* Authentication and Account related routes ****/
app.get('/login', function(req, res) {
    res.render('login', { 
        user: req.user, 
        message: req.flash('error') 
    });
});

app.post('/login',
  passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}),
  function(req, res) {
    // When using connect-flash, you set the key with the first parameter and value with the second.
    // req.flash('error') is a getter.
    // req.flash('error', 'value') is a setter.
    req.flash("error", "test"), 
    res.redirect('/account')
  }
);

app.get('/account', auth.ensureAuthenticated, function(req, res){
    res.render('account', { 
        user: req.user,
        message: req.flash('error')
    });
});

/* Glucose CRUD ****/
app.get('/account/glucose', auth.ensureAuthenticated, function(req, res) {
    db.readMultiple("glucose", req.user.name, function(err, doc) {
        res.render('glucose', {
            user: req.user,
            glucoses: doc,
            message: req.flash('success')
        });
    });
});

app.get('/account/glucose/new', auth.ensureAuthenticated, function(req, res) {
   res.render('glucose.new.jade', { 
        user: req.user
   });
});

app.post('/account/glucose/new', auth.ensureAuthenticated, function(req, res) {
    req.flash("success", "Entry Added Successfully");
    db.createEntry("glucose", req.user.name, req.body.value, function(err, success) {
        if(success) { 
            res.redirect('/account/glucose');
            sendUpdate();
        };
    });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

    /* Registration ****/
app.get('/register', function(req, res) {
    res.render('register', {
        message: req.flash('error')
    });
});

app.post('/register', function(req, res) {

    var data = req.body;

    // Check if username is in use
    db.checkUserByName(data.username, function(err, doc) {
    if(err) {
          res.render('register', { message: req.flash(err)});

    // Check if confirm password does not match
    //} else if(data.password != data.confirm_password) {
     // res.render('register', { message: req.flash('Password does not match')});

    } else if(data.username == "" || data.password == "" || data.email == "") {
        req.flash('error', "Please make sure to fill out all fields");
        res.render('register', { message: req.flash('error')});

    // Create user in database
    } else {
      //delete data.confirm_password;
        db.saveUser(data.username, data.password, data.email,
            function(db_err, db_res) {
              res.render('index', { message: req.flash('User created')});
            });
        }
    });

});

/* Graphs ********************************/
app.get('/glucose/ajax', function(req, res) {
    db.getGlucoseData("glucose", function(err, data) {
        res.contentType('json');
        res.send({ 
            "data": data 
        });
    });
});


/* Initialization *******************************/ 
var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/* Socket.io *******************************/ 
var io = socketio.listen(server);
var connections = 0;
io.sockets.on('connection', function (socket) {
    connections++;
    io.sockets.emit('connect', { 
        total: connections 
    });
    socket.on('disconnect', function (data) {
        connections--;
        io.sockets.emit('connect', {
            total: connections
        });
    });
});

// Send the emit when new data is added
var sendUpdate = function() {
    io.sockets.emit('newData', {});
};

