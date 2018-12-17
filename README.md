# EA Crap/Not Crap Forum Crawler

A simple node/mongoDB app that crawls the electrical audio crap/not crap forum
and provides a front-end for searching the topics by keyword.

http://crapnotcrap.com

## Dependencies

The crawler and app require node.js and mongoDB to be installed, and mongod
listening on port 27017 (default). See the mongo documentation for tips on
installing and running mongoDB.

[http://docs.mongodb.org/manual/installation/](http://docs.mongodb.org/manual/installation/)

## Installation

	$ git clone https://github.com/cgravolet/crapnotcrap.git
	$ cd crapnotcrap
	$ npm install

## Restoring the database from backup

A snapshot of the mongo database is available in the `database_snapshot`
directory. Running the following command from the root directory of the
project with mongod running should restore the database from the snapshot
provided:

	$ npm run restore

## Starting the server

Make sure the mongo database is up and running, then run startup script to start
the HTTP server:

	$ npm start

By default, the HTTP server listens on port 3000, so you should be able to load
up `http://localhost:3000/` in a web browser to see it running. If you want to
run the webserver manually on port 80, that would look something like this:

	$ sudo PORT=80 ./bin/www

## Crawling

Crawling is currently split into two scripts, one for topics and one for polls.
Topics should be crawled first, this get's a list of topics from the forums
index pages and inserts new topics or updates the view/reply/title of topics
that already exist.

	$ npm run crawltopics

Once the topics are inserted into the database, you can crawl the polls. This
requests each topic one at a time and parses the poll options as well as vote
counts and updates the database entries.

	$ npm run crawlpolls

*__NOTE:__ Crawling the EA forum should be kept to a minimum, it's preferable to
just restore the database from the latest snapshot rather than invoking the
crawler scripts.*
