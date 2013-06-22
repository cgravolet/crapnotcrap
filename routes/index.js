/*
 * GET home page.
 */
var TopicProvider = require('./../topicprovider').TopicProvider;
var topicProvider = new TopicProvider();

exports.index = function(req, res){
  res.render('index', { title: 'Crap / Not Crap' });
};

exports.search = function (req, res) {
	topicProvider.search(req.body.search, function(err, topics) {
		res.render('results', {term: req.body.search, topics: topics});
	});
};
