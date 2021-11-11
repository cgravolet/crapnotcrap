var Route = require("./Route");
var Crap  = Object.create(Route);

Crap.results = function (req, res, next) {
	var isJSON = arguments[4] === true ? true : false;
	var max    = 100;
	var page   = !arguments[3] || isNaN(arguments[3]) ? 1 : arguments[3];
	var skip   = max * (page - 1);
	var sort   = {"polls.0.votes": -1};
	var query  = {
		"polls.0.label": {$regex: /^[^not]*c+r+a+p+[^not]*$/i},
		"polls.0.votes": {$gt: 0}
	};
	var topics = this.topicsCollection();
	var cursor = topics.find(query).sort(sort).skip(skip).limit(max);

	cursor.count(function (err, count) {
		if (err) return next(err);

		cursor.toArray(function(err, items) {
			if (err) return next(err);

			var topics = this.utils.parseResults(items);

			if (isJSON === true) {
				res.send(topics);
				return;
			}

			res.render("results", {
				pagination: this.utils.getPaginationArray(count, max, page, req),
				title:      "The Crap List - Crap / Not Crap",
				topics:     topics
			});
		}.bind(this));
	}.bind(this));
};

Crap.resultsWithPage = function (req, res, next) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, next, page);
};

Crap.resultsJSON = function (req, res, next) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, next, page, true);
};

module.exports = Crap;