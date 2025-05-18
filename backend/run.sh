#!/bin/bash

main() {
    cd ~/go/src/github.com/YahiroRyo/yappi_storage/backend/infrastructure/dactabase/goose || exit
    go tool goose up
    cd ~/ || exit
    go build -o backend ./main.go
    ./backend
}

main
