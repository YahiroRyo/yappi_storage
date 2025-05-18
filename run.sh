#!/bin/bash

main() {
    chmod +x ./backend/run.sh
    chmod +x ./frontend/run.sh

    export COMPOSE_FILE=production.yaml
    docker compose up --build
}

main