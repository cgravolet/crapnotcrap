from datetime import datetime

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