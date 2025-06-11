# Restaurant Reservation & Waitlist App

## Overview
This application is a full-stack restaurant reservation and waitlist management system for coordinating parties with table assignments throughout the day. It is built with React (Vite) for the frontend and Express.js (Node.js) for the backend. It uses MongoDB for data storage and Redis for caching. The app supports deployment via Docker Compose or Kubernetes (GKE-ready).

## Deployment

### Setup
1. **Clone the GitHub Repo**
```bash
git clone https://github.com/Prof-Rosario-UCLA/team2.git
```

### Local Configuration
1. **Configure MongoDB URI**: Create a `.env` file in the root with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
   ```

2. **Configure Google Client ID**: For Google SSO, create a project and add your GOOGLE_CLIENT_ID:
   ```env 
   VITE_GOOGLE_CLIENT_ID="client-id-here"
   ```

Run `npm run dev` to start the project on localhost:1919.

### CI/CD Setup
1. Configure CI/CD with the following environment variables:
ARTIFACT_REGISTRY_REPO
GCP_PROJECT_ID
GCP_SA_KEY
GKE_CLUSTER_NAME
GKE_CLUSTER_ZONE
MONGO_URI
VITE_GOOGLE_CLIENT_ID

When pushing commits to the origin/main branch, the Github Actions pipeline in .github/workflows/deploy.yml will automatically start.


## API Endpoints

## Data Models
- **Reservation**: name, email, phone, tableNum, size, startTime, endTime, comments
- **WalkIn**: name, phoneNumber, tableNum, size, timeAddedToWaitlist, startTime, endTime, comments
- **Table**: tableNumber, tableCapacity, comments

---

### Reservations
Base path: `/reservations`

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/`                     | Get all reservations               |
| GET    | `/range?startDate=...&endDate=...` | Get reservations in date range |
| POST   | `/create`               | Create a new reservation           |
| PATCH  | `/updateReservation`    | Update reservation table assignment|
| DELETE | `/:id`                  | Delete a reservation by ID         |

#### Reservation Object
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "tableNum": 5,
  "size": 4,
  "startTime": "2024-06-01T18:00:00.000Z",
  "endTime": "2024-06-01T20:00:00.000Z",
  "comments": "Birthday dinner"
}
```
---

### Walk-ins
Base path: `/walkins`

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/`                     | Get all walk-ins                   |
| GET    | `/range?startDate=...&endDate=...` | Get walk-ins in date range   |
| POST   | `/create`               | Add a new walk-in to waitlist      |
| PATCH  | `/updateWalkin`         | Assign table to walk-in            |

#### Walk-in Object
```json
{
  "name": "Jane Smith",
  "phoneNumber": "9876543210",
  "tableNum": 2,
  "size": 2,
  "timeAddedToWaitlist": "2024-06-01T19:00:00.000Z",
  "startTime": null,
  "endTime": null,
  "comments": "Window seat"
}
```

---

### Tables
Base path: `/tables`

| Method | Endpoint         | Description                |
|--------|------------------|----------------------------|
| GET    | `/`              | Get all tables             |
| GET    | `/:tableNumber`  | Get table by number        |
| POST   | `/create`        | Create a new table         |

#### Table Object
```json
{
  "tableNumber": 1,
  "tableCapacity": 4,
  "comments": "Near window"
}
```

---