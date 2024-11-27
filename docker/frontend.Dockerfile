FROM debian

RUN apt-get update && apt-get install -y \
   zip \
   unzip \
   curl

RUN curl -fsSL https://bun.sh/install | bash 
