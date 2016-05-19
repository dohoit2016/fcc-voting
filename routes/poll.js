var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var User = mongoose.model('User');
var Vote = mongoose.model('Vote');
var async = require('async');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('mypolls')
});

router.get('/view/:id', function (req, res) {
	Poll.findById(req.params.id, function (err, poll) {
		if (err){
			console.log(err);
			res.redirect('/');
			return;
		}
		if (poll){
			res.status(200);
			res.render('viewpoll', {
				title: poll.title, 
				user: req.user, 
				poll: poll, 
				appid: require('../config/auth').facebook.clientID, 
				url: "http://" + req.headers.host + "/poll" + req.url,
				errorMessage: req.flash("errorMessage")
			});
			req.session.errorMessage = '';
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
	var options = req.body.options.trim().split("\n");
	for (var i = 0; i < options.length; i++) {
		if (options[i].trim().length > 0){
			newPoll.options.push({
				title: options[i].trim(),
				count: 0
			});
		}
	}
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

		async.series([
			function (callback) {
				// Check if user voted for this poll or not.
				console.log("start checking user");
				if (req.user){
					Vote.find({
						userId: req.user.id,
						pollId: pollId
					}, function (err, votes) {
						if (err){
							throw err;
						}
						if (votes && (votes.length > 0)){
							console.log('user voted');
							req.flash("errorMessage", "This user has already voted for this poll.");
							res.redirect("/poll/view/" + pollId);
							callback(new Error("Err: user voted"), 1);
							return;
						}
						console.log("user done.");
						callback(null, 1);

						// not here.
					})

					// must return here.
					return;
				}
				callback(null, 1);
			},
			function (callback) {
				console.log("start checking ip");
				// Get IP
				var ipAddr = req.headers["x-forwarded-for"];
				if (ipAddr){
					var list = ipAddr.split(",");
					ipAddr = list[list.length-1];
				} else {
					ipAddr = req.connection.remoteAddress;
				}
				Vote.find({
					ip: ipAddr,
					pollId: pollId
				}, function (err, votes) {
					if (err){
						throw err;
					}
					if(votes && votes.length > 0){
						console.log('ip voted');
						req.flash("errorMessage", "This IP has already voted for this poll.");
						res.redirect('/poll/view/' + pollId);
						callback(new Error("Err: ip voted"), 2);
						return;
					}
					console.log("ip done.");
					callback(null, 2);
				})
			},
			function (callback) {
				console.log("start adding vote.");
				// Get IP
				var ipAddr = req.headers["x-forwarded-for"];
				if (ipAddr){
					var list = ipAddr.split(",");
					ipAddr = list[list.length-1];
				} else {
					ipAddr = req.connection.remoteAddress;
				}
				var vote = new Vote();
				vote.ip = ipAddr;
				vote.pollId = pollId;
				if (req.user){
					vote.userId = req.user.id;
				}
				vote.save();
				if (votefor == '-1'){
					poll.options.push({
						title: customOption,
						count: 1
					});
					poll.save(function (err, poll) {
						if (err){
							throw err;
						}
						console.log("ok. new option");
						// res.redirect('/poll/view/' + pollId);
						callback(new Error("Err: new option"), 3);
					});
					return;
				}
				var check = true;
				for (var i = 0; i < poll.options.length; i++) {
					if (poll.options[i].id == votefor){
						check = false;
						poll.options[i].count++;
						poll.save(function (err, poll) {
							if (err){
								throw err;
							}
							console.log("ok. voted");
							callback(null, 3);
						});
						return;
					}
				}
				if (check){
					callback(null, 3);
				}
			}
		], function (err, result) {
			if (err){
				console.log(err);
				return;
			}
			console.log("ok. finally");
			return res.redirect("/poll/view/" + pollId);
		})
	})
});



function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	return res.redirect("/");
}

module.exports = router;
