package main

import (
	"flag"

	"github.com/cgravolet/crapnotcrap/cncscraper"
)

// Scrapes the CNC forum and writes the contents to a file.
//
// Possible arguments:
//   -o Output file (usage ex: -o topics.json)
//   -f Forum ID
//   -s Start index
//   -e End index
func main() {
	outputPtr := flag.String("o", "topics.json", "Output file")
	forumPtr := flag.Int("f", 28, "Forum ID")
	startPtr := flag.Int("s", 0, "Start index")
	endPtr := flag.Int("e", -1, "End index")
	flag.Parse()
	topics := cncscraper.Scrape(*forumPtr, *startPtr, *endPtr)
	cncscraper.WriteToFile(*outputPtr, topics)
}
