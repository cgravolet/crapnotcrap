var Route  = require("./Route");
var Search = Object.create(Route);

/**
 * When no search term is provided, redirect to /all
 *
 * @param {Object} req
 * @param {Object} res
 */
Search.noTerm = function (req, res) {
	res.redirect("/all");
};

/**
 * Gets results for a search term and sends them to the results view.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Number} (page)
 */
Search.results = function (req, res, next) {
	var isJSON = arguments[4] === true ? true : false;
	var max    = 100;
	var page   = !arguments[3] || isNaN(arguments[3]) ? 1 : arguments[3];
	var skip   = max * (page - 1);
	var sort   = {is_archived: 1, votes: -1};
	var term   = (req.params.term || "").replace(/_slash_/gi, "/");
	var topics = this.topicsCollection();
	var query  = {title: {$regex: newRegexpFrom(term)}};
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
				term:       term,
				title:      term + " - Crap / Not Crap",
				topics:     topics
			});
		}.bind(this));
	}.bind(this));
};

/**
 * Validates the page parameter before passing the request to the term method.
 *
 * @param {Object} req
 * @param {Object} res
 */
Search.resultsWithPage = function (req, res, next) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, next, page);
};

Search.resultsJSON = function (req, res, next) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}
	this.results(req, res, next, page, true);
};

/**
 * Helper function to create a regular expression object based off of a search
 * term.
 *
 * @param {String} term
 * @returns {RegExp}
 */
function newRegexpFrom(term) {

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
	return new RegExp(term, "i");
}

module.exports = Search;