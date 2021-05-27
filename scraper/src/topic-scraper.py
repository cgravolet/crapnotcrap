#!/usr/bin/env python3
from pymongo import MongoClient
from lxml import html
import requests
import json
import re

base_url = "http://premierrockforum.com/"

def write_to_file(filename, data):
    f = open(filename, "w")
    f.write(data)
    f.close()

def scrapeTopics(url):
    page = requests.get(base_url + url)
    tree = html.fromstring(page.content)
    topicRows = tree.xpath("//a[@class='topictitle']/ancestor::li[@class='row']")
    next_url = next(iter(tree.xpath("//a[@rel='next']/@href")), None)

    topics = []

    for row in topicRows:
        title_element = next(iter(row.xpath(".//a[@class='topictitle']")), None)
        username_element = next(iter(row.xpath(".//a[@class='username']")), None)
        datetime = next(iter(row.xpath(".//time/@datetime")), None)
        replies = int(re.search("\d+", next(iter(row.xpath(".//span[@class='topic-replies']/text()")), "0")).group())
        views = int(re.search("\d+", next(iter(row.xpath(".//span[@class='topic-views']/text()")), "0")).group())
        topic_title = title_element.text
        topic_url = title_element.get("href")
        topic_poster = username_element.text
        topic_poster_url = username_element.get("href")
        topic = {
            'title': topic_title,
            'datetime': datetime,
            'replies': replies,
            'url': topic_url,
            'views': views,
            'poster': {
                'name': topic_poster,
                'url': topic_poster_url
            }
        }
        topics.append(topic)

    return (topics, next_url)

def main():
    topics = []
    url = "./viewforum.php?f=28"

    while not url is None:
        newTopics, nextUrl = scrapeTopics(url)
        url = nextUrl

        for topic in newTopics:
            topics.append(topic)

    data = {
        'topics': topics
    }
    jsonStr = json.dumps(data, indent=2, sort_keys=True)
    write_to_file("output.json", jsonStr)

    print(jsonStr)
    print(f"{len(topics)} topics retrieved")

def mainMongo():
    client = MongoClient("mongodb://crapnotcrap_mongo_1:27017")
    db = client.crapnotcrap
    serverStatusResult = db.command("serverStatus")
    print(f"Hello, Mongo! {serverStatusResult}")

if __name__ == "__main__":
    main()