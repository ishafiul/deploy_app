# Build stage
FROM instrumentisto/flutter:latest

# Set working directory
WORKDIR /app

# Arguments for configuration
ARG REPO_URL
ARG BUILD_COMMAND
ARG BUILD_OUTPUT_DIR

# Install git and clone repository
RUN  git clone ${REPO_URL} source

# Change to the cloned directory
WORKDIR /app/source

# Get dependencies and build
RUN flutter pub get && \
    flutter ${BUILD_COMMAND}

# Verify and move build output
RUN test -d ${BUILD_OUTPUT_DIR} || (echo "Build failed: ${BUILD_OUTPUT_DIR} directory not found" && exit 1) && \
    mkdir -p /app/dist && \
    cp -r ${BUILD_OUTPUT_DIR}/* /app/dist

# Signal completion
CMD ["echo", "Build complete"] 