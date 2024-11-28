# React App Builder with Reverse Proxy

This project builds and deploys a React application from a public Git
repository and sets up a reverse proxy on a subdomain to make the app accessible via a browser. It is inspired by the [I built Vercel in 2 Hours (System Design, AWS, Docker, Redis, S3)](https://www.youtube.com/watch?v=0A_JpLYG7hM&t=385s)
video, but, due to AWS account constraints, it utilizes custom infrastructure.
Built using [dockerode](https://www.npmjs.com/package/dockerode/v/2.5.5) for Docker container management and Redis task queuing.

## Features
- **React App Builder:** Builds a React application from a specified Git repository.
- **Subdomain Reverse Proxy:** Deploys the app to a subdomain to make it accessible to the user.
## TODO
- **Flutter Build Support:** Add support for building Flutter applications.
- **DNS Management:** Implement automated DNS management for domain setup.
- **Backend Server Deployment:** Enable deployment and running of backend services in Docker containers.
- **Log Management:** Add log management for better tracking and debugging.
- **Multi-Runtime Support:** Support multiple runtimes (Bun and Deno).
- **Multi-Framework Support:** Expand support to other frontend frameworks like Vue, Angular, etc.
- **GitHub Webhook Integration:** Automate build and deployment for every new commit with GitHub webhooks.

