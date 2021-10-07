package cncscraper

import "time"

type Topic struct {
	CrawlDate   time.Time    `json:"crawl_datetime"`
	CreatedDate time.Time    `json:"topic_datetime"`
	ForumId     int          `json:"forum_id"`
	Id          int          `json:"topic_id"`
	IsArchived  bool         `json:"is_archived"`
	PollOptions []PollOption `json:"polls"`
	Replies     int          `json:"replies"`
	ReplyDate   time.Time    `json:"reply_datetime"`
	Subject     string       `json:"subject"`
	Title       string       `json:"title"`
	User        User         `json:"user"`
	Views       int          `json:"views"`
	Votes       int          `json:"votes"`
}
