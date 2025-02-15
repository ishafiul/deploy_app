# Build stage
FROM cirrusci/flutter:stable

# Set working directory
WORKDIR /app

# Arguments for configuration
ARG REPO_URL

# Install git and clone repository
RUN apt-get update && \
    apt-get install -y git && \
    git clone ${REPO_URL} source && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Change to the cloned directory
WORKDIR /app/source

# Verify Flutter installation and enable web
RUN flutter doctor && \
    flutter config --enable-web

# Get dependencies and build
RUN flutter pub get && \
    flutter build web --release --web-renderer html

# Verify and move build output
RUN test -d build/web || (echo "Build failed: build/web directory not found" && exit 1) && \
    mkdir -p /app/dist && \
    cp -r build/web/* /app/dist

# Signal completion
CMD ["echo", "Build complete"] 