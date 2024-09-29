# Use official Node.js image as a base
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build


EXPOSE 3000


# Command to run the worker (assuming your compiled TypeScript files are in dist/)
CMD ["node", "dist/index.js"]
