#!/usr/bin/env python3
from pymongo import MongoClient
from scrapers import TopicScraper
from typing import Optional
import sys

def main(args: Optional[list[str]] = None) -> None:
    if args is None: args = sys.argv[1:]
    scraper = TopicScraper(forum_id=28, single=True, start=60)
    topics = scraper.scrape()
    scraper.write_to_file(topics)

def main_mongo() -> None:
    client = MongoClient("mongodb://crapnotcrap_mongo_1:27017")
    db = client.crapnotcrap
    serverStatusResult = db.command("serverStatus")
    print(f"Hello, Mongo! {serverStatusResult}")

if __name__ == "__main__": main()