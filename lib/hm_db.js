/* Database Library for Healthematica ***********************/

var util = require('./hm_util'),
    cradle = require('cradle');

// DB configuration
cradle.setup({
    host: 'localhost',
    cache: true, 
    raw: false
});

var connect = new(cradle.Connection)('127.0.0.1:5984');
var userDB = connect.database('users');

module.exports = { 

    /*
     * Save a new user into the database
     * name {string}
     * password {string}
     * email {string}
     * cb {function}
     */
    saveUser: function(name, password, email, cb) {
        util.getHash(password, function(err, hash) {
            userDB.save({
                'email': email,
                'name': name,
                'password': hash
            }, function (err, res) {
                console.log("res is " + res);
            });
        });
    },

    /*
     * Retrieve a document by username
     * username {string}
     * cb {function}
     */
    findUserByName: function(username, cb) {
        userDB.view('user/byUsername', { key: username }, function (err, doc) {
            if(doc.length != 0) { return cb(null, doc); }
            return cb("There is no user by that name", null);
        });
    },


}
