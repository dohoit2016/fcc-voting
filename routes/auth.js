var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', {message: req.flash('loginMessage')});
});

router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));

router.get('/facebook/callback', passport.authenticate('facebook', {
	successRedirect: "/",
	failureRedirect: "/failure",
	failureFlash: true
}))

router.get('/success', function (req, res) {
	res.end("OK");
});

router.get('/logout', function (req, res) {
	req.logout();
	res.redirect("/");
})

module.exports = router;
