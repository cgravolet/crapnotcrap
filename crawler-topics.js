(function () {
	"use strict";

	var _CNCURL, _DBURL, DB, jsdom, maxIndex, mongo, request;

	_CNCURL = "http://www.electricalaudio.com/phpBB3/viewforum.php?f=6&start=";
	_DBURL  = "mongodb://localhost:27017/crapnotcrap";
	DB      = null;
	jsdom   = require("jsdom");
	mongo   = require("mongodb").MongoClient;
	request = require("request");

	function getMaxIndex($) {
		var max = $(".pagination span a:last").attr("href");
		if (max) {
			max = max.replace(/^.+start=([0-9]+).*$/, "$1");
			maxIndex = parseFloat(max);
			console.log("Max index is " + maxIndex);
		}
	}

	function getTopicListAtIndex(index) {
		request(_CNCURL + index, function (err, res, body) {
			if (!err && res.statusCode === 200) {
				jsdom.env(body, ["http://code.jquery.com/jquery.js"], parseTopicList);
			} else if (err) {
				console.dir(err);
			}
		});
	}

	function initialize() {
		mongo.connect(_DBURL, function (err, db) {
			var currentIndex, interval;

			if (err) {
				console.dir(err);
				shutdown();
			} else {
				DB = db;
				currentIndex = 0;

				getTopicListAtIndex(currentIndex);

				interval = setInterval(function () {
					currentIndex += 50;

					if ( (maxIndex && currentIndex > maxIndex) ||
							(!maxIndex && currentIndex > 200) ) {
						console.log("Shutting down");
						clearInterval(interval);
						setTimeout(shutdown, 60000);
					} else {
						console.log("Retrieving topics at index: " + currentIndex +
								"/" + maxIndex);
						getTopicListAtIndex(currentIndex);
					}
				}, 3000);
			}
		});
	}

	function insertTopic(topic) {
		var collection = DB.collection("topics");

		collection.insert(topic, {w:1}, function (err, result) {
			if (err) {
				console.dir(err);
			} else {
				console.log("Inserted topic: " + topic.topicid + " " + topic.title);
			}
		});
	}

	function parseTopic($) {
		var id, posts, title, views;

		id    = $(".topictitle", this).attr("href").replace(/^.+t=([0-9]+).*$/i, "$1");
		posts = $(".posts", this).text().replace(/[^0-9]+/g, "");
		title = $(".topictitle", this).text();
		views = $(".views", this).text().replace(/[^0-9]+/g, "");

		updateTopic({
			replies: parseFloat(posts),
			title:   title.trim(),
			topicid: parseFloat(id),
			views:   parseFloat(views)
		});
	}

	function parseTopicList(err, window) {
		if (!err) {

			if (!maxIndex) {
				getMaxIndex(window.$);
			}
			window.$(".topics .row").not(".sticky, .announce").each(function () {
				parseTopic.call(this, window.$);
			});
		} else {
			console.dir(err);
		}
	}

	function shutdown() {
		console.log("End of program");
		process.exit();
	}

	function updateTopic(topic) {
		var collection = DB.collection("topics");

		collection.update({topicid: topic.topicid}, {$set: {
			replies: topic.replies,
			views:   topic.views
		}}, {w:1}, function (err, result) {
			if (err) {
				console.dir(err);
			} else if (result === 0) {
				insertTopic(topic);
			} else {
				console.log("Updated topic: " + topic.topicid + " " + topic.title)
			}
		});
	}

	initialize();
}());
