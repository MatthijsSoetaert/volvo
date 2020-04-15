module.exports.isLoggedIn = function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        console.log("test")
        return next();

    console.log("not test")

    // if they aren't redirect them to the home page
    res.redirect('/login');
}