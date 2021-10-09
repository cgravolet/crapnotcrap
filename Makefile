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