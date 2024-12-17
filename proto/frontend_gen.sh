#!/bin/sh

NODE_PROTOC="../node_modules/.bin/grpc_tools_node_protoc"

PROTOC_GEN_TS_PATH="../node_modules/.bin/protoc-gen-ts"

OUT_DIR="../src/grpc"

$NODE_PROTOC \
    --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
    --ts_out="service=grpc-node,mode=grpc-js:${OUT_DIR}" \
	file.proto