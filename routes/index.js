/*
 * GET home page.
 */
exports.index = function (req, res){
  res.render('index', {title: 'Crap / Not Crap'});
};

exports.search = function (req, res) {
	var term = req.body.search.replace(/[\\\(\);]+/gi, '').trim();
	term = term.replace(/\//g, '_slash_');
	res.redirect('/search/' + encodeURIComponent(term));
};
