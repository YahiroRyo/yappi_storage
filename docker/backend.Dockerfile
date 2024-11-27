FROM golang:1.23.3

WORKDIR /go/src/github.com/YahiroRyo/yappi_storage/backend

COPY backend/go.mod /go/src/github.com/YahiroRyo/yappi_storage/backend/go.mod

RUN go install github.com/cosmtrek/air@v1.29.0

RUN go mod download

RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
    RUN apt-get -y install nodejs
    RUN npm install npm@10.2.4 -g