default: compose # clean build run

compose:
	docker compose up

compose-build:
	docker compose up --build

clean:
	docker rm cnc_web || true

build:
	docker build -t cgravolet/crapnotcrap-web .

mongod:
	docker compose up mongo

mongoconnect:
	docker exec -it crapnotcrap_mongo_1 bash

mongoexport:
	mongoexport --db=crapnotcrap --collection=topics --out=mongo/export/topics.json

mongodump:
	mongodump --db=crapnotcrap --out=mongo/dump