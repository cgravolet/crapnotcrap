#
# Create an image:
# > docker build -t cgravolet/crapnotcrap-web .
#
# Run the container:
# > docker run -p 80:5000 cgravolet/crapnotcrap-web
#
FROM python:3.7-alpine
WORKDIR /src
RUN apk add --no-cache gcc musl-dev linux-headers libxslt-dev
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["python3", "topic-scraper.py"]