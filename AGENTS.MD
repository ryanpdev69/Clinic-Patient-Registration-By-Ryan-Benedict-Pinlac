# AGENTS.md

## Project Name

Clinic Patient Registration System

## Project Objective

Build a simple clinic patient registration system that allows an authenticated user to manage basic patient records.

This project is created for the CLDH technical assessment.

## Allowed AI Assistance

AI-assisted programming was used only as a guide for planning, code structure, debugging support, and documentation improvement.

The final code was reviewed, understood, and organized by the applicant.

## Applicant Responsibility

The applicant is responsible for understanding and explaining:

* Project structure
* Authentication flow
* Patient CRUD operations
* Database configuration
* API endpoint behavior
* Frontend and backend communication
* Security decisions
* Git commit history

## Technology Stack

### Backend

* ASP.NET Core Web API
* Entity Framework Core
* SQLite
* JWT Authentication

### Frontend

* React
* JavaScript
* HTML/CSS

### Database

* Local SQLite database

## Main Features

* Login and logout
* Protected patient management screen
* Create patient record
* View patient records
* Edit patient record
* Delete patient record

## Patient Fields

Each patient record contains:

* Patient Name
* Birth Date
* Gender
* Contact Number
* Address

## Security Notes

* Patient management pages require authentication.
* Patient API endpoints are protected.
* Sensitive configuration values should not be hardcoded in production.
* Real patient data must not be used.
* Required fields are validated before saving.
* Passwords should be hashed instead of stored as plain text.

## Development Rules Followed

* Use meaningful file names.
* Keep backend and frontend code organized.
* Keep database access inside backend services/controllers.
* Do not expose unnecessary sensitive information to the frontend.
* Use meaningful Git commits.
* Avoid submitting only one final upload commit.

## AI Usage Disclosure

AI assistance was used for:

* Creating a development plan
* Suggesting project structure
* Drafting documentation
* Explaining implementation steps
* Helping debug possible issues

AI assistance was not used to blindly submit code without review.

## How to Explain This Project

This project has a backend API that handles authentication and patient records. The frontend allows the user to log in and manage patients through a protected screen.

When the user logs in successfully, the backend returns an authentication token. The frontend stores the token and sends it with requests to protected patient endpoints.

The backend stores patient records in a local SQLite database using Entity Framework Core.

## Notes

This project uses sample data only. No real patient information is included.
