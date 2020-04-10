var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  cookieParser = require('cookie-parser'),
  LocalStrategy = require('passport-local'),
  flash = require('connect-flash'),
  session = require('express-session'),
  methodOverride = require('method-override');

//configure dotenv
require('dotenv').load();

//requiring routes
var commentRoutes = require('./routes/comments');
var campgroundRoutes = require('./routes/campgrounds');
var indexRoutes = require('./routes/index');

mongoose.Promise = global.Promise;

const databaseUri =
  process.env.MONGOD_URI || 'mongodb://localhost:27017/yelpcamp';

mongoose
  .connect(databaseUri, { useMongoClient: true })
  .then(() => console.log('database connected'))
  .catch(err => console.log(`Database connection error ${err.message}`));

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(cookieParser('secert'));

//require moment
app.locals.moment = require('moment');

//seedDB

//Passport configuration
app.use(
  require('express-session')({
    secret: 'Once again rusty wins the cutest dog',
    resave: false,
    saveUninitialized: false
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', indexRoutes);
app.use('/campgrounds/', campgroundRoutes);
app.use('/campgrounds/:id/comments/', commentRoutes);

app.listen(process.env.PORT, 3000, process.env.IP, () => {
  console.log('The yelpcamp server has started');
});
