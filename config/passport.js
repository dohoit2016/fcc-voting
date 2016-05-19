var FacebookStrategy = require('passport-facebook').Strategy;

var configAuth = require('./auth');

module.exports = function (passport, User) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		})
	});

	passport.use(new FacebookStrategy({
		clientID: configAuth.facebook.clientID,
		clientSecret: configAuth.facebook.clientSecret,
		callbackURL: configAuth.facebook.callbackURL,
		profileFields: ['id', 'emails', 'name']
	}, function (accessToken, refreshToken, profile, cb) {
		// console.log(profile);
		User.findOne({
			facebookId: profile.id
		}, function (err, user) {
			if (err){
				return cb(err);
			}
			if (user){
				return cb(null, user);
			}
			var u = new User();
			u.facebookId = profile.id;
			u.name = profile.name.givenName + " " + profile.name.familyName;
			u.email = profile.emails[0].value;
			u.token = accessToken;
			u.save(function (err) {
				if (err){
					throw err;
				}
				return cb(null, u);
			})
		})
	}))
}