# syntax=docker.io/docker/dockerfile:1.7-labs
FROM golang:1.24-alpine

WORKDIR /go/src/github.com/YahiroRyo/yappi_storage/backend

COPY backend/go.mod /go/src/github.com/YahiroRyo/yappi_storage/backend/go.mod

RUN go mod download
