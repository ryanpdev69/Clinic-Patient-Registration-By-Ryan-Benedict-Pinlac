# Clinic Patient Registration System

Simple full-stack clinic patient registration system for the CLDH technical assessment. The app lets an authenticated user log in and manage basic patient records through a protected React screen backed by an ASP.NET Core Web API.

No real patient data is included or required.

## Tech Stack

- Backend: ASP.NET Core Web API, C#, Entity Framework Core, SQLite, JWT authentication
- Frontend: React, JavaScript, HTML, CSS, Vite
- Database: Local SQLite database file

## Features

- Login and logout
- JWT-protected patient management page
- Create, view, edit, and delete patient records
- Required-field validation
- Token storage in `localStorage`
- Protected API endpoints
- Seeded default admin account

## Folder Structure

```txt
ClinicPatientRegistration/
|-- backend/
|   `-- ClinicPatient.Api/
|-- frontend/
|   `-- clinic-patient-client/
|-- AGENTS.MD
|-- INSTRUCTIONS.MD
|-- README.MD
`-- .gitignore
```

## Prerequisites

- .NET 8 SDK
- Node.js and npm

This repository was created in an environment where Node/npm were available, but `dotnet` was not on PATH. Install the .NET 8 SDK before running or building the backend.

## Backend Setup

From the backend project folder:

```bash
cd backend/ClinicPatient.Api
dotnet restore
dotnet run
```

Default backend URLs:

- HTTP: `http://localhost:5088`
- Swagger in development: `http://localhost:5088/swagger`

The API uses SQLite with this default connection string:

```txt
Data Source=clinicpatients.db
```

The database file is created locally when the API starts. SQLite database files are ignored by Git.

## Frontend Setup

From the frontend project folder:

```bash
cd frontend/clinic-patient-client
npm install
npm run dev
```

Default frontend URL:

```txt
http://localhost:5173
```

If the backend URL changes, create a local `.env` file in the frontend project:

```txt
VITE_API_BASE_URL=http://localhost:5088/api
```

`.env` files are ignored by Git.

## Default Login

```txt
Username: admin
Password: admin123
```

The seeded admin password is stored as a hash, not plain text.

## API Endpoints

Auth:

```txt
POST /api/auth/login
POST /api/auth/logout
```

Patients, all protected by JWT:

```txt
GET /api/patients
GET /api/patients/{id}
POST /api/patients
PUT /api/patients/{id}
DELETE /api/patients/{id}
```

Login request:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Login response:

```json
{
  "token": "jwt_token_here",
  "username": "admin"
}
```

Patient request:

```json
{
  "patientName": "Juan Dela Cruz",
  "birthDate": "2001-05-15",
  "gender": "Male",
  "contactNumber": "09123456789",
  "address": "Tarlac City"
}
```

Protected requests must include:

```txt
Authorization: Bearer <token>
```

## Security Notes

- Patient pages and patient API endpoints require authentication.
- Passwords are hashed using ASP.NET Core password hashing.
- The JWT secret in `appsettings.Development.json` is for local development only.
- Do not commit production secrets.
- Do not use real patient information.
- Required patient fields are validated before saving.

## AI Assistance Disclosure

AI assistance was used as a guide for planning, code structure, documentation, and debugging support. The applicant is responsible for reviewing, understanding, organizing, and explaining the final submitted code.
