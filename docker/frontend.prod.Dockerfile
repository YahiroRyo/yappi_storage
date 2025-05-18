FROM node:22

WORKDIR /home/frontend
COPY ./frontend /home/frontend

RUN apt-get update && apt-get install -y \
   zip \
   unzip \
   curl \
   protobuf-compiler \
   xdg-utils
