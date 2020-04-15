var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

require('../config/passport')(passport);

router.get('/adduser',(req, res, next)=>{
  if(req.isAuthenticated()){
    console.log("het is gelukt")
    res.render('add_user');
  }
  else{
    console.log("het is niet gelukt")
    res.redirect('/login')
  }
});

router.post('/', passport.authenticate('local-signup', {
  successRedirect : '/', // redirect to the secure profile section
  failureRedirect : '/signup', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

function isLoggedIn(req, res, next) {
  console.log(req.sessionID)
  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated()){
    console.log("test")
    return next();
  }
  console.log("not test")
  // if they aren't redirect them to the home page
  res.redirect('/login');
}

module.exports = router;

