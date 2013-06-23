/*
 * GET search results page
 */
var TopicProvider = require('./../topicprovider').TopicProvider;
var topicProvider = new TopicProvider();

exports.results = function (req, res) {
	topicProvider.search(req.params.term, function(err, topics) {
		res.render('results', {
			term: req.params.term,
			title: 'Search Results - Crap / Not Crap',
			topics: topics
		});
	});
};
