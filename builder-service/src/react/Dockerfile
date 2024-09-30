# Use the official Node.js image as the base
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Clone the repository first
ARG REPO_URL
RUN git clone ${REPO_URL} source

# Change to the cloned directory and install dependencies
WORKDIR /app/source
RUN npm install --legacy-peer-deps

# Build the project
RUN npm run build

# Move build files to /dist
RUN mkdir /app/dist && \
    cp -r /app/source/dist/* /app/dist

# If you don't need to keep the container running, you can just end the Dockerfile here
# Alternatively, you could add a simple CMD to exit immediately:
CMD ["echo", "Build complete"]
