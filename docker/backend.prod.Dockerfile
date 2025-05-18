# syntax=docker.io/docker/dockerfile:1.7-labs
FROM golang:1.24-alpine

WORKDIR /go/src/github.com/YahiroRyo/yappi_storage/backend

COPY --exclude=storage ./backend /go/src/github.com/YahiroRyo/yappi_storage/backend

RUN go mod download

RUN go build -o backend ./main.go

# ビルド後に不要なファイルを削除(backend以外のファイルを削除)
RUN find . -type f -not -name "backend" -delete

CMD ["./backend"]