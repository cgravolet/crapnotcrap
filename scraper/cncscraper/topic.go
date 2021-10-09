package cncscraper

import (
	"time"
)

type Topic struct {
	CrawlDate   time.Time    `bson:"crawl_datetime"`
	CreatedDate time.Time    `bson:"created_datetime"`
	ForumId     int          `bson:"forum_id"`
	Id          int          `bson:"topic_id"`
	IsArchived  bool         `bson:"is_archived"`
	PollOptions []PollOption `bson:"polls"`
	Replies     int          `bson:"replies"`
	ReplyDate   time.Time    `bson:"reply_datetime"`
	Subject     string       `bson:"subject"`
	Title       string       `bson:"title"`
	User        User         `bson:"user"`
	Views       int          `bson:"views"`
	Votes       int          `bson:"votes"`
}
