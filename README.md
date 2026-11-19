# JobConnect – Online Job Portal System

A comprehensive full-stack educational web application developed using **Node.js, Express.js, MongoDB (Mongoose), HTML5, CSS3, and JavaScript**.

This repository integrates college lab practicals while preserving complete backward compatibility and all existing portal features:
- **Practical 1:** Design, develop and deploy a web application to interact with NoSQL database from a Node application.
- **Practical 2:** Design, develop and deploy a web application to demonstrate server-side validation using Node.js.
- **Practical 5:** Create RESTful APIs to perform CRUD operations in the Database, deploy the application on web hosting (Render), and test the APIs using Postman.

---

## Table of Contents

1. [Features & Practical Modules](#features--practical-modules)
2. [Technology Stack](#technology-stack)
3. [Project Folder Structure](#project-folder-structure)
4. [Local Setup & Installation](#local-setup--installation)
5. [Database Configuration (MongoDB Local & Atlas)](#database-configuration)
6. [Practical 5: RESTful CRUD API Specifications](#practical-5-restful-crud-api-specifications)
7. [Postman API Testing Guide](#postman-api-testing-guide)
8. [Deployment Instructions for Render](#deployment-instructions-for-render)
9. [Report Screenshots Checklist](#report-screenshots-checklist)

---

## Features & Practical Modules

### 1. JobConnect Core System (Practical 1)
- User Authentication: Registration and Login with bcrypt password hashing and JWT token authorization.
- Three Distinct User Roles:
  - **Job Seeker:** Browse vacancies, search with live filters, apply with cover letter and resume upload (PDF/DOC up to 2MB), track application status.
  - **Employer:** Post vacancies, manage active listings, review applicants, download candidate resumes, update application statuses (Pending, Shortlisted, Accepted, Rejected).
  - **Admin:** System overview dashboard, view stats, manage all users and vacancies.
- MongoDB Collections: `users`, `jobs`, and `applications`.

### 2. Server-Side Validation (Practical 2)
- Form available at `http://localhost:5000/#/validation` (accessible from the top navigation bar "Validation Practical").
- Strict validation rules executed entirely on the Node.js server before any database write:
  - Full Name (2–60 chars), Email (regex pattern), Phone (exact 10 digits), Job Role (max 80 chars), Experience (0–50), Skills (non-empty list, max 40 chars each), Cover Letter (20–1000 chars).
- Returns HTTP `422 Unprocessable Entity` on invalid data with field-specific errors.
- On valid submission, stores record in MongoDB collection `validationsubmissions` and returns HTTP `201 Created`.

### 3. RESTful CRUD API & Deployment (Practical 5)
- Standardized RESTful endpoints for all four CRUD operations on the `Job` resource:
  - **Create (POST):** Add a new job vacancy (`HTTP 201`).
  - **Read (GET):** Retrieve all jobs (`HTTP 200`) or a specific job by MongoDB ID (`HTTP 200`).
  - **Update (PUT):** Update an existing job record safely without data loss (`HTTP 200`).
  - **Delete (DELETE):** Remove an existing job and cascade clean its applications (`HTTP 200`).
- Error and status code handling: `200`, `201`, `400`, `401`, `403`, `404`, and `500`.
- Automated testing support via importable Postman collection (`JobConnect_Practical5.postman_collection.json`).
- Production-ready cloud deployment configuration for Render and MongoDB Atlas.

---

## Technology Stack

- **Backend:** Node.js, Express.js (Express Router)
- **Database & ODM:** MongoDB Community / MongoDB Atlas, Mongoose
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **File Upload:** `multer` (for resume attachments)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Single-Page App routing)
- **Testing:** Postman
- **Cloud Hosting:** Render (`render.yaml` blueprint included)

---

## Project Folder Structure

```
JobConnect/
├── middleware/
│   └── auth.js                    # JWT verification and role authorization middleware
├── models/
│   ├── Application.js             # Mongoose schema for job applications & resumes
│   ├── Job.js                     # Mongoose schema for jobs (CRUD target resource)
│   ├── User.js                    # Mongoose schema for users (seeker, employer, admin)
│   └── ValidationSubmission.js    # Mongoose schema for Practical 2 validation records
├── public/
│   ├── app.js                     # Client-side SPA routing and UI controller
│   ├── index.html                 # Main single page application HTML
│   └── style.css                  # Responsive styles
├── routes/
│   ├── admin.js                   # Admin dashboard and user management routes
│   ├── applications.js            # Job application and resume upload routes
│   ├── auth.js                    # Authentication routes (login, register)
│   ├── jobs.js                    # Practical 5 RESTful CRUD API routes for jobs
│   └── validation.js              # Practical 2 server-side validation routes
├── uploads/
│   └── .gitkeep                   # Storage directory for uploaded candidate resumes
├── .env.example                   # Sample environment variable template
├── .gitignore                     # Git ignore rules (excludes .env, node_modules)
├── JobConnect_Practical5.postman_collection.json # Importable Postman test suite
├── package.json                   # Project scripts and dependencies
├── package-lock.json              # Dependency lockfile
├── render.yaml                    # Render cloud deployment blueprint
├── server.js                      # Main Express application & MongoDB connection
└── README.md                      # Complete documentation & practical manual
```

---

## Local Setup & Installation

### Step 1: Install Dependencies
Open terminal in the `JobConnect` directory:
```bash
npm install
```

### Step 2: Set Up Environment Variables
Copy `.env.example` to `.env`:
- **Windows PowerShell:**
  ```powershell
  Copy-Item .env.example .env
  ```
- **Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

### Step 3: Configure `.env`
Open `.env` in any text editor:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/jobconnect
JWT_SECRET=super_secret_jwt_key_jobconnect_2026
ADMIN_EMAIL=admin@jobconnect.com
ADMIN_PASSWORD=Admin@123
```

### Step 4: Start the Server
- Normal execution:
  ```bash
  npm start
  ```
- Development mode (with live reload):
  ```bash
  npm run dev
  ```

Open your browser at:
`http://localhost:5000`

---

## Database Configuration

### Option A: Local MongoDB
1. Ensure MongoDB service or `mongod` is running on your machine on port `27017`.
2. Connection string in `.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/jobconnect
   ```
3. Open **MongoDB Compass** and connect to `mongodb://127.0.0.1:27017` to inspect collections.

### Option B: Cloud MongoDB Atlas (Required for Render Deployment)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Free M0 cluster.
3. Under **Database Access**, create a database user (e.g., username `jobuser`, password `JobSecurePass123`).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** → **Drivers** → Copy the connection string.
6. Replace `<password>` with your database user password and specify the database name `jobconnect`:
   ```
   mongodb+srv://jobuser:JobSecurePass123@cluster0.xxxxx.mongodb.net/jobconnect?retryWrites=true&w=majority
   ```
7. Put this connection string as `MONGO_URI` in `.env` (for local test) and in Render Environment Variables (for deployment).

---

## Practical 5: RESTful CRUD API Specifications

All endpoints return data formatted in JSON.

### Summary Table

| Operation | HTTP Method | Endpoint | Access | Expected Status |
|-----------|-------------|----------|--------|-----------------|
| **CREATE** | `POST` | `/api/jobs` | Employer / Admin (Bearer Token) | `201 Created` |
| **READ ALL** | `GET` | `/api/jobs` | Public | `200 OK` |
| **READ BY ID**| `GET` | `/api/jobs/:id` | Public | `200 OK` |
| **UPDATE** | `PUT` | `/api/jobs/:id` | Owner Employer / Admin (Bearer Token) | `200 OK` |
| **DELETE** | `DELETE` | `/api/jobs/:id` | Owner Employer / Admin (Bearer Token) | `200 OK` |

---

### Detailed Endpoint Documentation

#### 1. CREATE – Add a New Job Record
- **Endpoint:** `POST /api/jobs`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "Frontend Developer",
    "company": "ABC Technologies",
    "location": "Pune",
    "description": "Looking for a frontend developer proficient in React.js and CSS",
    "salary": "4-6 LPA",
    "jobType": "Full Time"
  }
  ```
- **Response Status:** `201 Created`
- **Response Body:**
  ```json
  {
    "_id": "67dae5f21234567890abcdef",
    "title": "Frontend Developer",
    "company": "ABC Technologies",
    "location": "Pune",
    "type": "Full Time",
    "jobType": "Full Time",
    "salary": "4-6 LPA",
    "description": "Looking for a frontend developer proficient in React.js and CSS",
    "employer": "67dae5a01234567890abcdef",
    "createdAt": "2026-11-17T18:00:00.000Z",
    "updatedAt": "2026-11-17T18:00:00.000Z"
  }
  ```

#### 2. READ ALL – Retrieve All Available Job Records
- **Endpoint:** `GET /api/jobs`
- **Headers:** None required (Public access)
- **Response Status:** `200 OK`
- **Response Body:**
  ```json
  [
    {
      "_id": "67dae5f21234567890abcdef",
      "title": "Frontend Developer",
      "company": "ABC Technologies",
      "location": "Pune",
      "type": "Full Time",
      "jobType": "Full Time",
      "salary": "4-6 LPA",
      "description": "Looking for a frontend developer proficient in React.js and CSS",
      "createdAt": "2026-11-17T18:00:00.000Z"
    }
  ]
  ```

#### 3. READ BY ID – Retrieve a Specific Job Record
- **Endpoint:** `GET /api/jobs/:id`
- **Headers:** None required (Public access)
- **Response Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "_id": "67dae5f21234567890abcdef",
    "title": "Frontend Developer",
    "company": "ABC Technologies",
    "location": "Pune",
    "type": "Full Time",
    "jobType": "Full Time",
    "salary": "4-6 LPA",
    "description": "Looking for a frontend developer proficient in React.js and CSS",
    "employer": {
      "_id": "67dae5a01234567890abcdef",
      "name": "Tech Employer",
      "email": "employer@techcorp.com",
      "company": "ABC Technologies"
    },
    "createdAt": "2026-11-17T18:00:00.000Z"
  }
  ```
- **Error Responses:**
  - Invalid ID format: `400 Bad Request` `{ "message": "Invalid MongoDB Job ID format" }`
  - ID not found in database: `404 Not Found` `{ "message": "Job not found" }`

#### 4. UPDATE – Modify an Existing Job Record
- **Endpoint:** `PUT /api/jobs/:id`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "Senior Frontend Developer",
    "location": "Mumbai",
    "salary": "7-9 LPA"
  }
  ```
- **Response Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "_id": "67dae5f21234567890abcdef",
    "title": "Senior Frontend Developer",
    "company": "ABC Technologies",
    "location": "Mumbai",
    "type": "Full Time",
    "jobType": "Full Time",
    "salary": "7-9 LPA",
    "description": "Looking for a frontend developer proficient in React.js and CSS",
    "employer": "67dae5a01234567890abcdef",
    "updatedAt": "2026-11-17T18:10:00.000Z"
  }
  ```

#### 5. DELETE – Remove a Job Record
- **Endpoint:** `DELETE /api/jobs/:id`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "message": "Job deleted successfully",
    "deletedJobId": "67dae5f21234567890abcdef"
  }
  ```
- **Error Responses:**
  - Job not found: `404 Not Found` `{ "message": "Job not found" }`
  - Unauthorized user: `403 Forbidden` `{ "message": "Access denied: You can only delete jobs posted by your account" }`

---

## Postman API Testing Guide

### Option 1: 1-Click Import (Recommended)
1. Open Postman.
2. Click **Import** (top left).
3. Choose the file `JobConnect_Practical5.postman_collection.json` located inside this project.
4. Click **Import**.
5. The collection will appear under **Collections** with pre-configured requests, environment variables, and automated tests!

### Option 2: Step-by-Step Manual Testing

#### Step 1: Obtain Authorization Token
1. In Postman, open a new tab and select method `POST`.
2. URL: `http://localhost:5000/api/auth/login` (or deployed URL).
3. Header: `Content-Type: application/json`.
4. Body (`raw` -> `JSON`):
   ```json
   {
     "email": "admin@jobconnect.com",
     "password": "Admin@123"
   }
   ```
   *(Or register an employer via `POST /api/auth/register` with `"role": "employer"`).*
5. Click **Send**.
6. Status: `200 OK`.
7. Copy the returned `token` value (without quotes).

#### Step 2: Test CREATE (POST /api/jobs)
1. Method: `POST`.
2. URL: `http://localhost:5000/api/jobs`.
3. Under **Headers** tab, add:
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer <paste_your_token_here>`
4. Under **Body** tab (`raw` -> `JSON`), paste:
   ```json
   {
     "title": "Frontend Developer",
     "company": "ABC Technologies",
     "location": "Pune",
     "description": "Looking for a frontend developer",
     "salary": "4-6 LPA",
     "jobType": "Full Time"
   }
   ```
5. Click **Send**.
6. Verify Status: `201 Created`.
7. Copy the returned `_id` of the created job for subsequent steps.

#### Step 3: Test READ ALL (GET /api/jobs)
1. Method: `GET`.
2. URL: `http://localhost:5000/api/jobs`.
3. Click **Send**.
4. Verify Status: `200 OK`.
5. Verify JSON response lists all job records.

#### Step 4: Test READ BY ID (GET /api/jobs/:id)
1. Method: `GET`.
2. URL: `http://localhost:5000/api/jobs/<job_id_from_step_2>`.
3. Click **Send**.
4. Verify Status: `200 OK`.
5. Verify JSON response matches the specific job details.

#### Step 5: Test UPDATE (PUT /api/jobs/:id)
1. Method: `PUT`.
2. URL: `http://localhost:5000/api/jobs/<job_id_from_step_2>`.
3. Under **Headers** tab, ensure `Authorization: Bearer <token>` is present.
4. Under **Body** tab (`raw` -> `JSON`), paste:
   ```json
   {
     "title": "Senior Frontend Developer",
     "location": "Mumbai",
     "salary": "7-9 LPA"
   }
   ```
5. Click **Send**.
6. Verify Status: `200 OK`.
7. Verify that `title` is now `"Senior Frontend Developer"`, `location` is `"Mumbai"`, and `salary` is `"7-9 LPA"`.

#### Step 6: Test DELETE (DELETE /api/jobs/:id)
1. Method: `DELETE`.
2. URL: `http://localhost:5000/api/jobs/<job_id_from_step_2>`.
3. Under **Headers** tab, ensure `Authorization: Bearer <token>` is present.
4. Click **Send**.
5. Verify Status: `200 OK`.
6. Verify response message: `"Job deleted successfully"`.
7. If you now run `GET /api/jobs/<job_id_from_step_2>`, it returns `404 Not Found`, proving permanent removal.

---

## Deployment Instructions for Render

Deploying JobConnect on Render takes just 5 minutes:

### Step 1: Push Code to GitHub
1. Create a new repository on your GitHub account (e.g. `jobconnect-portal`).
2. Initialize and push your code:
   ```bash
   git init
   git add .
   git commit -m "Complete JobConnect with Practical 1, 2, and 5 CRUD API"
   git branch -M main
   git remote add origin https://github.com/<your-username>/jobconnect-portal.git
   git push -u origin main
   ```
   *(Note: The `.gitignore` ensures that local `.env` and `node_modules` are never uploaded).*

### Step 2: Set Up MongoDB Atlas
1. Follow the **Database Configuration -> Option B** instructions above.
2. Ensure network access is `0.0.0.0/0` so Render can connect to your Atlas cluster.
3. Have your `mongodb+srv://...` URI ready.

### Step 3: Deploy on Render
1. Visit [Render.com](https://render.com) and sign in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure the settings:
   - **Name:** `jobconnect-portal` (or custom name)
   - **Region:** Singapore / Frankfurt / Oregon (nearest to you)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `<your MongoDB Atlas connection string>`
   - `JWT_SECRET`: `<any secure random string>`
   - `ADMIN_EMAIL`: `admin@jobconnect.com`
   - `ADMIN_PASSWORD`: `<your chosen admin password>`
   *(Note: Render automatically injects the `PORT` variable; our `server.js` dynamically uses `process.env.PORT`).*
6. Click **Create Web Service**.

### Step 4: Verify Deployment
1. Wait 1–2 minutes until the status shows **Live**.
2. Click your Render service URL (e.g., `https://jobconnect-portal.onrender.com`).
3. You will see the JobConnect homepage!
4. Verify the health check: `https://jobconnect-portal.onrender.com/api/health`.
5. In Postman, set the variable `baseUrl` to `https://jobconnect-portal.onrender.com` and run the CRUD tests!

---

## Report Screenshots Checklist

For your college practical submission report, capture the following screenshots:

1. **Local Application Running:**
   - VS Code terminal showing `MongoDB connected successfully` and `JobConnect server is running on http://localhost:5000`.
   - Browser showing JobConnect home page (`http://localhost:5000`).
2. **Postman Authentication:**
   - POST request to `/api/auth/login` showing `200 OK` and returned JWT `token`.
3. **POST (Create Job):**
   - Postman showing `POST /api/jobs`, JSON body, Bearer Token header, and `201 Created` status with the created job object.
4. **GET (Read All Jobs):**
   - Postman showing `GET /api/jobs` returning `200 OK` and the array containing the new job.
5. **GET (Read Job by ID):**
   - Postman showing `GET /api/jobs/:id` returning `200 OK` and the specific job details.
6. **PUT (Update Job):**
   - Postman showing `PUT /api/jobs/:id`, modified body, and `200 OK` with updated details.
7. **DELETE (Delete Job):**
   - Postman showing `DELETE /api/jobs/:id` returning `200 OK` and `"Job deleted successfully"`.
8. **MongoDB Compass:**
   - Screenshot of the `jobconnect` database in MongoDB Compass showing the documents in the `jobs` collection.
9. **Render Deployment:**
   - Render dashboard showing service status as **Live**.
   - Postman executing a request against the deployed Render URL (e.g., `https://jobconnect-portal.onrender.com/api/jobs`).
