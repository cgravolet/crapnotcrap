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
		 * escaped when passed to the jade template
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
			var currentPage, i, pageCount, paginationArray, paginationObj;

			pageCount = Math.ceil(total / max);
			paginationArray = [];

			for (i = 0; i < pageCount; i += 1) {
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
			results.forEach(function (item) {

				if (item.polls && item.polls.length) {
					var topVotes = item.polls[0].votes;

					if (item.polls.length > 1 && topVotes > item.polls[1].votes) {
						item.polls[0].leading = true;
					}

					item.polls.forEach(function (poll) {
						poll.percentWidth = Math.round(poll.votes / topVotes * 100);
						poll.label = this.cleanseTitle(poll.label);
					}.bind(this));
				} else {
					item.polls = [
						{label: "Crap", votes: 0},
						{label: "Not Crap", votes: 0},
					];
				}
			}.bind(this));
			return results;
		}
	}
};

module.exports = Route;