.PHONY: setup start stop clean dev docker-builder

# Default target
all: dev

# Setup all projects
setup:
	@echo "Setting up all projects..."
	cd builder-service && cp .env.example .env
	cd builder_api && cp .env.example .env
	cd proxy && cp .env.example .env
	cd builder-service && npm install
	cd builder_api && npm install
	cd console && npm install
	cd proxy && npm install
	@echo "Setup complete. Please configure your .env files before starting the services."

# Start builder service with Docker
docker-builder:
	@echo "Starting builder service with Docker..."
	cd builder-service && docker-compose up -d

# Start all services in development mode
dev: # docker-builder
	@echo "Starting all services in development mode..."
	# Start proxy service
	cd proxy && npm run start & \
	# Start builder API
	cd builder_api && npm run dev & \
	# Start console
	cd console && npm run dev & \
	wait

# Stop all services
stop:
	@echo "Stopping all services..."
	# cd builder-service && docker-compose down
	pkill -f "npm run dev"

# Clean the project
clean:
	@echo "Cleaning up..."
	cd builder-service && rm -rf node_modules
	cd builder_api && rm -rf node_modules
	cd console && rm -rf node_modules
	cd proxy && rm -rf node_modules
	find . -name "dist" -type d -exec rm -rf {} +

# Help command
help:
	@echo "Available commands:"
	@echo "  make setup    - Install dependencies and create .env files"
	@echo "  make dev      - Start all services in development mode"
	@echo "  make stop     - Stop all running services"
	@echo "  make clean    - Remove node_modules and build directories"
	@echo "  make docker-builder - Start only the builder service with Docker"
	@echo "  make all      - Run setup and start development servers" 