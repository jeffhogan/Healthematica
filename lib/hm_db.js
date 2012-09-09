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
var glucoseDB = connect.database('glucose');

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
                return cb(err, res);
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

    /*
     * Check if a username exists (findByUserName isn't flexible enough) 
     * username {string}
     * cb {function}
     */
    checkUserByName: function(username, cb) {
        userDB.view('user/byUsername', { key: username }, function (err, doc) {
            if(doc.length > 0) { 
                return cb("That username is taken", null); 
            }
            return cb(null, null);
        });
    },

    /* CRUD methods ********************/

    /*
     * Create a new entry in a DB
     * DB {string} the database name
     * entry {object} the entry data itself
     *      user {string}
     *      date {date}
     *      glucose {int}
     */
    createEntry: function() {

     },

    /*
     * Read an entry in a DB
     * DB {string} the database name
     * user {string} the user to search by 
     */
    readOne: function(db, username) {
     },

    /*
     * Retrieve multiple entries by a username - queries a view
     * DB {string} the database name
     * username {string} the user to search by
     */
    readMultiple: function(db, username, cb) {
        var connection = connect.database(db);
        connection.view(db + '/byUsername', { key: username }, function (err, doc) {
            cb(err, doc);
        }); 
     },


    /*
     * Update an entry in a DB
     * DB {string} the database name
     * type {string} the column to search by
     */
    updateEntry: function() {

     },

    /*
     * Delete an entry in a DB
     * DB {string} the database name
     * type {string} the column to search by
     */
    deleteEntry: function() {

     },

}
