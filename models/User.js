module.exports = function (mongoose) {
	var userSchema = mongoose.Schema({
		facebookId: String,
		name: String,
		email: String,
		token: String
	});
	var User = mongoose.model("User", userSchema);
	return User;
}