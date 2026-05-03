# URL Shortener with Rate Limiting & Analytics

## Project Overview

This project is a **URL Shortener Backend API** built using **Node.js, Express, TypeScript, and PostgreSQL (Sequelize ORM)**.

It allows users to:

* Convert long URLs into short links
* Redirect users using short links
* Track number of clicks
* View analytics (last 7 days clicks)
* Prevent abuse using a **custom rate limiter**


## Features

### 1. URL Shortening

Users can send a long URL and get a **6-character short code**.

### 2. Redirection & Tracking

When a user opens a short URL:

* They are redirected to the original URL
* Click is recorded with:

  * IP address
  * User-Agent
  * Timestamp

### 3. Custom Rate Limiter

* Each IP can create only **5 short URLs per minute**
* If exceeded → returns **HTTP 429 error**
* Includes retry time

### 4. Analytics

* Shows clicks for the **last 7 days**
* Returns daily click count

---

## How Rate Limiter Works

The rate limiter is implemented using an **in-memory Map**.

* Each user (IP address) has:

  * `count` → number of requests
  * `windowStart` → start time of 1-minute window

### Flow:

1. When request comes → check IP
2. If first time → create entry
3. If 1 minute passed → reset count
4. If request count > 5:

   * Block request
   * Return 429 error with retry time
5. Otherwise → allow request

This is called a **Fixed Window Rate Limiting Algorithm**.

---

##  Project Structure

```
src/
 - config/        # Database configuration
 - middleware/    # Rate limiter
 - models/        # Sequelize models (URL, Click)
 - routes/        # API routes
 - utils/         # Short code generator
 - types/         # Interfaces
 - index.ts       # Entry point

```

## Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Sequelize ORM
* Docker


## Running with Docker

### Step 1: Clone the repo
git clone https://github.com/bhattaraiprati/URL-Shortener-Backend-API.git

cd Shortener-Backend-API

### Step 2: Build & Run
```
docker-compose up --build

```

### Step 3: Access API

```
http://localhost:5000
```


##  Running Locally

### Step 1: Install dependencies
```
npm install
```
### Step 2: Setup `.env`
```
DATABASE_URL=your_postgres_url (create database at Neon or supabase db and replace this url)

```
### Step 3: Run project
```
npm run dev
```

##  Health Check

```
GET /health
```

Response:

```json
{
  "status": "OK",
  "message": "Server is running"
}
```
---

#  API Documentation

To explore and test the APIs, you can use the **Swagger UI** available locally.

### How to Access Swagger UI:
1.  Run the project locally: `npm run dev`
2.  Open your browser and go to: `http://localhost:5000/api-docs`

From there, you can view all endpoints, see request/response schemas, and try out the APIs directly from your browser.

---

Base URL:

```
http://localhost:5000/api
```

---

## 1. Shorten URL

### POST `/shorten`

### Request

```json
{
  "originalUrl": "https://example.com"
}
```

### Response

```json
{
  "success": true,
  "shortCode": "abc123",
  "shortUrl": "http://localhost:5000/abc123",
  "originalUrl": "https://example.com"
}
```

### Error (Rate Limit)

```json
{
  "message": "Rate limit exceeded. You can only shorten 5 URLs per minute",
  "secondsRemaining": 45
}
```

---

## 2. Get All URLs

### GET `/urls`

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "short_code": "abc123",
      "original_url": "https://example.com",
      "clicks": 10,
      "created_at": "2026-01-01"
    }
  ]
}
```

---

## 3. Get Analytics

### GET `/analytics/:alias`

### Example

```
/analytics/abc123
```

### Response

```json
{
  "success": true,
  "data": [
    { "date": "2026-01-01", "clicks": 5 },
    { "date": "2026-01-02", "clicks": 8 }
  ]
}
```

---

##  Error Handling

* 400 → Invalid input
* 404 → URL not found
* 429 → Rate limit exceeded
* 500 → Server error

---

##  Key Learning Points (Assessment Focus)

### Backend Skills

* REST API design
* Middleware (Rate Limiter)
* Database modeling

### System Design

* Fixed Window Rate Limiting
* Time-based analytics

###  Data Handling

* Click tracking
* Aggregation using SQL functions

### Error Handling

* Proper HTTP status codes
* User-friendly messages

---


