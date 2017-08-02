# Dockerfile
# The FROM directive sets the Base Image for subsequent instructions
FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/express
WORKDIR /usr/src/express

# Install app dependencies
COPY package.json package-lock.json . /usr/src/express/
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
