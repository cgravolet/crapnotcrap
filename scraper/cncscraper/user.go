package cncscraper

type User struct {
	Id   int    `bson:"user_id"`
	Name string `bson:"user_name"`
}
