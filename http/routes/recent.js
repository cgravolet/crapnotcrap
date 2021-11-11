var Route  = require("./Route");
var Recent = Object.create(Route);

Recent.results = function (req, res, next) {
	var isJSON = arguments[4] === true ? true : false;
	var max    = 100;
	var page   = !arguments[3] || isNaN(arguments[3]) ? 1 : arguments[3];
	var skip   = max * (page - 1);
	var sort   = {is_archived: 1, reply_datetime: -1};
	var query  = {};
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
				title:      "The Most Recent List - Crap / Not Crap",
				topics:     topics
			});
		}.bind(this));
	}.bind(this));
};

Recent.resultsWithPage = function (req, res, next) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, next, page);
};

Recent.resultsJSON = function (req, res, next) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, next, page, true);
};

module.exports = Recent;
