#!/bin/sh

protoc --go_out=../grpc --go_opt=paths=source_relative \
	file.proto