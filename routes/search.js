/*
 * GET search results page
 */
var TopicProvider = require('./../topicprovider').TopicProvider;
var topicProvider = new TopicProvider();

exports.results = function (req, res) {
	var term = req.params.term || '';
	term = term.replace(/_slash_/gi, '/');
	topicProvider.search(term, function(err, topics) {
		res.render('results', {
			term:   term,
			title:  'Search Results - Crap / Not Crap',
			topics: topics
		});
	});
};
