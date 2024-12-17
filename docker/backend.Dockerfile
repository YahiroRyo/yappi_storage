FROM golang:1.23.3

WORKDIR /go/src/github.com/YahiroRyo/yappi_storage/backend

COPY backend/go.mod /go/src/github.com/YahiroRyo/yappi_storage/backend/go.mod

RUN go install github.com/cosmtrek/air@v1.29.0 & \
    go install bitbucket.org/liamstask/goose/cmd/goose & \
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest & \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest 

RUN go mod download

RUN apt update -y && apt install -y protobuf-compiler

RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
    RUN apt-get -y install nodejs
    RUN npm install npm@10.2.4 -g