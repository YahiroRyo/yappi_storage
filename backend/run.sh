#!/bin/bash

main() {
    go build -o backend ./main.go
    ./backend
}

main
