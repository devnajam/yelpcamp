const express = require('express'),
  router = express.Router(),
  Campground = require('../models/campground'),
  Comment = require('../models/comment'),
  middleware = require('../middleware'),
  geocoder = require('geocoder');

var {
  isLoggedIn,
  checkUserCampground,
  checkUserComment,
  isAdmin,
  isSafe
} = middleware;

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

//Index show all campgrounds
router.get('/', (req, res) => {
  if (req.query.search && req.xhr) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');

    //get all campgrounds from DB
    Campground.find({ name: regex }, (err, allCampgrounds) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json(allCampgrounds);
      }
    });
  } else {
    Campground.find({}, (err, allCampgrounds) => {
      if (err) {
        console.log(err);
      } else {
        if (req.xhr) {
          res.json(allCampgrounds);
        } else {
          res.render('campgrounds/index', {
            campgrounds: allCampgrounds,
            page: 'campgrounds'
          });
        }
      }
    });
  }
});

//Create - add new campground to DB
router.post('/', isLoggedIn, isSafe, (req, res) => {
  //get data from form and add the campgrounds array
  const name = req.body.name;
  const image = req.body.image;
  const desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, (err, data) => {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newCampground = {
      name: name,
      image: image,
      description: desc,
      cost: cost,
      author: author,
      location: location,
      lat: lat,
      lng: lng
    };
    //Create new campground and save it to database
    Campground.create(newCampground, (err, newlyCampground) => {
      if (err) {
        console.log(err);
      } else {
        //redirect back to campground page
        console.log(newlyCampground);
        res.redirect('/campgrounds');
      }
    });
  });
});

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

//Shows more info about the campground
router.get('/:id', (req, res) => {
  //find the campground with the id
  Campground.findById(req.param.id)
    .populate('comments')
    .exec((err, foundCampground) => {
      if (err || !foundCampground) {
        console.log(err);
        req.flash('error', 'Sorry that campground does not exists');
        return res.redirect('/campgrounds');
      }
      console.log(foundCampground);
      //render show template with that campgrounds
      res.render('/campgrounds/show', { campground: foundCampground });
    });
});

//Edit shows edit form
router.get('/:id/edit', isLoggedIn, checkUserCampground, (req, res) => {
  //render edit template witht that campground
  res.render('campgrounds/edit', { campground: req.campground });
});

//put updates campground in database
router.put('/:id', isSafe, (req, res) => {
  geocoder.geocode(req.body.location, (err, data) => {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    const newData = {
      name: req.body.name,
      image: req.body.image,
      description: req.body.description,
      cost: req.body.cost,
      location: location,
      lat: lat,
      lng: lng
    };
    Campground.findByIdAndUpdate(
      req.params.id,
      { $set: newData },
      (err, campground) => {
        if (err) {
          req.flash('error', err.message);
          res.redirect('back');
        } else {
          req.flash('success', 'Successfully Updated');
          res.redirect('/campgrounds/' + campground._id);
        }
      }
    );
  });
});

//Delete campground and its comments form DB
router.delete('/:id', isLoggedIn, checkUserCampground, (req, res) => {
  Comment.remove(
    {
      _id: {
        $in: req.campground.comments
      }
    },
    err => {
      if (err) {
        req.flash('error', err.message);
        res.redirect('/');
      } else {
        req.campground.remove(err => {
          if (err) {
            req.flash('error', err.message);
            return res.redirect('/');
          }
          req.flash('error', 'Campground Deleted!');
          res.redirect('/campgrounds');
        });
      }
    }
  );
});

module.exports = router;
