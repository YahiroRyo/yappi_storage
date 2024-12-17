FROM node:22

RUN apt-get update && apt-get install -y \
   zip \
   unzip \
   curl \
   protobuf-compiler

