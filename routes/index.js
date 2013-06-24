/*
 * GET home page
 */
exports.index = function (req, res){
  res.render("index", {title: "Crap / Not Crap"});
};

/*
 * POST home page
 */
exports.search = function (req, res) {
	var term = req.body.search.replace(/[\\\(\);]+/gi, "").trim();
	term = term.toLowerCase().replace(/\//g, "_slash_");
	res.redirect("/search/" + encodeURIComponent(term));
};
