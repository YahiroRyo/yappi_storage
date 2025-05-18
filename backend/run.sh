#!/bin/bash

main() {
    cd /go/src/github.com/YahiroRyo/yappi_storage/backend/infrastructure/database/goose || exit
    go tool goose up
    cd /go/src/github.com/YahiroRyo/yappi_storage/backend || exit
    go build -o backend ./main.go
    ./backend
}

main
