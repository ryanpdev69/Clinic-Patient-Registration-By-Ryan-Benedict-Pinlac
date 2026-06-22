# INSTRUCTIONS.md

## Project Goal

Build a complete **Clinic Patient Mini Registration System** for a technical assessment.

The system must allow an authenticated user to manage basic patient records using a protected patient management screen.

## Assessment Requirements

The project must include:

* Authentication
* Login
* Logout
* Protected patient management screen
* Patient CRUD
* Create patient record
* View patient records
* Edit patient record
* Delete patient record
* Local SQLite database
* Backend API
* Frontend web application
* README.md
* AGENTS.md
* .gitignore
* Meaningful Git commit history

Do not use real patient data.

---

## Required Tech Stack

Use the following stack:

### Backend

* ASP.NET Core Web API
* C#
* Entity Framework Core
* SQLite
* JWT authentication

### Frontend

* React
* JavaScript
* HTML
* CSS

### Database

* Local SQLite database file

---

## Project Structure

Create this structure:

```txt
ClinicPatientRegistration/
│
├── backend/
│   └── ClinicPatient.Api/
│
├── frontend/
│   └── clinic-patient-client/
│
├── README.md
├── AGENTS.md
├── INSTRUCTIONS.md
└── .gitignore
```

---

## Backend Requirements

Create an ASP.NET Core Web API inside:

```txt
backend/ClinicPatient.Api/
```

The backend must include:

* SQLite database connection
* Entity Framework Core DbContext
* Patient model
* User model
* Authentication controller
* Patient controller
* JWT token generation
* Protected patient API endpoints
* Database seeding for one default admin account
* Validation for required fields
* CORS configuration for React frontend

---

## Backend Models

### User

Create a `User` entity with:

```txt
Id
Username
PasswordHash
CreatedAt
```

### Patient

Create a `Patient` entity with:

```txt
Id
PatientName
BirthDate
Gender
ContactNumber
Address
CreatedAt
UpdatedAt
```

Required fields:

```txt
PatientName
BirthDate
Gender
ContactNumber
Address
```

---

## Authentication Requirements

Use JWT authentication.

Create default seeded admin login:

```txt
Username: admin
Password: admin123
```

Important:

* Do not store the password as plain text.
* Store a password hash.
* On successful login, return a JWT token.
* Frontend must store the token and send it using the Authorization header.
* Patient endpoints must require authentication.

---

## Backend API Endpoints

Create these endpoints:

### Auth

```txt
POST /api/auth/login
POST /api/auth/logout
```

`POST /api/auth/login` should accept:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

It should return:

```json
{
  "token": "jwt_token_here",
  "username": "admin"
}
```

`POST /api/auth/logout` can return a success message. Since JWT is stateless, frontend logout mainly removes the token.

---

### Patients

All patient endpoints must be protected.

```txt
GET /api/patients
GET /api/patients/{id}
POST /api/patients
PUT /api/patients/{id}
DELETE /api/patients/{id}
```

Example patient JSON:

```json
{
  "patientName": "Juan Dela Cruz",
  "birthDate": "2001-05-15",
  "gender": "Male",
  "contactNumber": "09123456789",
  "address": "Tarlac City"
}
```

---

## Frontend Requirements

Create a React frontend inside:

```txt
frontend/clinic-patient-client/
```

The frontend must include:

* Login page
* Patient management page
* Protected route behavior
* Logout button
* Patient table
* Add patient form
* Edit patient form
* Delete patient button
* Basic error messages
* Basic loading states

---

## Frontend Pages

### Login Page

Path:

```txt
/login
```

Features:

* Username input
* Password input
* Login button
* Error message for failed login
* Redirect to patient page after successful login

Use default credentials:

```txt
Username: admin
Password: admin123
```

---

### Patient Management Page

Path:

```txt
/patients
```

Features:

* Show list of patients
* Add new patient
* Edit existing patient
* Delete patient
* Logout
* Prevent access if not logged in

Patient table columns:

```txt
Patient Name
Birth Date
Gender
Contact Number
Address
Actions
```

---

## Frontend API Behavior

Use an API helper file for backend requests.

All protected patient requests must send:

```txt
Authorization: Bearer <token>
```

Store the token in `localStorage`.

On logout:

* Remove token from `localStorage`
* Redirect to `/login`

---

## Security Requirements

Implement basic security awareness:

* Hash passwords
* Protect API endpoints
* Validate required fields
* Do not use real patient data
* Do not commit sensitive secrets
* Keep JWT secret in configuration
* Add `.env` or config files to `.gitignore` when needed

For this assessment, it is acceptable to use a development JWT secret in `appsettings.Development.json`, but document it clearly in README.md.

---

## README.md Requirements

Create a clear README.md that includes:

* Project title
* Project description
* Tech stack
* Features
* Folder structure
* Setup instructions
* Backend run instructions
* Frontend run instructions
* Database information
* Default login credentials
* API endpoints
* Notes about AI assistance
* Notes that no real patient data is used

---

## AGENTS.md Requirement

Include an AGENTS.md file in the root folder.

AGENTS.md must explain:

* AI-assisted programming was used
* The applicant reviewed and understands the code
* AI was used only for guidance, planning, documentation, and debugging
* The applicant can explain the final submitted code

---

## .gitignore Requirements

Create a .gitignore that excludes:

```txt
bin/
obj/
node_modules/
dist/
build/
.env
.env.local
*.db
*.sqlite
.vs/
.vscode/
```

Do not ignore README.md, AGENTS.md, or INSTRUCTIONS.md.

---

## Suggested Development Steps

Build the project in this order:

1. Create root project folder.
2. Initialize Git.
3. Create backend ASP.NET Core Web API.
4. Add Entity Framework Core and SQLite.
5. Create User and Patient models.
6. Create DbContext.
7. Configure SQLite connection.
8. Add database migrations.
9. Seed default admin user.
10. Add JWT authentication.
11. Create auth login endpoint.
12. Create protected patient CRUD endpoints.
13. Test backend using Swagger.
14. Create React frontend.
15. Create login page.
16. Create patient management page.
17. Connect frontend to backend API.
18. Add logout behavior.
19. Add README.md.
20. Add AGENTS.md.
21. Final test.
22. Make final cleanup commits.

---

## Suggested Git Commits

Use meaningful commits such as:

```bash
git add .
git commit -m "Initial project setup"

git add .
git commit -m "Add backend API project"

git add .
git commit -m "Add SQLite database models"

git add .
git commit -m "Add authentication with JWT"

git add .
git commit -m "Add protected patient CRUD endpoints"

git add .
git commit -m "Add React frontend project"

git add .
git commit -m "Add login page"

git add .
git commit -m "Add patient management CRUD UI"

git add .
git commit -m "Add documentation files"

git add .
git commit -m "Final cleanup before submission"
```

---

## Completion Checklist

Before submission, confirm:

* Backend runs without errors
* Frontend runs without errors
* Login works
* Logout works
* Patient page is protected
* Add patient works
* View patients works
* Edit patient works
* Delete patient works
* SQLite database is used
* README.md exists
* AGENTS.md exists
* INSTRUCTIONS.md exists
* .gitignore exists
* GitHub repository is public
* Git history has meaningful commits
* No real patient data is included

---

## Final Expected Output

The final repository should be a public GitHub repository containing the full source code and documentation.

The repository must be ready for the recruiter to clone, run, and review.
