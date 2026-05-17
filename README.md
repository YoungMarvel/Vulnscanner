# VulnScan Pro

A high-performance security auditing platform powered by Gemini AI.

## Features

- **AI-Powered Heuristics**: Deep packet inspection and XSS/SQLi detection using Google's Gemini models.
- **Header Security Audit**: Real-time analysis of HTTP response headers for missing security guards.
- **Network Ingress Analysis**: Simulated port scanning and network vector mapping.
- **Real-Time Dashboards**: Interactive visualizations of scan frequency and vulnerability trends.
- **Operator Activity Logs**: Security logging of all administrative and user sessions.
- **Secure Authentication**: Robust identity management with password recovery and Google Auth.

## Running Locally in VS Code

Follow these steps to set up the development environment on your local machine.

### 1. Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Git](https://git-scm.com/)

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-name>
```

### 3. Install Dependencies

Install the required npm packages:

```bash
npm install
```

### 4. Environment Configuration

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and provide your secrets:
   - `GEMINI_API_KEY`: Obtain an API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).
   - `APP_URL`: Set to `http://localhost:3000` for local development.

### 5. Firebase Configuration

The application uses Firebase for authentication and database management. 

1. Ensure you have a `firebase-applet-config.json` file in the root directory. If you are exporting from Google AI Studio, this file should be included.
2. If you are setting up from scratch:
   - Create a project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore and Authentication (Google & Email/Password).
   - Download the web configuration and save it as `firebase-applet-config.json`.

### 6. Authentication for Firebase Admin

In local dev, `firebase-admin` might require a service account key or Application Default Credentials (ADC) if you want to use real Firestore from the server side. 

For the most basic setup, you can use the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) to set up ADC:
```bash
gcloud auth application-default login
```

### 7. Launch Development Server

Start the application in development mode:

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

## Deployment

The application is configured to build into a production-ready bundle.

```bash
npm run build
npm start
```

## Security Disclosure

This tool is for educational and authorized security testing purposes only. Always obtain explicit permission before scanning any target.
