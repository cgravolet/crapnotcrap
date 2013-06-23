var _CNCURL, _DBURL, DB, jsdom, mongo, request, topics;

_CNCURL = "http://www.electricalaudio.com/phpBB3/viewtopic.php?f=6&view=viewpoll&t=";
_DBURL  = "mongodb://localhost:27017/crapnotcrap";
DB      = null;
jsdom   = require("jsdom");
mongo   = require("mongodb").MongoClient;
request = require("request");

function getTopicById(topicid) {
	console.log(topicid + " Retrieving topic " + topics.length + "...");
	request(_CNCURL + topicid, function (err, res, body) {
		if (!err && res.statusCode === 200) {
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
			DB.collection("topics").find({subject: {$exists:false}},
					{topicid: 1, _id: 0}).sort({votes:1}).toArray(function (err, items) {
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

	DB.collection("topics").update({topicid: topicid}, {$set: data}, {w:1},
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
