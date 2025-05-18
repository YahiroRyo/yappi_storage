#!/bin/bash

main() {
    cd ~/backend/infrastructure/dactabase/goose || exit
    go tool goose up
    cd ~/ || exit
    go build -o backend ./main.go
    ./backend
}

main
