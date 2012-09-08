/* Authentication Library for Healthematica ***********************/

var passport = require('passport')
  , db = require('./hm_db.js')
  , util = require('./hm_util.js');

module.exports = {

    /*
     * Check that a user is authenticated to look at their account
     */
    ensureAuthenticated: function(req, res, next) {
        // Passport gives us an `isAuthenticated()` function on the request object.
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login')
    },

}
