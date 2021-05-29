#!/usr/bin/env python3
from lxml import html
from datetime import datetime, timezone
import requests
import json
import re
import urllib.parse as urlparse

class TopicScraper:
    base_url = "http://premierrockforum.com/"
    forum_url_format = 'viewforum.php?f={}&start={}'
    topic_url_format = 'viewtopic.php?f={}&t={}'

    # Initialization

    def __init__(self, **kwargs):
        self._forum_id = kwargs['forum_id'] if 'forum_id' in kwargs else 28
        self._single = bool(kwargs['single']) if 'single' in kwargs else False
        self._start = kwargs['start'] if 'start' in kwargs else 0
        self._start_url = self.forum_url_format.format(self._forum_id, self._start)

    # Properties

    def start_url(self, url = None):
        if url: self._start_url = url
        return self._start_url

    # Private methods

    def __get_replies_from_row(self, row):
        replies_text = next(iter(row.xpath(".//span[@class='topic-replies']/text()")), "0")
        replies = int(re.search("\d+", replies_text).group())
        return replies

    def __get_views_from_row(self, row):
        views_text = next(iter(row.xpath(".//span[@class='topic-views']/text()")), "0")
        views = int(re.search("\d+", views_text).group())
        return views

    def __get_date_from_string(self, s):
        if s is None: return None
        return datetime.strptime(s, '%Y-%m-%dT%H:%M:%S%z')

    def __get_id_from_url(self, url, key):
        url_string = self.base_url + url
        url = urlparse.urlparse(url_string)

        if url.query:
            query_params = urlparse.parse_qs(url.query)
            id_string = next(iter(query_params[key]), None)
            return int(id_string) if id_string is not None else None

        return None

    def __parse_details_from_poll(self, poll, topic):
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

    def __parse_topic_from_row(self, row):
        title_element = next(iter(row.xpath(".//a[@class='topictitle']")), None)
        replies = self.__get_replies_from_row(row)
        views = self.__get_views_from_row(row)

        if title_element is not None:
            topic_title = title_element.text.strip()
            topic_id = self.__get_id_from_url(title_element.get('href'), 't')
        else:
            return

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

    def __scrape_details_for_topics(self, topics):
        topics_with_details = []

        for topic in topics:
            page = requests.get(self.base_url + self.topic_url_format.format(topic.forum_id(), topic.topic_id()))
            tree = html.fromstring(page.content)
            poll_element = next(iter(tree.xpath("//div[@class='poll-panel']")), None)

            if poll_element is not None:
                topic = self.__parse_details_from_poll(poll_element, topic)

            topics_with_details.append(topic)

        return topics_with_details

    # Public methods

    def scrape(self, url = None, topics = None):
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

        topics = self.__scrape_details_for_topics(topics)

        return self.scrape(next_url, topics) if next_url else topics

    def write_to_file(self, topics, filename = "output.json"):

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
            print(jsonStr)
            
        f.close()
        return jsonStr

class Topic:

    # Initialization

    def __init__(self, **kwargs):
        self._created_datetime = kwargs.get('created_datetime')
        self._creator = kwargs.get('creator')
        self._forum_id = kwargs.get('forum_id')
        self._is_archived = kwargs.get('is_archived', False)
        self._last_reply_datetime = kwargs.get('last_reply_datetime')
        self._polls = kwargs.get('polls')
        self._polls_last_updated = kwargs.get('polls_last_updated')
        self._replies = kwargs.get('replies', 0)
        self._subject = kwargs.get('subject')
        self._title = kwargs.get('title')
        self._topic_id = kwargs.get('topic_id')
        self._topic_last_updated = kwargs.get('topic_last_updated')
        self._update_required = kwargs.get('update_required', False)
        self._views = kwargs.get('views', 0)
        self._votes = kwargs.get('votes')

    # Properties

    def created_datetime(self, created_datetime = None):
        if created_datetime: self._created_datetime = created_datetime
        return self._created_datetime

    def creator(self, creator = None):
        if creator: self._creator = creator
        return self._creator

    def forum_id(self, forum_id = None):
        if forum_id: self._forum_id = forum_id
        return self._forum_id

    def is_archived(self, is_archived = None):
        if is_archived: self._is_archived = is_archived
        return self._is_archived

    def last_reply_datetime(self, last_reply_datetime = None):
        if last_reply_datetime: self._last_reply_datetime = last_reply_datetime
        return self._last_reply_datetime

    def polls(self, polls = None):
        if polls: self._polls = polls
        return self._polls

    def polls_last_updated(self, polls_last_updated = None):
        if polls_last_updated: self._polls_last_updated = polls_last_updated
        return self._polls_last_updated

    def replies(self, replies = None):
        if replies: self._replies = replies
        return self._replies

    def subject(self, subject = None):
        if subject: self._subject = subject
        return self._subject

    def title(self, title = None):
        if title: self._title = title
        return self._title

    def topic_id(self, topic_id = None):
        if topic_id: self._topic_id = topic_id
        return self._topic_id

    def topic_last_updated(self, topic_last_updated = None):
        if topic_last_updated: self._topic_last_updated = topic_last_updated
        return self._topic_last_updated

    def update_required(self, update_required = None):
        if update_required: self._update_required = update_required
        return self._update_required

    def views(self, views = None):
        if views: self._views = views
        return self._views

    def votes(self, votes = None):
        if votes: self._votes = votes
        return self._votes

    # Private methods

    def __wrap_date(self, d):
        if d is None or not isinstance(d, datetime): return None
        return {'$date': d.replace(microsecond=0).isoformat() }

    # Public methods

    def to_dictionary(self):
        return {
            'created_datetime': self.__wrap_date(self._created_datetime),
            'creator': self._creator,
            'forum_id': self._forum_id,
            'is_archived': self._is_archived,
            'last_reply_datetime': self.__wrap_date(self._last_reply_datetime),
            'polls': self._polls,
            'polls_last_updated': self.__wrap_date(self._polls_last_updated),
            'replies': self._replies,
            'subject': self._subject,
            'title': self._title,
            'topicid': self._topic_id,
            'topic_last_updated': self.__wrap_date(self._topic_last_updated),
            'update_required': self._update_required,
            'views': self._views,
            'votes': self._votes
        }