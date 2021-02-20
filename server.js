const express = require("express");
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const PORT = process.env.PORT || 4000;
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport")
const { promisify } = require('es6-promisify');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const config = require("./config/db");
const helpers = require('./helpers');
const errorHandlers = require('./api/handlers/errorHandlers');
const blog = require("./api/routes/routes");

const app = express();

//register express validator
app.use(expressValidator());


// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// // Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// // The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash());

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = require('util').promisify(req.login, req);
  next();
});

//configure database and mongoose
mongoose.set("useCreateIndex", true);
mongoose
  .connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database is connected");
  })
  .catch(err => {
    console.log({ database_error: err });
  });
  
//registering cors
app.use(cors({ origin: 'http://localhost:5000' , credentials :  true }))
app.use(cookieParser());

//configure body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan("dev")); // configire morgan

app.use("/", blog);

app.listen(PORT, err => {
  if (err) { 
    console.log('sever cannot listen');
    return 
  }
  console.log('server listening');
});