#
# Create an image:
# > docker build -t cgravolet/crapnotcrap-web .
#
# Run the container:
# > docker run -p 80:5000 cgravolet/crapnotcrap-web
#
FROM python:3.7-alpine
WORKDIR /src
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["flask", "run"]