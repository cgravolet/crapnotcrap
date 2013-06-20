(function () {
	"use strict";

	var _CNCURL, _DBURL, DB, jsdom, maxIndex, mongo, request, topics;

	_CNCURL = "http://www.electricalaudio.com/phpBB3/viewtopic.php?f=6&view=viewpoll&t=";
	_DBURL  = "mongodb://localhost:27017/crapnotcrap";
	DB      = null;
	jsdom   = require("jsdom");
	mongo   = require("mongodb").MongoClient;
	request = require("request");

	function getTopicById(topicid) {
		request(_CNCURL + topicid, function (err, res, body) {
			if (!err && res.statusCode === 200) {
				jsdom.env(body, ["http://code.jquery.com/jquery.js"], function (err, window) {
					if (!err) {
						messageHandler("topicContentRetrieved", {
							topicid: topicid,
							window: window
						});
					}
				});
			} else if (err) {
				console.dir(err);
			}
		});
	}

	function initialize() {
		mongo.connect(_DBURL, function (err, db) {
			if (err) {
				console.dir(err);
				shutdown();
			} else {
				DB = db;
				DB.collection("topics").find().toArray(function (err, items) {
					topics = items;
					messageHandler("topicsRetrieved");
				});
			}
		});
	}

	function messageHandler(name, message) {
		switch (name) {
		case "topicContentRetrieved":
			parseTopic(message.window.$, message.topicid);
			break;
		case "topicParsed":
			updateTopic(message.topicid, message.polls, message.votes);
			break;
		case "topicsRetrieved":
			requestLoop();
			break;
		}
	}

	function parseTopic($, topicid) {
		var polls, result, votes;

		polls = [];
		votes = 0;

		$(".polls .resultbar div").each(function () {
			result = parseFloat($(this).text());
			votes += result;
			polls.push({
				label: $(this).parent().parent().find("dt").text().trim(),
				votes: result
			})
		});
		messageHandler("topicParsed", {
			polls: polls,
			topicid: topicid,
			votes: votes
		});
	}

	function requestLoop() {
		var interval = setInterval(function () {
			if (topics.length) {
				var topic = topics.pop();
				getTopicById(topic.topicid);

				if (topics.length % 50 === 0) {
					console.log(topics.length + " remaining...");
				}
			} else {
				clearInterval(interval);
				setTimeout(function () {
					shutdown();
				}, 10000);
			}
		}, 750);
	}

	function shutdown() {
		console.log("End of program");
		process.exit();
	}

	function updateTopic(topicid, polls, votes) {
		var collection = DB.collection("topics");

		DB.collection("topics").update({topicid: topicid}, {$set: {
			polls: polls,
			votes: votes
		}}, {w:1}, function (err, result) {
			if (err) {
				console.dir(err);
			} else {
				console.log("Updated topic: " + topicid + " (" + votes + " votes)", polls);
			}
		});
	}

	initialize();
}());
