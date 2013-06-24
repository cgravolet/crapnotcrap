/**
 * Crawls the EA Crap/NotCrap forum for individual poll information one topic at
 * a time.
 *
 * @TODO:
 *     - Make this more extensible
 *     - Add support for ENV variables, like db info, delay, etc
 */

var _CNCURL, _DBURL, db, jsdom, mongo, request, topics;

_CNCURL = "http://www.electricalaudio.com/phpBB3/viewtopic.php?f=6&view=viewpoll&t=";
_DBURL  = "mongodb://localhost:27017/crapnotcrap";
db      = null;
jsdom   = require("jsdom");
mongo   = require("mongodb").MongoClient;
request = require("request");

function getTopicById(topicid) {
	console.log(topicid + " Retrieving topic " + topics.length + "...");
	request(_CNCURL + topicid, function (err, res, body) {
		if (err) {
			console.dir(err);
		} else if (res.statusCode === 200) {
			jsdom.env(body, ["./public/js/lib/jquery-1.10.1.js"], function (err, window) {
				if (err) {
					console.dir(err);
				} else {
					messageHandler("topicContentRetrieved", {
						topicid: topicid,
						window:  window
					});
				}
			});
		}
	});
}

function getTopics() {
	var limit, query, start;

	start = new Date();
	start.setDate(start.getDate()-2);
	limit = {topicid: 1, _id: 0};
	query = {
		topic_last_updated: {
			$gte: start,
			$lt: new Date()
		}
	};

	db.collection("topics").find(query, limit).sort({topic_last_updated: 1}).toArray(
			function (err, items) {
		topics = items;
		messageHandler("topicsRetrieved");
	});
}

function initialize() {
	mongo.connect(_DBURL, function (err, database) {
		if (err) {
			console.dir(err);
			shutdown();
		} else {
			db = database;
			messageHandler("dbConnectionOpened");
		}
	});
}

function messageHandler(name, message) {
	switch (name) {
	case "dbConnectionOpened":
		getTopics();
		break;
	case "topicContentRetrieved":
		console.log(message.topicid + " " + name);
		parseTopic(message.window, message.topicid);
		break;
	case "topicParsed":
		console.log(message.topicid + " " + name);
		updateTopic(message.topicid, message.subject, message.polls, message.votes);
		break;
	case "topicsRetrieved":
		console.log(name);
		requestTopic();
		break;
	case "topicUpdated":
		console.log(message.topicid + " " + name + " | " + message.votes +
				" votes | " + JSON.stringify(message.polls));
		console.log("----------");
		requestTopic();
		break;
	}
}

function parseTopic(window, topicid) {
	var $, polls, result, votes;

	$       = window.$;
	polls   = [];
	subject = $(".content h2").text() || "";
	votes   = 0;

	$(".polls .resultbar div").each(function () {
		result = parseFloat($(this).text());
		votes += result;
		polls.push({
			label: $(this).parent().parent().find("dt").text().trim(),
			votes: result
		})
	});

	messageHandler("topicParsed", {
		subject: subject.trim(),
		polls:   polls,
		topicid: topicid,
		votes:   votes
	});

	polls = null;
	window.close();
}

function requestTopic() {
	if (topics.length) {
		getTopicById(topics.pop().topicid);
	} else {
		shutdown();
	}
}

function shutdown() {
	console.log("Shutting down...");
	setTimeout(function () {
		console.log("End of program");
		process.exit();
	}, 10000);
}

function updateTopic(topicid, subject, polls, votes) {
	var data = {
		polls_last_updated: new Date(),
		subject: subject,
		polls:   polls,
		votes:   votes
	};

	db.collection("topics").update({topicid: topicid}, {$set: data}, {w:1},
			function (err, result) {
		if (err) {
			console.dir(err);
		} else {
			messageHandler("topicUpdated", {
				polls:   polls,
				topicid: topicid,
				votes:   votes
			});
		}
	});
}

initialize();
