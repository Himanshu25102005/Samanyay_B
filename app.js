var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cors = require('cors');
var logger = require('morgan');
const passport = require("passport");
const expressSession = require("express-session")
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
const stripe = require('stripe');
require('./routes/auth'); // Import auth configuration

var app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
  resave:false,
  saveUninitialized:false,
  secret: "hey hey hey"
}))


app.use(express.static(path.join(__dirname, 'C:\Users\himan\OneDrive\Desktop\samanyay')));

app.use(passport.initialize());
app.use(passport.session());



// Serialize/deserialize functions are now defined in routes/auth.js

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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
