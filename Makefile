default: compose # clean build run

compose:
	docker-compose up

compose-build:
	docker-compose up --build

clean:
	docker rm cnc_web || true

build:
	docker build -t cgravolet/crapnotcrap-web .

run:
	docker run -p 80:5000 --name cnc_web -d cgravolet/crapnotcrap-web

stop:
	docker stop cnc_web