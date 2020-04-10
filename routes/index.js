const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

//root route
router.get('/', (req, res) => {
  res.render('landing');
});

//Show register forum
router.get('/register', (req, res) => {
  res.render('register', { page: 'register' });
});

//handle sign up logic
router.post('/register', (res, res) => {
  var newUser = new User({ username: req.body.username });
  if (req.body.adminCode === process.env.ADMIN_CODE) {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('register', { error: err.message });
    }
    passport.authenticate('local')(req, res, () => {
      req.flash(
        'success',
        'Successfully signed up! Nice to meet you ' + req.body.username
      );
      res.redirect('/campgrounds');
    });
  });
});

//Show login forum
router.get('/login', (req, res) => {
  res.render('login', { page: 'login' });
});

//handling login logic
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Welcome to YelpCamp!'
  }),
  (req, res) => {}
);

//logout route
router.get('/logout', (req, res) => {
  req.logOut();
  req.flash('success', 'See you later!');
  res.redirect('/campgrounds');
});

module.exports = router;
