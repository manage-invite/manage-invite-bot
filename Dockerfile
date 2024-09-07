FROM node:22-alpine3.19
RUN apk add --no-cache \
	build-base \
	cairo-dev \
	libpng-dev \
	g++ \
	pango-dev \
	python3;
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json yarn.lock /opt/app/
RUN yarn install
COPY . .
CMD [ "yarn", "start"]
