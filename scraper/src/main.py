#!/usr/bin/env python3
from pymongo import MongoClient
from scrapers import TopicScraper

def main():
    # scraper = TopicScraper(url="./viewforum.php?f=28")
    scraper = TopicScraper(forum_id=28, single=True, start=60)
    topics = scraper.scrape()
    output = scraper.write_to_file(topics)
    print(output)
    print(f"{len(topics)} topics retrieved")

def main_mongo():
    client = MongoClient("mongodb://crapnotcrap_mongo_1:27017")
    db = client.crapnotcrap
    serverStatusResult = db.command("serverStatus")
    print(f"Hello, Mongo! {serverStatusResult}")

if __name__ == "__main__": main()