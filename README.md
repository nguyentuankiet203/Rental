# Rental Management SaaS - Backend

A scalable rental management backend built with NestJS and Supabase, designed to help landlords manage properties, tenants, contracts, payments, and rental operations efficiently.

## Features

- JWT Authentication
- Role-Based Access Control (Admin, Landlord, Tenant)
- Property Management
- Tenant Management
- Contract Management
- Payment Tracking
- File Upload Support
- RESTful API Architecture
- API Documentation with Swagger
- Docker Containerization
- CI/CD with GitHub Actions
- Supabase Integration

---

## Tech Stack

### Backend

- NestJS
- TypeScript
- Node.js
- Passport JWT
- Class Validator

### Database

- Supabase
- PostgreSQL

### Tools

- Docker
- GitHub Actions
- Swagger
- Postman

---

## Project Structure

src/

├── auth/

├── users/

├── properties/

├── tenants/

├── contracts/

├── payments/

├── upload/

├── common/

└── main.ts


---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd Rental
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3001

JWT_SECRET=your_secret

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Run Development

```bash
npm run start:dev
```

### Build Production

```bash
npm run build
npm run start:prod
```

---

## Docker

### Build Image

```bash
docker build -t rental-backend .
```

### Run Container

```bash
docker run -p 3001:3001 --env-file .env rental-backend
```

---

## API Documentation

Swagger:

```text
http://localhost:3001/api
```

---

## Authentication

All protected endpoints require JWT Bearer Token.

Example:

```http
Authorization: Bearer <your_token>
```

---

## CI/CD

GitHub Actions automatically:

- Install dependencies
- Build NestJS project
- Build Docker image
- Push Docker image to Docker Hub

Docker Hub:

https://hub.docker.com/

---

## Deployment

Backend:

- Render

Database:

- Supabase

---

## Future Improvements

- Unit Testing (Jest)
- Refresh Token Authentication
- Email Notifications
- Redis Caching
- Payment Gateway Integration
- Microservices Architecture

---

## Author

Nguyen Tuan Kiet

GitHub:
https://github.com/nguyentuankiet203