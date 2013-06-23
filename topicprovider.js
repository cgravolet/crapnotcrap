var _DBURL = "mongodb://localhost:27017/crapnotcrap";
var mongo  = require('mongodb').MongoClient;

TopicProvider = function() {
	var self = this;
	mongo.connect(_DBURL, function (err, db) {
		self.db = db;
	});
};

//find all topics
TopicProvider.prototype.search = function(term, callback) {
	this.db.collection('topics', function(err, topic_collection) {
		if (err) {
			callback(error);
		} else {
			term = term.trim().replace(/\s+/g, '\\s+');
			topic_collection.find({title: {$regex: new RegExp(term, "i")}}).sort(
					{votes:-1}).limit(100).toArray(function(err, results) {
				if (err) {
					callback(error);
				} else {
					callback(null, parseResults(results));
				}
			});
		}
	});
};

function parseResults(results) {
	results.forEach(function (item) {
		if (item.polls && item.polls.length) {
			item.polls.sort(function (a, b) {
				if (a.votes > b.votes) {
					return -1;
				}
				return 1;
			});

			if (item.polls.length > 1 && item.polls[0].votes > item.polls[1].votes) {
				item.polls[0].leading = true;
			}
			
			var topVotes = item.polls[0].votes;
			item.polls.forEach(function (poll) {
				poll.percentWidth = Math.round(poll.votes / topVotes * 100);
			});
		} else {
			item.polls = [
				{label: "Crap", votes: 0},
				{label: "Not Crap", votes: 0},
			];
		}
	});
	return results;
}

exports.TopicProvider = TopicProvider;
