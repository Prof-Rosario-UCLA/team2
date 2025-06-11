# Restaurant Reservation & Waitlist App

## Overview
This application is a full-stack restaurant reservation and waitlist management system for coordinating parties with table assignments throughout the day. It is built with React (Vite) for the frontend and Express.js (Node.js) for the backend. It uses MongoDB for data storage and Redis for caching. The app supports deployment via Docker Compose or Kubernetes (GKE-ready).

## Deployment

### Docker Compose
1. **Configure MongoDB URI**: Create a `.env` file in the root with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
   ```


### Kubernetes (GKE)
1. **Build and push Docker images** to your container registry (e.g., GCR).
2. **Set up secrets** for MongoDB URI and any other sensitive data.
3. **Apply manifests**:
   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   kubectl apply -f ingress.yaml
   kubectl apply -f certificate.yaml
   kubectl apply -f frontendconfig.yaml
   ```
4. **TLS/HTTPS**: See `cert-setup.md` for internal TLS setup using cert-manager.
5. **Domain**: Update `ingress.yaml` with your domain.

---

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string (default: `redis://redis:6379`)
- `NODE_ENV`: `production` or `development`
- `VITE_GOOGLE_CLIENT_ID`: (if using Google OAuth)

---

## API Endpoints

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

#### Example: Create Reservation
```bash
curl -X POST http://localhost:1919/reservations/create \
  -H 'Content-Type: application/json' \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "partySize": 4,
    "date": "2024-06-01",
    "time": "18:00",
    "specialRequests": "Birthday dinner"
  }'
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

#### Example: Add Walk-in
```bash
curl -X POST http://localhost:1919/walkins/create \
  -H 'Content-Type: application/json' \
  -d '{
    "firstname": "Jane",
    "lastname": "Smith",
    "phone": "9876543210",
    "partySize": 2,
    "date": "2024-06-01",
    "time": "19:00",
    "specialRequests": "Window seat"
  }'
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

#### Example: Create Table
```bash
curl -X POST http://localhost:1919/tables/create \
  -H 'Content-Type: application/json' \
  -d '{
    "tableNum": 1,
    "maxCapacity": 4,
    "comments": "Near window"
  }'
```

---

## Data Models
- **Reservation**: name, email, phone, tableNum, size, startTime, endTime, comments
- **WalkIn**: name, phoneNumber, tableNum, size, timeAddedToWaitlist, startTime, endTime, comments
- **Table**: tableNumber, tableCapacity, comments

---

## Notes
- All endpoints return JSON.
- For more advanced deployment (TLS, GKE, Ingress), see `cert-setup.md` and `kub-setup.md`.
- Caching is handled via Redis for reservations and walk-ins.
- For questions or issues, see the code comments or open an issue.
