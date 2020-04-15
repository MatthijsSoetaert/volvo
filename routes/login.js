var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

require('../config/passport')(passport);


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login');
});

router.post('/',passport.authenticate('local-login',{
  successRedirect : '/',
  failureRedirect : '/login',
  failureFlash: true
}
));

module.exports = router;
