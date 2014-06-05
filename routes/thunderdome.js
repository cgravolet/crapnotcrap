var Route       = require("./Route");
var Thunderdome = Object.create(Route);

Thunderdome.results = function (req, res, p) {
	var isJSON = arguments[3] === true ? true : false;
	var max    = 100;
	var page   = !p || isNaN(p) ? 1 : p;
	var skip   = max * (page - 1);
	var sort   = {votes: -1};
	var query  = {"title": {$regex: /(dome.*[:;-]+|\s+vs\.*\s+|either\s*\/\s*or)/i}};
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
				title:      "Thunderdomes - Crap / Not Crap",
				topics:     topics
			});
		}.bind(this));
	}.bind(this));
};

Thunderdome.resultsWithPage = function (req, res) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, page);
};

Thunderdome.resultsJSON = function (req, res) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, page, true);
};

module.exports = Thunderdome;