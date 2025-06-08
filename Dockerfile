FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV npm_config_build_from_source=true

# Install Node.js and other dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get install -y \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    git \
    musl-dev \
    && rm -rf /var/lib/apt/lists/*


RUN ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1

RUN npm install -g yarn

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile \
 && yarn add canvas --build-from-source \
 && yarn cache clean

COPY . .

CMD [ "yarn", "start"]
