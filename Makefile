default: compose # clean build run

compose:
	docker compose up

compose-build:
	docker compose up --build

clean:
	docker rm cnc_web || true

build:
	docker build -t cgravolet/crapnotcrap-web .

run:
	docker run -p 80:5000 --name cnc_web -d cgravolet/crapnotcrap-web

stop:
	docker stop cnc_web

scrape:
	docker compose up scraper mongo

scrape-dev:
	docker compose run scraper

mongod:
	docker compose up mongo

mongoconnect:
	docker exec -it crapnotcrap_mongo_1 bash