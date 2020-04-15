var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyparser = require("body-parser");
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var session = require("express-session");
var flash = require('connect-flash');
var fileUpload = require('express-fileupload');
var compression = require('compression');
var helmet = require('helmet');

//ROUTERS
var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var loginRouter = require('./routes/login')
var signupRouter = require('./routes/signup')
var calendarRouter = require('./routes/calendar')
var trainingRouter = require('./routes/training')
var kandidatenRouter = require('./routes/kandidaten')
var pdfRouter = require('./routes/pdfManager')
var app = express();

app.use(cookieParser('asession'));

app.use(compression()); //Compress all routes
app.use(helmet());

//body parser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

//SESSION
app.use(session({
  secret: 'asession',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}))

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//MongoBD url
//var url = "mongodb+srv://matthijssoetaert:DDq_82394@volvo-0yvmo.mongodb.net/test?retryWrites=true&w=majority";
var mongoDB = 'mongodb+srv://matthijssoetaert:DDq_82394@volvo-0yvmo.mongodb.net/test?retryWrites=true&w=majority'
var url = process.env.MONGODB_URI || mongoDB;

mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true,dbName: "Volvo" });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/login', loginRouter)
app.use('/signup', signupRouter)
app.use('/calendar', calendarRouter)
app.use('/training', trainingRouter)
app.use('/kandidaten', kandidatenRouter)
app.use('/pdf',pdfRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;