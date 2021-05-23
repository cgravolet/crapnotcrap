from lxml import html
import requests
import json

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
        title_element = row.xpath(".//a[@class='topictitle']")[0]
        username_element = row.xpath(".//a[@class='username']")[0]
        datetime = row.xpath(".//time/@datetime")[0]
        topic_title = title_element.text
        topic_url = title_element.get("href")
        topic_poster = username_element.text
        topic_poster_url = username_element.get("href")
        topic = {
            'title': topic_title,
            'datetime': datetime,
            'url': topic_url,
            'poster': {
                'name': topic_poster,
                'url': topic_poster_url
            }
        }
        topics.append(topic)

    return (topics, next_url)

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