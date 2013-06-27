var _DBURL = "mongodb://localhost:27017/crapnotcrap";
var mongo  = require("mongodb").MongoClient;

function TopicProvider() {
	var self = this;
	mongo.connect(_DBURL, function (err, db) {
		self.db = db;
	});
}

TopicProvider.prototype.crap = function (callback) {
	var query = {"polls.0.label": {$regex: /^[^not]*c+r+a+p+[^not]*$/i}};
	var sort  = {"polls.0.votes": -1};
	this.db.collection("topics").find(query).sort(sort).limit(100).toArray(
			function (err, results) {
		if (err) {
			callback(err);
		} else {
			callback(null, parseResults(results));
		}
	});
};

TopicProvider.prototype.notcrap = function (callback) {
	var query = {"polls.0.label": {$regex: /^.*n+.+c+r+a+p+.*$/i}};
	var sort  = {"polls.0.votes": -1};
	this.db.collection("topics").find().sort(sort).limit(100).toArray(
			function (err, results) {
		if (err) {
			callback(err);
		} else {
			callback(null, parseResults(results));
		}
	});
};

/*
 * Searches for topics by title
 */
TopicProvider.prototype.search = function(term, callback) {

	// Replaces space characters with a catch-all for any spaces
	term = term.trim().replace(/\s+/g, "\\s*");

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

	var query = {title: {$regex: new RegExp(term, "i")}};
	var sort  = {votes:-1};

	this.db.collection("topics").find(query).sort(sort).limit(100).toArray(
			function(err, results) {
		if (err) {
			callback(err);
		} else {
			callback(null, parseResults(results));
		}
	});
};

TopicProvider.prototype.thunderdome = function (callback) {
	var query = {"title": {$regex: /(dome.*[:;-]+|\s+vs\.*\s+|either\s*\/\s*or)/i}};
	var sort =  {votes: -1};

	this.db.collection("topics").find(query).sort(sort).limit(100).toArray(
			function (err, results) {
		if (err) {
			callback(err);
		} else {
			callback(null, parseResults(results));
		}
	});
};

/**
 * Temporary solution for fixing an issue that causes HTML entities to be
 * escaped when passed to the jade template
 *
 * @param {String} title
 * @private
 */
function cleanseTitle(title) {
	title = title.replace(/&quot;/gi, '"');
	title = title.replace(/&amp;/gi, "&");
	return title;
}

/**
 * Parses search results to do various cleanup tasks before sending to the
 * template, like sorting the polls by vote count and adding a boolean for
 * determining which poll is in the lead and calculating the widths of the poll
 * chart
 *
 * @param {Array} results
 * @private
 */
function parseResults(results) {
	results.forEach(function (item) {

		if (item.polls && item.polls.length) {
			var topVotes = item.polls[0].votes;

			if (item.polls.length > 1 && topVotes > item.polls[1].votes) {
				item.polls[0].leading = true;
			}
			
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
