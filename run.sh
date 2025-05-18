#!/bin/bash

main() {
    export COMPOSE_FILE=production.yaml
    docker compose up --build
}

main