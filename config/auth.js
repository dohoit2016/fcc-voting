module.exports = {
	'facebook': {
		clientID: process.env.FB_CLIENTID,
		clientSecret: process.env.FB_CLIENT_SECRET,
		callbackURL: 'https://fcc-0127-voting.herokuapp.com/auth/facebook/callback',
	}
}