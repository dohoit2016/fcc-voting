var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('mypolls')
});

router.get('/mypolls', isLoggedIn, function (req, res) {
	res.end("building");
})

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	return res.redirect("/");
}

module.exports = router;
