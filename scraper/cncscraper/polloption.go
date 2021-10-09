package cncscraper

type PollOption struct {
	Title string `bson:"label"`
	Votes int    `bson:"votes"`
}
