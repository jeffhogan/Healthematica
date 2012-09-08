/* Utility Library for Healthematica ***********************/
var crypto = require('crypto')
  , nconf = require('nconf');
  
/* nconf setup ****************************/
nconf.argv()
    .env()
    .file({ file: 'config.json' });

module.exports = {

    /*
     * Hash a password
     * password {string}
     * cb {function}
     */
    getHash: function(password, cb) {
      crypto.pbkdf2(password, nconf.get("SALT"), 2048, 40, cb);
    },

}
