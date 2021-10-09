var Route = require("./Route");
var Home  = Object.create(Route);

/**
 * Handles GET requests for the home page.
 *
 * @param {Object} req
 * @param {Object} res
 */
Home.get = function (req, res) {
	res.render("index", {title: "Crap / Not Crap"});
};

/**
 * Handles POST requests on the home page.
 *
 * @param {Object} req
 * @param {Object} res
 */
Home.post = function (req, res) {
	var term = req.body.search.replace(/[\<\>\\\(\);]+/gi,
			"").trim().toLowerCase().replace(/\//g, "_slash_");

	// If a search term is provided, redirect to the search page, ...
	if (term.length) {
		res.redirect("/search/" + encodeURIComponent(term));

	// ...otherwise redirect to the 'all results' page
	} else {
		res.redirect("/all");
	}
};

module.exports = Home;