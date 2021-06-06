#!/usr/bin/env python3
from lxml import html
from datetime import datetime, timezone
import argparse
import requests
import json
import re
import sys
from topic import Topic
from typing import Optional, List
import urllib.parse as urlparse

class TopicScraper:
    base_url = "http://premierrockforum.com/"
    forum_url_format = 'viewforum.php?f={}&start={}'
    topic_url_format = 'viewtopic.php?f={}&t={}'

    # Initialization

    def __init__(self, **kwargs):
        self._forum_id = int(kwargs['forum_id']) if 'forum_id' in kwargs else 28
        self._single = bool(kwargs['single']) if 'single' in kwargs else False
        self._start = int(kwargs['start']) if 'start' in kwargs else 0
        self._start_url = self.forum_url_format.format(self._forum_id, self._start)

    # Properties

    def start_url(self, url: str = None) -> str:
        if url: self._start_url = url
        return self._start_url

    # Private methods

    def __get_replies_from_row(self, row: html.Element) -> int:
        replies_text = next(iter(row.xpath(".//span[@class='topic-replies']/text()")), "0")
        result = re.search("\d+", replies_text)
        replies = int(result.group()) if result is not None else 0
        return replies

    def __get_views_from_row(self, row: html.Element) -> int:
        views_text = next(iter(row.xpath(".//span[@class='topic-views']/text()")), "0")
        result = re.search("\d+", views_text)
        views = int(result.group()) if result is not None else 0
        return views

    def __get_date_from_string(self, s: Optional[str]) -> Optional[datetime]:
        if s is None: return None
        return datetime.strptime(s, '%Y-%m-%dT%H:%M:%S%z')

    def __get_id_from_url(self, url: str, key: str) -> Optional[int]:
        url_string = self.base_url + url
        result = urlparse.urlparse(url_string)

        if result.query:
            query_params = urlparse.parse_qs(result.query)
            id_string = next(iter(query_params[key]), None)
            return int(id_string) if id_string is not None else None

        return None

    def __parse_details_from_poll(self, poll: html.Element, topic: Topic) -> Topic:
        title_element = next(iter(poll.xpath(".//h4[@class='poll-title']")), None)
        topic.subject(title_element.text.strip() if title_element is not None else None)
        topic.votes(int(next(iter(poll.xpath(".//span[@class='poll_total_vote_cnt']/text()")), "0").strip()))
        topic.polls_last_updated(datetime.now(timezone.utc))
        polls = []

        for poll_option in poll.xpath(".//div[@class='poll-option-title']/parent::div"):
            poll_option_title = next(iter(poll_option.xpath(".//div[@class='poll-option-title']/span/text()")), None)
            poll_option_votes = int(next(iter(poll_option.xpath(".//span[@class='poll-option-number']/text()")), "0").strip())

            if poll_option_title is not None:
                poll_dict = {
                    'label': poll_option_title.strip(),
                    'votes': poll_option_votes 
                }
                polls.append(poll_dict)

        topic.polls(polls)
        return topic

    def __parse_topic_from_row(self, row: html.Element) -> Optional[Topic]:
        title_element = next(iter(row.xpath(".//a[@class='topictitle']")), None)
        replies = self.__get_replies_from_row(row)
        views = self.__get_views_from_row(row)

        if title_element is not None:
            topic_title = title_element.text.strip()
            topic_id = self.__get_id_from_url(title_element.get('href'), 't')
        else:
            return None

        # Parse items from the description element
        description_element = next(iter(row.xpath(".//div[@class='topic-description']")), None)

        if description_element is not None:
            created_datetime = self.__get_date_from_string(next(iter(description_element.xpath(".//time/@datetime")), None))
            username_element = next(iter(description_element.xpath(".//a[@class='username']")), None)

            if username_element is not None:
                creator_name = username_element.text
                creator_id = self.__get_id_from_url(username_element.get('href'), 'u')

        # Parse items from the recent element
        recent_element = next(iter(row.xpath(".//div[@class='topic-recent']")), None)

        if recent_element is not None:
            last_reply_datetime = self.__get_date_from_string(next(iter(recent_element.xpath(".//time/@datetime")), None))
        
        topic = Topic(
            created_datetime = created_datetime if created_datetime else None,
            creator = {
                'name': creator_name if creator_name else None,
                'id': creator_id if creator_id else None
            },
            forum_id = self._forum_id,
            last_reply_datetime = last_reply_datetime if last_reply_datetime else None,
            polls = [],
            polls_last_updated = None, # TODO: The date of the last time the polls for this topic were crawled
            replies = replies,
            subject = None, # TODO: Does this even exist on the new forum? IT DOES
            title = topic_title,
            topic_id = topic_id,
            topic_last_updated = datetime.now(timezone.utc),
            views = views,
            votes = None # TODO: Crawl the polls to get total number of votes
        )
        return topic

    def __scrape_details_for_topics(self, topics: List[Topic]) -> List[Topic]:
        topics_with_details: List[Topic] = []
        topic_count = len(topics)

        for i, topic in enumerate(topics):
            self.__print_progress(i + 1, topic_count)
            page = requests.get(self.base_url + self.topic_url_format.format(topic.forum_id(), topic.topic_id()))
            tree = html.fromstring(page.content)
            poll_element = next(iter(tree.xpath("//div[@class='poll-panel']")), None)

            if poll_element is not None:
                topic = self.__parse_details_from_poll(poll_element, topic)

            topics_with_details.append(topic)

        return topics_with_details

    def __print_progress(self, topic_index: int, max_index: int) -> None:
        topic_index = topic_index if topic_index is not None else 0
        max_index = max_index if max_index is not None else 10
        percent_size = 25
        percent_complete = int(topic_index / max_index * percent_size)
        percent_complete_str = "#" * percent_complete
        sys.stdout.write(f'\r  Retrieving topics {str(topic_index).rjust(2, "0")}/{str(max_index).rjust(2, "0")} [{percent_complete_str.ljust(percent_size, ".")}]')
        sys.stdout.flush()

    # Public methods

    def scrape(self, url: str = None, topics: List[Topic] = None) -> List[Topic]:
        url = url if url else self._start_url
        topics = topics if topics else []

        page = requests.get(self.base_url + url)
        tree = html.fromstring(page.content)
        topicRows = tree.xpath("//a[@class='topictitle']/ancestor::li[@class='row']")
        next_url = next(iter(tree.xpath("//a[@rel='next']/@href")), None) if not self._single else None

        for row in topicRows:
            topic = self.__parse_topic_from_row(row)

            if topic is not None:
                topics.append(topic)

        print(f'Scraping {url}:')
        topics = self.__scrape_details_for_topics(topics)
        print()

        return self.scrape(next_url, topics) if next_url else topics

    def write_to_file(self, topics: List[Topic], filename: str = "output.json") -> str:

        def default_encoder(o):
            if isinstance(o, datetime):
                return o.isoformat()
            elif isinstance(o, Topic):
                return o.to_dictionary()
            else:
                return str(o)

        f = open(filename, "w")

        for topic in topics:
            jsonStr = json.dumps(topic.to_dictionary(), sort_keys=True, default=default_encoder)
            f.write(jsonStr + "\n")

        print(f'{len(topics)} topics retrieved. File written to {filename}')

        f.close()
        return jsonStr

def main():
    parser = argparse.ArgumentParser(description="Scrapes the Premier Rock Forum's Crap/Not Crap Forum")
    parser.add_argument('--forumid', type=int, dest='forum_id', help='The ID of the forum to scrape', default=28)
    parser.add_argument('--output', type=str, dest='filename', help='The path to the output file', required=True)
    parser.add_argument('--single', type=bool, dest='single', help='A Boolean value indicating if only a single page should be scraped', default=False)
    parser.add_argument('--start', type=int, dest='start', help='An integer representing the page to start scraping', default=0)
    args = parser.parse_args()
    scraper = TopicScraper(forum_id=args.forum_id, start=args.start, single=args.single)
    topics = scraper.scrape()
    scraper.write_to_file(topics, args.filename)

if __name__ == "__main__": main()