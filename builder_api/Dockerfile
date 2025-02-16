# Use the official Bun image
FROM oven/bun:1.0.29

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lock ./

# Install dependencies
RUN bun install

# Copy source code and configuration files
COPY . .

# Generate Drizzle migrations if needed
RUN bun run generate

# Expose port (default to 3000 for Hono)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"] 