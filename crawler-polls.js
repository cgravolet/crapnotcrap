/**
 * Crawls the EA Crap/NotCrap forum for individual poll information one topic at
 * a time.
 *
 * @TODO:
 *     - Make this more extensible
 *     - Add support for ENV variables, like db info, delay, etc
 */

var _CNCURL = "http://www.electricalaudio.com/phpBB3/viewtopic.php?f=6&view=viewpoll&t=";
var _DBURL  = "mongodb://localhost:27017/crapnotcrap";
var db      = null;
var jsdom   = require("jsdom");
var mongo   = require("mongodb").MongoClient;
var request = require("request");
var topics  = null;

/**
 * Requests the topic content for a specific topic from the EA forum
 *
 * @param {Number} topicid The topic id, derp
 */
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

/**
 * Retrieves a list of topics that need to be updated from the database
 */
function getTopics() {
	var limit = {topicid: 1, _id: 0};
	var query = {update_required: true};

	db.collection("topics").find(query, limit).sort({votes: 1}).toArray(
			function (err, items) {
		topics = items;
		messageHandler("topicsRetrieved");
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
			messageHandler("dbConnectionOpened");
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

/**
 * Parses poll/vote information from the topic content that was retrieved from
 * the HTTP request of the EA forum
 *
 * @param {Object} window The jsdom window object
 * @param {Number} topicid The topic id
 */
function parseTopic(window, topicid) {
	var $       = window.$;
	var polls   = [];
	var result  = null;
	var subject = $(".content h2").text() || "";
	var votes   = 0;

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

/**
 * Decides whether or not to request a new topic, this get's called after each
 * topic has been parsed and controls the flow of the HTTP requests
 */
function requestTopic() {
	if (topics.length) {
		getTopicById(topics.pop().topicid);
	} else {
		shutdown();
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
 * Updates the document in the database with new information that was parsed
 * from the HTTP request
 *
 * @param {Number} topicid The id of the topic that should be updated
 * @param {String} subject The subject text of the poll
 * @param {Array} polls An array of poll objects {label:"",votes:0}
 * @param {Number} votes The total number of votes
 */
function updateTopic(topicid, subject, polls, votes) {
	var data = {
		polls_last_updated: new Date(),
		subject: subject,
		polls:   polls,
		update_required: false,
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
