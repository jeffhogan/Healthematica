/* Routes *********************************/
var passport = require('passport')
  , db = require('../lib/hm_db.js')
  , util = require('../lib/hm_util.js');

/* Main app routes */

module.exports.index = function(req, res){
    res.render('index', { 
        title: 'Express',
        user: req.user 
    });
};


/* Authentication Routes */
module.exports.login = function(req, res) {
    res.render('login', { 
        title: 'Express',
        user: req.user, 
        message: req.flash('error') 
    });
};


module.exports.account = function(req, res) {
    res.render('login', { 
        title: 'Express',
        user: req.user, 
        message: req.flash('error') 
    });
};
