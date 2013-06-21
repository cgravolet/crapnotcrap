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
		console.log(topicid + " Retrieving topic...");
		request(_CNCURL + topicid, function (err, res, body) {
			if (!err && res.statusCode === 200) {
				jsdom.env(body, ["./public_html/js/lib/jquery-1.10.1.js"], function (err, window) {
					if (err) {
						console.dir(err);
					} else {
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
				messageHandler("dbConnectionOpened");
				DB.collection("topics").find({polls: {$exists:false}}).toArray(function (err, items) {
					topics = items;
					messageHandler("topicsRetrieved");
				});
			}
		});
	}

	function messageHandler(name, message) {
		switch (name) {
		case "topicContentRetrieved":
			console.log(message.topicid + " " + name);
			parseTopic(message.window.$, message.topicid);
			requestTopic();
			break;
		case "topicParsed":
			console.log(message.topicid + " " + name);
			updateTopic(message.topicid, message.polls, message.votes);
			break;
		case "topicsRetrieved":
			console.log(name);
			requestTopic();
			break;
		case "topicUpdated":
			console.log(message.topicid + " " + name + " | " + message.votes +
					" votes | " + JSON.stringify(message.polls));
			console.log(topics.length + " topics remain...");
			console.log("----------");
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

	function requestTopic() {
		if (topics.length) {
			var topic = topics.pop();
			setTimeout(function () {
				getTopicById(topic.topicid);
			}, 750);
		} else {
			shutdown();
		}
	}

	function shutdown() {
		console.log("Shutting down...");
		setTimeout(function () {
			console.log("End of program");
			process.exit();
		}, 30000);
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
				messageHandler("topicUpdated", {
					polls: polls,
					topicid: topicid,
					votes: votes
				});
			}
		});
	}

	initialize();
}());
