var Route   = require("./Route");
var NotCrap = Object.create(Route);

NotCrap.results = function (req, res, p) {
	var isJSON = arguments[3] === true ? true : false;
	var max    = 100;
	var page   = !p || isNaN(p) ? 1 : p;
	var skip   = max * (page - 1);
	var sort   = {"polls.0.votes": -1};
	var query  = {
		"polls.0.label": {$regex: /^.*n+.+c+r+a+p+.*$/i},
		"polls.0.votes": {$gt: 0}
	};
	var topics = this.topicsCollection();
	var cursor = topics.find(query).sort(sort).skip(skip).limit(max);

	cursor.count(function (err, count) {
		if (err) throw new Error(err);

		cursor.toArray(function(err, items) {
			if (err) throw new Error(err);

			var topics = this.utils.parseResults(items);

			if (isJSON === true) {
				res.send(topics);
				return;
			}

			res.render("results", {
				pagination: this.utils.getPaginationArray(count, max, page, req),
				title:      "The Not Crap List - Crap / Not Crap",
				topics:     topics
			});
		}.bind(this));
	}.bind(this));
};

NotCrap.resultsWithPage = function (req, res) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, page);
};

NotCrap.resultsJSON = function (req, res) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, page, true);
};

module.exports = NotCrap;