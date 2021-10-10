var Route = {
	_topicsCollection: null,

	init: function (app) {
		this.app = app;

		if (!app) {
			throw new Error("Expected argument 'app'");
		}
		return this;
	},

	topicsCollection: function () {

		if (!this._topicsCollection) {
			this._topicsCollection = this.app.get("db").collection("topics");
		}
		return this._topicsCollection;
	},

	utils: {

		/**
		 * Temporary solution for fixing an issue that causes HTML entities to be
		 * escaped when passed to the pug template
		 *
		 * @param {String} title
		 * @private
		 */
		cleanseTitle: function (title) {
			title = title.replace(/&quot;/gi, '"');
			title = title.replace(/&amp;/gi, "&");
			return title;
		},

		getPaginationArray: function (total, max, page, req) {
			let currentPage, paginationObj;
			let pageCount = Math.ceil(total / max);
			let paginationArray = [];

			for (let i = 0; i < pageCount; i += 1) {
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
		},

		/**
		 * Parses search results to do various cleanup tasks before sending to the
		 * template, like sorting the polls by vote count and adding a boolean for
		 * determining which poll is in the lead and calculating the widths of the poll
		 * chart
		 *
		 * @param {Array} results
		 * @private
		 */
		parseResults: function (results) {
			results.forEach(function (topic) {
				const isArchived = topic.is_archived === false ? false : true;
				const forumId = isArchived ? 6 : 28;
				topic.url = "http://premierrockforum.com/viewtopic.php?f=" + forumId + "&t=" + topic.topicid;

				if (topic.polls && topic.polls.length) {
					let topVotes = topic.polls[0].votes;

					if (topic.polls.length > 1 && topVotes > topic.polls[1].votes) {
						topic.polls[0].leading = true;
					}

					topic.polls.forEach(function (poll) {
						poll.percentWidth = topVotes > 0 ? Math.round(poll.votes / topVotes * 100) : 0;
						poll.label = this.cleanseTitle(poll.label);
					}.bind(this));
				} else {
					topic.polls = [
						{label: "Crap", votes: 0, percentWidth: 0},
						{label: "Not Crap", votes: 0, percentWidth: 0},
					];
				}
			}.bind(this));
			return results;
		}
	}
};

module.exports = Route;