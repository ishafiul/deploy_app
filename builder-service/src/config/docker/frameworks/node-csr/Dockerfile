# Build stage
FROM node:20 AS base-builder

# Set working directory
WORKDIR /app

# Arguments for framework-specific configuration
ARG REPO_URL
ARG BUILD_COMMAND="build"
ARG BUILD_OUTPUT_DIR="dist"

# Clone the repository
RUN git clone ${REPO_URL} source

# Change to the cloned directory and install dependencies
WORKDIR /app/source
RUN npm install

# Build the project
RUN npm run ${BUILD_COMMAND}

# Verify and move build output
RUN set -ex; \
    echo "Current working directory contents:"; ls -la; \
    echo "Expecting build output directory: ${BUILD_OUTPUT_DIR}"; \
    if [ -d "${BUILD_OUTPUT_DIR}" ]; then \
      echo "Found ${BUILD_OUTPUT_DIR} directory. Contents:"; ls -la ${BUILD_OUTPUT_DIR}; \
    else \
      echo "Build failed: ${BUILD_OUTPUT_DIR} directory not found" && exit 1; \
    fi; \
    mkdir -p /app/dist; \
    cp -r ${BUILD_OUTPUT_DIR}/* /app/dist; \
    echo "Build output successfully copied to /app/dist"; \
    echo "Contents of /app/dist:"; ls -la /app/dist

# Signal completion
CMD ["echo", "Build complete"] 