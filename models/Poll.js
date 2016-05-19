module.exports = function (mongoose) {
	var pollSchema = mongoose.Schema({
		userId: String,
		title: String,
		options: [{
			title: String,
			count: Number
		}]
	});
	var Poll = mongoose.model("Poll", pollSchema);
	return Poll;
}