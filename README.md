# Election Assistant

An interactive full-stack application that helps users understand election processes, timelines, and steps for multiple countries. Integrates with the **Google Civic Information API** for live election data.

## Architecture

```
election-assistant/
├── backend/          # Spring Boot 3.2 (Java 17+)
├── frontend/         # Angular 17 (Zoneless, Signals, Standalone)
└── README.md
```

## Features

- **Multi-Country Election Processes**: Step-by-step guides for US, India, UK, Australia, and Canada elections
- **Interactive Timeline**: Expandable steps with descriptions, durations, and key milestones
- **Google Civic Information API Integration**:
  - Upcoming elections lookup
  - Find representatives by address
  - Voter info with polling locations
- **Dark/Light Theme**: Auto-detects system preference
- **Responsive Design**: Works on mobile, tablet, and desktop

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- Angular CLI 17+ (`npm install -g @angular/cli`)

## Setup

### 1. Google Civic Information API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google Civic Information API**
4. Create an API key under **Credentials**
5. Set the environment variable:

```bash
export GOOGLE_CIVIC_API_KEY=your-api-key-here
```

### 2. Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

API Documentation (Swagger): `http://localhost:8080/swagger-ui.html`

### 3. Frontend

```bash
cd frontend
npm install
ng serve
```

The app will be available at `http://localhost:4200`.

## API Endpoints

### Election Process (Educational Data)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/election-process/countries` | List all available countries |
| GET | `/api/election-process/{countryCode}` | Get all election types for a country |
| GET | `/api/election-process/{countryCode}/{electionType}` | Get specific election process details |

### Google Civic Information (Live Data)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/civic/elections` | Upcoming elections |
| GET | `/api/civic/representatives?address=` | Find representatives by address |
| GET | `/api/civic/voter-info?address=&electionId=` | Voter info and polling locations |

## Tech Stack

### Backend
- Spring Boot 3.2
- Spring WebFlux (WebClient for API calls)
- Caffeine Cache
- SpringDoc OpenAPI (Swagger)
- Java 17 Records

### Frontend
- Angular 17 (Zoneless change detection)
- Signals-based state management
- Standalone components with lazy loading
- CSS Variables for theming
- Material Icons
