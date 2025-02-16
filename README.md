# CSR App Builder with Reverse Proxy

This project builds and deploys a React application from a public Git
repository and sets up a reverse proxy on a subdomain to make the app accessible via a browser. It is inspired by the [I built Vercel in 2 Hours (System Design, AWS, Docker, Redis, S3)](https://www.youtube.com/watch?v=0A_JpLYG7hM&t=385s)
video, but, due to AWS account constraints, it utilizes custom infrastructure.
Built using [dockerode](https://www.npmjs.com/package/dockerode/v/2.5.5) for Docker container management and Redis task queuing.

## Features
- **React App Builder:** Builds a React application from a specified Git repository.
- **Subdomain Reverse Proxy:** Deploys the app to a subdomain to make it accessible to the user.

## Supported Frameworks
- React
- Vue
- Svelte
- Solid
- Flutter

## Project Structure
The project consists of four main services:

1. **builder-service**: Handles Docker container management and build processes
2. **builder_api**: Main API service managing project builds and deployments
3. **console**: Frontend dashboard for managing projects and deployments
4. **proxy**: Reverse proxy service for routing requests to deployed applications

## Prerequisites
- Node.js (v18 or higher)
- Docker
- Redis
- Turso Database
- Git

## Quick Start with Make

The project includes a Makefile to simplify the development setup and running process. Here are the available commands:

```bash
# First time setup (install dependencies and create .env files)
make setup

# Start all services in development mode
make dev

# Stop all services
make stop

# Clean the project (remove node_modules and build directories)
make clean

# Start only the builder service with Docker
make docker-builder

# Show all available commands
make help
```

Note: After running `make setup`, make sure to configure your `.env` files before starting the services.

## Manual Development Setup Instructions

### 1. Builder Service
```bash
cd builder-service
cp .env.example .env
# Configure the following in .env:
# - R2_ACCOUNT_ID
# - R2_ACCESS_KEY_ID
# - R2_ACCESS_KEY_SECRET
# - R2_BUCKET
# - RADIS_HOST
# - RADIS_PORT

npm install
npm run dev
```
#### Running with Docker Compose
For the builder service, use Docker. you will find a compose file in the builder-service directory:
```bash
cd builder-service
docker-compose up -d
```

### 2. Builder API
```bash
cd builder_api
cp .env.example .env
# Configure the following in .env:
# - TURSO_AUTH_TOKEN
# - TURSO_URL
# - JWT_SECRET
# - SERVER_KEY
# - REDIS_HOST
# - REDIS_PORT
# - PROXY_HOST

npm install
npm run dev
```

### 3. Console (Frontend)
```bash
cd console
npm install
npm run dev
```

### 4. Proxy Service
```bash
cd proxy
npm install
npm run dev
```



## Development Flow
1. Start all services in the order mentioned above
2. Access the console at `http://localhost:5173` (default Vite port)
3. Create an account and start deploying your React applications

## Environment Variables
Each service requires specific environment variables. Make sure to copy the respective `.env.example` files to `.env` and fill in the required values.

## TODO
- [ ] **Multiple Deployment For Same App:** Allow multiple deployments for the same app and manage deployment history and tags.
- [x] **Flutter Build Support:** Add support for building Flutter applications.
- [ ] **DNS Management:** Implement automated DNS management for domain setup.
- [ ] **Backend Server Deployment:** Enable deployment and running of backend services in Docker containers.
- [x] **Log Management:** Add log management for better tracking and debugging.
- [ ] **Multi-Runtime Support:** Support multiple runtimes (Bun and Deno).
- [x] **Multi-Framework Support:** Expand support to other frontend frameworks like Vue, Angular, etc.
- [ ] **GitHub Webhook Integration:** Automate build and deployment for every new commit with GitHub webhooks.