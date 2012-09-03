/* Routes *********************************/

/* Main app routes */

exports.index = function(req, res){
    res.render('index', { 
        title: 'Express',
        user: req.user 
    });
};


/* Authentication Routes */
exports.login = function(req, res) {
    res.render('login', { 
        title: 'Express',
        user: req.user, 
        message: req.flash('error') 
    });
};
