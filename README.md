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

## How Rate Limiter Works (Simple Explanation)

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

npm install

### Step 2: Setup `.env`

PORT=5000
DATABASE_URL=your_postgres_url (create database at Neon or supabase db and replace this url)
BASE_URL=http://localhost:5000

### Step 3: Run project

npm run dev


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


