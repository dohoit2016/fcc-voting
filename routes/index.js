var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var User = mongoose.model('User');

/* GET home page. */
router.get('/', function(req, res, next) {
	Poll.find({}, function (err, polls) {
		if (err){
			throw err;
		}
		console.log(polls);
		polls.reverse();
		res.render('index', {title: "FCC Voting", polls: polls, user: req.user, message: req.flash('loginMessage')});
	})
	// res.render('index', { title: 'Express', user: req.user, });
});

module.exports = router;
