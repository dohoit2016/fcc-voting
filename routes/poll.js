var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('mypolls')
});

router.get('/view/:id', function (req, res) {
	Poll.findById(req.params.id, function (err, poll) {
		if (err){
			throw err;
		}
		if (poll){
			res.status(200);
			res.render('viewpoll', {title: poll.title, user: req.user, poll: poll, appid: require('../config/auth').facebook.clientID, url: "http://" + req.headers.host + req.url});
			return;
		}
		res.redirect("/");
	})
});

router.get('/delete/:id', isLoggedIn, function (req, res) {
	var pollId = req.params.id;
	Poll.findById(pollId, function (err, poll) {
		if (err){
			throw err;
		}
		if (poll.userId != req.user.id){
			return res.redirect('/poll/view/' + pollId);
		}
		poll.remove(function (err, poll) {
			if (err){
				throw err;
			}
			res.redirect('/poll/mypolls');
		})
	})
})

router.get('/mypolls', isLoggedIn, function (req, res) {
	console.log(req.user);
	var userId = req.user.id;
	Poll.find({
		userId: userId
	}, function (err, polls) {
		if (err){
			throw err;
		}
		polls.reverse();
		console.log(polls);
		// res.json(polls);
		// return;
		res.render('mypolls.ejs', {title: "My Polls", polls: polls, user: req.user});
	})
});

router.get('/newpoll', isLoggedIn, function (req, res) {
	res.render('newpoll', {title: 'New Poll', user: req.user});
});

router.post('/newpoll', isLoggedIn, function (req, res) {
	var newPoll = new Poll();
	newPoll.userId = req.user.id;
	newPoll.title = req.body.title;
	newPoll.options = [];
	var options = req.body.options.split("\n");
	for (var i = 0; i < options.length; i++) {
		newPoll.options.push({
			title: options[i].trim(),
			count: 0
		});
	};
	newPoll.save(function (err, poll) {
		res.redirect('/poll/view/' + poll.id);
	})
});

router.post('/vote', function (req, res) {
	console.log(req.body);
	var pollId = req.body.pollId;
	var votefor = req.body.votefor;
	var customOption = req.body['custom-option'];
	Poll.findById(pollId, function (err, poll) {
		if (err){
			throw err
		}
		if (!poll){
			return res.redirect("view/" + pollId);
		}
		if (votefor == '-1'){
			poll.options.push({
				title: customOption,
				count: 0
			});
			poll.save(function (err, poll) {
				if (err){
					throw err;
				}
				return res.redirect('view/' + pollId);
			});
			return;
		}
		for (var i = 0; i < poll.options.length; i++) {
			if (poll.options[i].id == votefor){
				poll.options[i].count++;
				poll.save(function (err, poll) {
					if (err){
						throw err;
					}
					return res.redirect("view/" + pollId);
				})
			}
		};
	})
});



function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	return res.redirect("/");
}

module.exports = router;
