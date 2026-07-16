# Design Spec: Cloud Run Deployment Guide and Dockerfile

This document outlines the design and implementation details for creating a step-by-step deployment guide and a corresponding Nginx configuration to deploy the current "Smart Logistics Dispatch Center" static web application to Google Cloud Run using the `gcloud` CLI.

Write in Traditional Chinese (`zh-tw`).

## Goal
To write a comprehensive, clear, and actionable deployment guide in Traditional Chinese (`docs/Cloud-Run-Deployment-Guide.md`) and provide a working `Dockerfile` in the repository root to enable easy containerization and deployment.

## Scope of Changes

### 1. Dockerfile
Create a minimal `Dockerfile` at the root of the repository to containerize the static HTML, CSS, and JS files.

- **Base Image**: `nginx:alpine` (for a lightweight and secure web server environment).
- **Files to Copy**: Copy `index.html`, `style.css`, `app.js` into `/usr/share/nginx/html/`.
- **Port Exposure**: Expose port `8080` (Cloud Run expects port 8080 by default).
- **Nginx Configuration modification**:
  Replace Nginx port `80` with `8080` to align with Cloud Run's default routing port:
  ```dockerfile
  FROM nginx:alpine
  COPY . /usr/share/nginx/html
  # Configure Nginx to listen on port 8080 instead of 80
  RUN sed -i 's/listen\(.*\)80;/listen 8080;/g' /etc/nginx/conf.d/default.conf
  EXPOSE 8080
  ```

### 2. Deployment Guide Document
Create [docs/Cloud-Run-Deployment-Guide.md](file:///g:/01DevG/Google-5-Day-AI-Agents-Intensive-Course/day1/my-first-cloud-run/docs/Cloud-Run-Deployment-Guide.md).

- **Format**: Markdown with detailed steps in Traditional Chinese (`zh-tw`).
- **Structure**:
  - Introduction
  - Prerequisites (`gcloud` CLI install, init, project set, API enablement)
  - Dockerfile setup
  - Local verification steps (using `docker build` and `docker run`)
  - Cloud Run deployment instructions (`gcloud run deploy`)
  - Verification on Cloud Run
  - Cleanup resources (`gcloud run services delete`)

## Verification Plan
1. **Lint & Validation**: Check the markdown formatting of the guide.
2. **Local Run Test**: Propose running the Docker container locally to confirm Nginx serves `index.html` correctly on port 8080.
