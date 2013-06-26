var TopicProvider = require("./../topicprovider").TopicProvider;
var topicProvider = new TopicProvider();

/*
 * GET search results page
 */
exports.results = function (req, res) {
	var term = req.params.term || "";
	term = term.replace(/_slash_/gi, "/");
	topicProvider.search(term, function(err, topics) {
		res.render("results", {
			term:   term,
			title:  "Search Results - Crap / Not Crap",
			topics: topics
		});
	});
};

exports.crap = function (req, res) {
	topicProvider.crap(function (err, topics) {
		res.render("results", {
			title: "The Crap List - Crap / Not Crap",
			topics: topics
		});
	});
};

exports.notcrap = function (req, res) {
	topicProvider.notcrap(function (err, topics) {
		res.render("results", {
			title: "The Not Crap List - Crap / Not Crap",
			topics: topics
		});
	});
};
