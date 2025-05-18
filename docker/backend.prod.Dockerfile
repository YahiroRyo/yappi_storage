FROM golang:1.24

WORKDIR /go/src/github.com/YahiroRyo/yappi_storage/backend

COPY backend/go.mod /go/src/github.com/YahiroRyo/yappi_storage/backend/go.mod

RUN go mod download
