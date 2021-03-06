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
var args     = process.argv.slice(2);
var curIndex = 0;
var db       = null;
var maxIndex = null;
var jsdom    = require("jsdom");
var mongo    = require("mongodb").MongoClient;
var request  = require("request");
var single   = args.indexOf("single") >= 0;

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
    var topic = {
		replies: parseFloat(posts),
		title:   title.trim(),
		topic_last_updated: new Date(),
		topicid: parseFloat(id),
		update_required: true,
		views:   parseFloat(views)
	};

    if (topic.topicid == 62843) {
        return;
    }

    // Try to parse the date of most recent post
    var lastPostDate    = null;
    var lastPostDateRE  = /[A-Z]{3}\s[A-Z]{3,}\s[0-9]+,\s[0-9]{4}\s[0-9:]+\s[A-Z]{2}/i;
    var lastPostDateArr = $(".lastpost", this).text().match(lastPostDateRE);
    
    if (lastPostDateArr.length) {
        topic.last_reply_datetime = new Date(lastPostDateArr[0]);
    }
    updateTopic(topic);
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
			(!maxIndex && curIndex > 200) ||
			(single && curIndex > 0) ) {
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
 * asynchronous database interactions complete successfully
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
 * the database, if this fails then it passes it on to the insertTopic method.
 *
 * @param {Object} topic
 */
function updateTopic(topic) {
	db.collection("topics").update({topicid: topic.topicid}, {$set: topic},
			{upsert:true, w:1}, function (err, result) {
		if (err) {
			console.dir(err);
		} else {
			console.log("Document saved: " + topic.topicid + " | " + topic.title)
		}
	});
}

initialize();

