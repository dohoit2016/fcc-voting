module.exports = function (mongoose) {
	var voteSchema = mongoose.Schema({
		userId: String,
		ip: String,
		pollId: String
	});
	var Vote = mongoose.model("Vote", voteSchema);
	return Vote;
}