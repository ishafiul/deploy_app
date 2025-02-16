# Use Ubuntu as the base image
FROM ubuntu:20.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies: Git, curl, unzip, xz-utils, OpenJDK (for Android builds), and other libraries
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    xz-utils \
    libglu1-mesa \
    openjdk-11-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

# Clone the Flutter SDK (using the stable branch)
RUN git clone https://github.com/flutter/flutter.git -b stable /usr/local/flutter

# Set up Flutter environment by adding it to the PATH
ENV PATH="/usr/local/flutter/bin:/usr/local/flutter/bin/cache/dart-sdk/bin:$PATH"

# (Optional) Pre-accept Android licenses if you're building Android apps
RUN yes | flutter doctor --android-licenses || true

# Set working directory for the build process
WORKDIR /app

# Define build-time arguments for repository URL, build command, and output directory
ARG REPO_URL
ARG BUILD_COMMAND
ARG BUILD_OUTPUT_DIR='build/web'

# Clone your application repository into a subdirectory named 'source'
RUN git clone ${REPO_URL} source

# Change directory to the cloned repository
WORKDIR /app/source

# Fetch dependencies and run the specified Flutter build command
RUN flutter pub get && \
    flutter ${BUILD_COMMAND}

# Check if the expected build output directory exists, then copy its contents to /app/dist
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


# Signal completion of the build
CMD ["echo", "Build complete"]
