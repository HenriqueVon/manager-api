# Build Stage
FROM node:18.17 AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Set NODE_ENV to production for build stage
ENV NODE_ENV production

# Install dependencies
RUN npm install

# Install the Nest CLI globally
RUN npm install -g @nestjs/cli

COPY --chown=node:node . .

# Build the application
RUN npm run build

# Runtime Stage
FROM node:18.17.0-bullseye-slim

# Install dumb-init for process management
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

# Set the working directory
WORKDIR /usr/src/app

# Copy built files from the build stage
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

# Set NODE_ENV to production for runtime stage
ENV NODE_ENV production

# Install only production dependencies
RUN npm install --only=production

# Expose the port that the application will run on
EXPOSE 3000

# Change user to 'node'
USER node

# Use dumb-init to run the Node.js application
CMD ["dumb-init", "node", "dist/main"]
