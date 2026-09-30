# web-dev-files

A simple Node.js web application that can be deployed locally and validated through HTTP requests.

## Features

- Static HTML landing page
- CSS styling
- Simple JavaScript health check
- Local HTTP server
- Jenkins pipeline support for HTTP validation

## Run locally

```bash
npm install
npm start
```

Then open:

```bash
http://localhost:3000
```

## Validate the deployment

```bash
curl -I http://localhost:3000
curl http://localhost:3000/health
```

Expected result:

- HTTP status: 200
- Health response: { "status": "ok", "message": "Application is running" }

## Jenkins pipeline

The repository contains a `Jenkinsfile` that can validate a target URL with the following options:

- STATUS_CODE
- RESPONSE_TIME
- CONTENT_CHECK

Use Jenkins build parameters to run it against `http://localhost:3000`.
