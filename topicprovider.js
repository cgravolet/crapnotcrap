var _DBURL = "mongodb://localhost:27017/crapnotcrap";
var mongo  = require('mongodb').MongoClient;

function TopicProvider() {
	var self = this;
	mongo.connect(_DBURL, function (err, db) {
		self.db = db;
	});
}

/*
 * Searches for topics by title
 */
TopicProvider.prototype.search = function(term, callback) {
	this.db.collection('topics', function(err, topic_collection) {
		if (err) {
			callback(error);
		} else {
			// Replaces space characters with a catch-all for any spaces
			term = term.trim().replace(/\s+/g, '\\s*');

			/* 
			 * Adds better support for searching with quotes, for instance
			 * searching for the band "UT" would be near impossible without
			 * this.
			 *
			 * @TODO this breaks down when searching for multiple quoted
			 *       keywords
			 */
			if (/".+"/.test(term)) {
				term = term.replace(/"(.*?)"/g, '(^|\\s+|")$1("|\\s+|$)');
			}

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

/**
 * Temporary solution for fixing an issue that causes HTML entities to be
 * escaped when passed to the jade template
 *
 * @private
 */
function cleanseTitle(title) {
	title = title.replace(/&quot;/gi, '"');
	title = title.replace(/&amp;/gi, '&');
	return title;
}

/**
 * Parses search results to do various cleanup tasks before sending to the
 * template, like sorting the polls by vote count and adding a boolean for
 * determining which poll is in the lead and calculating the widths of the poll
 * chart
 *
 * @private
 */
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
				poll.label = cleanseTitle(poll.label);
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
