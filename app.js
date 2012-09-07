
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
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , nconf = require('nconf')
  , passport = require('passport')
  , flash = require('connect-flash')
  , crypto = require('crypto')
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
  app.set('view options', {layout: false});
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

//TEST: create user
//saveUser("jeff", "test", "j@j.com", function(err, test){
//    console.log("password hash is " + test);
//});

//TEST: find a user
db.findUserByName("jeff", function(err, results){
    if(err) { 
        console.log(err); 
    } else {
        console.log("Found: " + results); 
    }
});


/* Authentication ***********************/


// This is middleware we'll use to make sure an unauthenticated user can get to `/account`.
function ensureAuthenticated(req, res, next) {
  // Note how Passport gives us an `isAuthenticated()` function on the request object.
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
};

// To use Passport's built-in session support, we need to be able to serialize a user
// Here, we just store the `username`, which we'll use deserialize...
passport.serializeUser(function(user, done) {
  done(null, user.username);
});

// ... right here! So, we take the `username` we stored in the session and use our `findByUsername()`
// to get the user object back.
passport.deserializeUser(function(username, done) {
  findByUsername(username, function (err, user) {
    done(err, user);
  });
});

// Here we're actually configuring Passport. Since we're doing local username/password
// (as opposed to Twitter OAuth or something else), we use the LocalStrategy.
passport.use(new LocalStrategy(

    function(username, password, done) {
        findUserByName(username, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }

        getHash(password, function(err, hash) {
            if(err || key !== user.password) return done(null, false, {message: 'Invalid password'});
            return done(null, user);
        });
        })
    }
));


/* Routes *******************************/
app.get('/', routes.index);
app.get('/login', routes.login);

// Here's the Passport magic. When the user posts the login form, we use the
// passport.authenticate middleware. This function calls the LocalStrategy function we
// defined above and handles redirecting if the user didn't give us correct
// user credentials. If they did provide valid credentials, we just redirect them
// back to the home page.
app.post('/login',
  passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  }
);

// Once the user is logged in, they can get to the `/account` page. To make sure
// unauthenticated users can't see the account page, we use the ensureAuthenticated
// middleware we defined above. This checks if the user is authenticated before allowing
// the request to go on.
app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

// The `req.logout()` method is provided by Passport and provides an easy way to end
// a user's authenticated session. Note that after a user is logged out, you still need to
// redirect them to a new page.
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Registration will be your job, but this route will at least show the user the
// registration page.
app.get('/register', function(req, res) {
  res.render('register', {message: req.flash('error')});
});

// Your job is to write the logic for registering a new user.
// If the user doesn't provide all needed info (username, email, password),
// make sure to send them back to the registration form and tell them they messed up.
// If they provide the needed details, add the user then let them login.
app.post('/register', function(req, res) {

    var data = req.body;

    // Check if username is in use
    db.get(data.username, function(err, doc) {
        if(doc) {
          res.render('register', { message: req.flash('Username is in use')});

    // Check if confirm password does not match
    } else if(data.password != data.confirm_password) {
      res.render('register', { message: req.flash('Password does not match')});

    // Create user in database
    } else {
      delete data.confirm_password;
      require('db').save();
        db.save(data.username, data,
            function(db_err, db_res) {
              res.render('index', { message: req.flash('User created')});
            });
        }
    });

});

/* Initialization *******************************/ 
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
