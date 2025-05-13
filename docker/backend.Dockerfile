FROM golang:1.24

WORKDIR /go/src/github.com/YahiroRyo/yappi_storage/backend

COPY backend/go.mod /go/src/github.com/YahiroRyo/yappi_storage/backend/go.mod

RUN go mod download

RUN apt update -y && apt install -y protobuf-compiler

RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
    RUN apt-get -y install nodejs
    RUN npm install npm@10.2.4 -g
