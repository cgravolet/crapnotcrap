#
# Create an image:
# > docker build -t cgravolet/crapnotcrap-web .
#
# Run the container:
# > docker run -p 80:5000 cgravolet/crapnotcrap-web
#
FROM python
WORKDIR /src
RUN apk add --no-cache gcc musl-dev linux-headers libxslt-dev
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
CMD ["python3", "main.py"]