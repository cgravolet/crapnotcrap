"use strict";

var _CNCURL, _DBURL, _DB, curIndex, jsdom, maxIndex, mongo, request;

_CNCURL  = "http://www.electricalaudio.com/phpBB3/viewforum.php?f=6&start=";
_DBURL   = "mongodb://localhost:27017/crapnotcrap";
curIndex = 0;
_DB      = null;
jsdom    = require("jsdom");
mongo    = require("mongodb").MongoClient;
request  = require("request");

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
			messageHandler("topicListRetrieved");
			jsdom.env(body, ["http://code.jquery.com/jquery.js"], parseTopicList);
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
			_DB = db;
			messageHandler("dbConnectionEstablished");
		}
	});
}

function insertTopic(topic) {
	_DB.collection("topics").insert(topic, {w:1}, function (err, result) {
		if (err) {
			console.dir(err);
		} else {
			console.log("Inserted topic: " + topic.topicid + " " + topic.title);
		}
	});
}

function messageHandler(name, message) {
	switch (name) {
		case "dbConnectionEstablished": // intentional fall-through
		case "topicListParsed":
			requestTopicList();
			break;
	}
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
	if (err) {
		console.dir(err);
	} else {

		if (!maxIndex) {
			getMaxIndex(window.$);
		}
		messageHandler("topicListParsed");
		window.$(".topics .row").not(".sticky, .announce").each(function () {
			parseTopic.call(this, window.$);
		});
		window.close();
	}
}

function requestTopicList() {
	if ( (maxIndex && curIndex > maxIndex) ||
			(!maxIndex && curIndex > 200) ) {
		shutdown();
	} else {
		console.log("Retrieving topics at index: " + curIndex +
				"/" + maxIndex);
		getTopicListAtIndex(curIndex);
		curIndex += 50;
	}
}

function shutdown() {
	console.log("Shutting down...");
	setTimeout(function () {
		console.log("End of program");
		process.exit();
	}, 30000);
}

function updateTopic(topic) {
	_DB.collection("topics").update({topicid: topic.topicid}, {$set: {
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
