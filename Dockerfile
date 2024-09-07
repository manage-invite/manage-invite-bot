FROM node:18-alpine3.19
RUN apk add --no-cache \
	build-base \
	cairo-dev \
	libpng-dev \
	g++ \
	pango-dev \
	python3;

# show python version
RUN python3 --version

RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json /opt/app/
RUN yarn install
COPY . .
CMD [ "yarn", "start"]
