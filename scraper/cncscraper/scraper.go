package cncscraper

import (
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/gocolly/colly"
)

func ParseTopic(e *colly.HTMLElement, forumId int) Topic {
	topic := Topic{
		CrawlDate:   time.Now(),
		ForumId:     forumId,
		IsArchived:  false,
		PollOptions: []PollOption{},
		Title:       e.ChildText("a.topictitle"),
		User: User{
			Name: e.ChildText(".topic-description-inner a.username"),
		},
	}

	// Parse the topic ID
	t, err := url.Parse(e.ChildAttr("a.topictitle", "href"))

	if err == nil {
		q, _ := url.ParseQuery(t.RawQuery)
		topicid, _ := strconv.Atoi(q["t"][0])
		topic.Id = topicid
	}

	// Parse the User ID
	u, err := url.Parse(e.ChildAttr("a.username", "href"))

	if err == nil {
		q, _ := url.ParseQuery(u.RawQuery)
		userid, _ := strconv.Atoi(q["u"][0])
		topic.User.Id = userid
	}

	// Parse the created date
	createdTime, _ := time.Parse(time.RFC3339, e.ChildAttr(".topic-description time", "datetime"))
	topic.CreatedDate = createdTime

	// Parse the replies
	replycount, _ := strconv.Atoi(regexp.MustCompile("[0-9]+").FindString(e.ChildText(".topic-replies")))
	topic.Replies = replycount
	replydate, _ := time.Parse(time.RFC3339, e.ChildAttr(".topic-recent time", "datetime"))
	topic.ReplyDate = replydate

	// Parse the views
	viewcount, _ := strconv.Atoi(regexp.MustCompile("[0-9]+").FindString(e.ChildText(".topic-views")))
	topic.Views = viewcount

	return topic
}

func ParseTopicPolls(e *colly.HTMLElement, t Topic) Topic {
	t.CrawlDate = time.Now()
	t.Subject = e.ChildText("h4.poll-title")
	t.Votes, _ = strconv.Atoi(e.ChildText(".poll_total_vote_cnt"))

	options := []PollOption{}

	e.ForEach(".poll-option", func(i int, h *colly.HTMLElement) {
		votes, _ := strconv.Atoi(h.ChildText(".poll-option-number"))
		option := PollOption{
			Title: h.ChildText(".poll-option-title span:first-child"),
			Votes: votes,
		}
		options = append(options, option)
	})
	t.PollOptions = options

	return t
}

func Scrape(forumId int, start int, end int) []Topic {
	topics := ScrapeForum(forumId, start, end)
	topicCount := len(topics)

	// Crawl the individual topics
	for i, t := range topics {
		fmt.Printf("\rRequesting topic %d of %d", i+1, topicCount)
		topics[i] = ScrapeTopic(t)
	}
	fmt.Println()
	return topics
}

func ScrapeForum(forumId int, start int, end int) []Topic {
	var nextURL string
	topics := []Topic{}

	c := colly.NewCollector(
		colly.AllowedDomains("premierrockforum.com"),
	)

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting forum:", r.URL)
	})

	c.OnHTML("#topics-wrap li.row", func(e *colly.HTMLElement) {
		topic := ParseTopic(e, forumId)
		topics = append(topics, topic)
	})

	c.OnHTML(".action-bar-top-nb .pagination .next", func(e *colly.HTMLElement) {
		nextURL = e.ChildAttr("a", "href")
	})

	c.Visit(fmt.Sprintf("http://premierrockforum.com/viewforum.php?f=%d&start=%d", forumId, start))

	// Parse the "next" URL, if possible
	if len(nextURL) > 0 {
		u, err := url.Parse(nextURL)

		if err == nil {
			q, _ := url.ParseQuery(u.RawQuery)

			if startVals, ok := q["start"]; ok && len(startVals) > 0 {
				nextStart, err := strconv.Atoi(startVals[0])

				if err == nil && (nextStart <= end || end < 0) {
					topics = append(topics, ScrapeForum(forumId, nextStart, end)...)
				}
			}
		}
	}
	return topics
}

func ScrapeTopic(topic Topic) Topic {
	c := colly.NewCollector()

	c.OnHTML("form.topic-poll", func(e *colly.HTMLElement) {
		topic = ParseTopicPolls(e, topic)
	})

	c.Visit(fmt.Sprintf("http://premierrockforum.com/viewtopic.php?f=%d&t=%d", topic.ForumId, topic.Id))

	return topic
}

func WriteToFile(filename string, topics []Topic) {
	file, err := os.Create(filename)

	if err != nil {
		log.Fatalf("failed creating file: %s", err)
		return
	}

	for _, topic := range topics {
		jsondata, err := json.Marshal(topic)

		if err == nil {
			fmt.Fprintf(file, "%s\n", string(jsondata))
		}
	}
	file.Close()
}
