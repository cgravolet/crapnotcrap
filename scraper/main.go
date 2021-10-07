package main

import (
	"github.com/cgravolet/crapnotcrap/cncscraper"
)

func main() {
	topics := cncscraper.Scrape(28, 0, -1)
	cncscraper.WriteToFile("topics.json", topics)
}
