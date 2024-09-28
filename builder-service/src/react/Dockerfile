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

# Expose any ports your app might need (optional)
EXPOSE 3000

# Command to keep the container running
CMD ["tail", "-f", "/dev/null"]
