/* Utility Library for Healthematica ***********************/

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
