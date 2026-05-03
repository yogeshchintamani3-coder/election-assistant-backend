# Election Assistant

## Problem Statement

Citizens worldwide often lack easily accessible, centralized information about their country's election processes, representative lookup, and voter registration. This creates barriers to civic participation and informed voting.

## Solution

Election Assistant is a full-stack web application that provides:
- **Multi-country election education** with step-by-step interactive timelines
- **Live U.S. civic data** via Google Civic Information API (representatives, voter info, polling locations)
- **Country-specific resources** linking to official election commissions and voter registration portals
- **Interactive quizzes** to test knowledge of election processes

## Architecture

```
Frontend (Angular 17)          Backend (Spring Boot 3.2)
┌─────────────────────┐        ┌──────────────────────────┐
│  Firebase Hosting   │        │  Render (Docker)          │
│                     │  REST  │                          │
│  Standalone Comps   │◄──────►│  Controller Layer        │
│  Signals State      │        │  Service Layer           │
│  Zoneless CD        │        │  Repository Layer        │
│  Lazy Loading       │        │  Exception Handling      │
│  Google Sign-In     │        │  Spring Security + JWT   │
│  Route Guards       │        │  Caffeine Cache          │
└─────────────────────┘        └──────┬───────────────────┘
                                      │
                                      ▼
                               Google Civic API v2
```

## Features

| Feature | Description | Route |
|---------|-------------|-------|
| Election Process Education | Multi-country election timelines with steps, key dates, eligibility | `/`, `/election/:country/:type` |
| Interactive Quiz | Test knowledge after studying an election process | Embedded in timeline |
| Representatives Lookup | Find elected officials by U.S. address (Google Civic API) | `/civic-search` |
| Voter Information | Polling locations, early vote sites, registration links | `/voter-info` |
| Country Resources | Election commission links for 5 countries | `/civic-search`, `/voter-info` |
| Dark/Light Theme | System-aware with manual toggle | Global |
| Google Sign-In | OAuth authentication for civic data features | `/login` |

## Tech Stack

### Frontend
- Angular 17 (Zoneless change detection, no Zone.js)
- Signals-based state management
- Standalone components with lazy loading
- CSS Variables for theming
- Google Identity Services for authentication

### Backend
- Spring Boot 3.2 (Java 17)
- Spring Security with JWT (Google ID token verification)
- Spring WebFlux WebClient for external API calls
- Caffeine Cache for API response caching
- SpringDoc OpenAPI (Swagger UI)
- Clean Architecture: Controller → Service → Repository → DTO

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- Angular CLI 17+

## Environment Variables

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CIVIC_API_KEY` | Google Civic Information API key | Yes (for civic features) |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth 2.0 client ID | Yes (for authentication) |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated) | No (defaults to Firebase URL) |
| `PORT` | Server port | No (defaults to 8080) |

### Frontend
Set `googleClientId` in `src/environments/environment.ts` and `environment.prod.ts`.

## Setup

### Backend
```bash
cd backend
export GOOGLE_CIVIC_API_KEY=your-api-key
export GOOGLE_OAUTH_CLIENT_ID=your-client-id
mvn clean install
mvn spring-boot:run
```
API available at http://localhost:8080 | Swagger: http://localhost:8080/swagger-ui.html

### Frontend
```bash
cd frontend
npm install
ng serve
```
App available at http://localhost:4200

## API Endpoints

### Election Process (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/election-process/countries` | List all countries |
| GET | `/api/election-process/{countryCode}` | Election types for a country |
| GET | `/api/election-process/{countryCode}/{electionType}` | Specific election process |
| GET | `/api/election-process/resources/{countryCode}` | Country election resources |

### Google Civic Information
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/civic/elections` | Public | Upcoming elections |
| GET | `/api/civic/representatives?address=` | Required | Find representatives |
| GET | `/api/civic/voter-info?address=&electionId=` | Required | Voter info & polling |

## Testing

```bash
cd backend
mvn test
```

43 tests covering:
- Unit tests for ElectionProcessService (14 tests)
- Unit tests for GoogleCivicService with MockWebServer (10 tests)
- Controller tests for ElectionProcessController (7 tests)
- Controller tests for GoogleCivicController (6 tests)
- Integration tests (6 tests)

## Deployment

### Frontend → Firebase Hosting
Automated via GitHub Actions on push to `master` branch.

### Backend → Render
Deployed as Docker container using the included `Dockerfile`.

## Countries Supported

| Country | Election Types | Live Civic Data |
|---------|---------------|-----------------|
| 🇺🇸 United States | Presidential, Congressional | Yes (Google Civic API) |
| 🇮🇳 India | Lok Sabha, Vidhan Sabha | Resources only |
| 🇬🇧 United Kingdom | General Election | Resources only |
| 🇦🇺 Australia | Federal | Resources only |
| 🇨🇦 Canada | Federal | Resources only |
