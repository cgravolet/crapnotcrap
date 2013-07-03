var TopicProvider = require("./../topicprovider").TopicProvider;
var topicProvider = new TopicProvider();
var max = 100;

/*
 * GET search results page
 */

exports.all = function (req, res) {
	var page = getPage(req);

	topicProvider.search("", function (err, topics) {
		res.render("results", {
			pagination: getPaginationArray(topics.length, max, page, req),
			title:  "All Results - Crap / Not Crap",
			topics: topics.slice(page * max - max, page * max)
		});
		topics = null;
	});
};

exports.crap = function (req, res) {
	var page = getPage(req);

	topicProvider.crap(function (err, topics) {
		res.render("results", {
			pagination: getPaginationArray(topics.length, max, page, req),
			title: "The Crap List - Crap / Not Crap",
			topics: topics.slice(page * max - max, page * max),
			url: req.url
		});
		topics = null;
	});
};

exports.notcrap = function (req, res) {
	var page = getPage(req);

	topicProvider.notcrap(function (err, topics) {
		res.render("results", {
			pagination: getPaginationArray(topics.length, max, page, req),
			title: "The Not Crap List - Crap / Not Crap",
			topics: topics.slice(page * max - max, page * max)
		});
		topics = null;
	});
};

exports.term = function (req, res) {
	var page = getPage(req);
	var term = (req.params.term || "").replace(/_slash_/gi, "/");

	if (!term) {
		res.redirect("/all");
	}

	topicProvider.search(term, function(err, topics) {
		res.render("results", {
			pagination: getPaginationArray(topics.length, max, page, req),
			term:   term,
			title:  "Search Results - Crap / Not Crap",
			topics: topics.slice(page * max - max, page * max)
		});
		topics = null;
	});
};

exports.thunderdome = function (req, res) {
	var page = getPage(req);

	topicProvider.thunderdome(function (err, topics) {
		res.render("results", {
			pagination: getPaginationArray(topics.length, max, page, req),
			title: "Thunderdomes - Crap / Not Crap",
			topics: topics.slice(page * max - max, page * max)
		});
		topics = null;
	});
};

function getPage(req) {
	var page = req.params.page || 1;

	if (typeof page === "string") {
		page = parseFloat(page.replace(/[^0-9]+/g, "")) || 1;
	}

	return page;
}

function getPaginationArray(total, max, page, req) {
	var currentPage, i, pageCount, paginationArray, paginationObj;

	pageCount = Math.ceil(total / max);
	paginationArray = [];

	for (i = 0; i < pageCount; i += 1) {
		currentPage = i + 1;
		paginationObj = {
			label: currentPage,
		};

		if (currentPage !== page) {
			paginationObj.url = req.url.replace(/\/[0-9]*\/?$/, "") + "/" + currentPage;
		} else {
			paginationObj.selected = true;
		}

		if ( (currentPage - page >= -3 && currentPage - page <= 3) ||
				(page <= 1 && currentPage - page <= 4) ||
				(currentPage === 1 || currentPage === pageCount) ) {
			paginationArray.push(paginationObj);
		} else if (currentPage === 2 || currentPage === pageCount - 1) {
			paginationArray.push({label: "..."});
		}
	}

	return paginationArray;
}
