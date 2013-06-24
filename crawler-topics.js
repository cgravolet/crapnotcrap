/**
 * Crawls the EA Crap/NotCrap forum list pages to find new topics and update the
 * reply/view count of older topics
 *
 * @TODO:
 *     - Make this more extensible
 *     - Add support for ENV variables, like db info, delay, etc
 *     - set an update flag to be used by the poll crawler
 */

var _CNCURL  = "http://www.electricalaudio.com/phpBB3/viewforum.php?f=6&start=";
var _DBURL   = "mongodb://localhost:27017/crapnotcrap";
var curIndex = 0;
var db       = null;
var maxIndex = null;
var jsdom    = require("jsdom");
var mongo    = require("mongodb").MongoClient;
var request  = require("request");

/**
 * Retrieves the index of the last page of results so the crawler knows once
 * it's reached the end.
 *
 * @param {Object} $ A window.jQuery object for traversing the page
 */
function getMaxIndex($) {
	var max = $(".pagination span a:last").attr("href");
	if (max) {
		max = max.replace(/^.+start=([0-9]+).*$/, "$1");
		maxIndex = parseFloat(max);
		console.log("Max index is " + maxIndex);
	}
}

/**
 * Requests the page content from the EA crap/not crap forum at a specific index
 *
 * @param {Number} index
 */
function getTopicListAtIndex(index) {
	request(_CNCURL + index, function (err, res, body) {
		if (err) {
			console.dir(err);
		} else if (res.statusCode === 200) {
			messageHandler("topicListRetrieved");
			jsdom.env(body, ["http://code.jquery.com/jquery.js"], function (err, window) {
				if (err) {
					console.dir(err);
				} else {
					parseTopicList(window.$);
					window.close();
				}
			});
		}
	});
}

/**
 * Initialization method, opens a connection to the database
 */
function initialize() {
	mongo.connect(_DBURL, function (err, database) {
		if (err) {
			console.dir(err);
			shutdown();
		} else {
			db = database;
			messageHandler("dbConnectionEstablished");
		}
	});
}

/**
 * Inserts the topic into the database, this only gets called when an update
 * fails
 *
 * @param {Object} topic A document to be inserted into the database
 */
function insertTopic(topic) {
	db.collection("topics").insert(topic, {w:1}, function (err, result) {
		if (err) {
			console.dir(err);
		} else {
			console.log("Inserted topic: " + topic.topicid + " " + topic.title);
		}
	});
}

/**
 * Handles incoming messages, a router of sorts
 *
 * @param {String} name The message name
 * @param message Any data that needs to be passed along
 */
function messageHandler(name, message) {
	switch (name) {
		case "dbConnectionEstablished": // intentional fall-through
		case "topicListParsed":
			requestTopicList();
			break;
	}
}

/**
 * Parses the jsdom object to retrieve topic information from the HTTP request
 *
 * @param {Object} $ A window.jQuery object
 */
function parseTopic($) {
	var id    = $(".topictitle", this).attr("href").replace(/^.+t=([0-9]+).*$/i, "$1");
	var posts = $(".posts", this).text().replace(/[^0-9]+/g, "");
	var title = $(".topictitle", this).text();
	var views = $(".views", this).text().replace(/[^0-9]+/g, "");

	updateTopic({
		replies: parseFloat(posts),
		title:   title.trim(),
		topic_last_updated: new Date(),
		topicid: parseFloat(id),
		update_required: true,
		views:   parseFloat(views)
	});
}

/**
 * Parses the entire list of topics and hands individual topics off to the
 * parseTopic method for further... parsing.
 *
 * @param {Object} $ A window.jQuery object provided by jsdom
 */
function parseTopicList($) {
	if (!maxIndex) {
		getMaxIndex($);
	}

	$(".topics .row").not(".sticky, .announce").each(function () {
		parseTopic.call(this, $);
	});
	messageHandler("topicListParsed");
}

/**
 * Keeps track of the current index and decides whether or not to request a new
 * topic, this get's called after each topic has been parsed and controls the
 * flow of the HTTP requests
 */
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

/**
 * Shuts down the node process, adds a slight delay to make sure any
 * asynchronous database interactinos complete successfully
 */
function shutdown() {
	console.log("Shutting down...");
	setTimeout(function () {
		console.log("End of program");
		process.exit();
	}, 10000);
}

/**
 * Attempts to update information for a specific topic if it already exists in
 * the database, if this fails then it passes it on to the insertTopid method.
 *
 * @param {Object} topic
 */
function updateTopic(topic) {
	var data = {
		topic_last_updated: topic.topic_last_updated,
		replies: topic.replies,
		update_required: topic.update_required,
		views:   topic.views
	};
	db.collection("topics").update({topicid: topic.topicid}, {$set: data}, {w:1},
			function (err, result) {
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
