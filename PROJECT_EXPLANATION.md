# Medisoft — Project Explanation Document

> A unified healthcare service platform: doctor appointments, online
> consultation, prescriptions, hospital seat booking, blood bank, ambulance,
> medicine marketplace, lab tests, and payments — all in one backend API.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Scope of the System](#4-scope-of-the-system)
5. [User Roles](#5-user-roles)
6. [Tech Stack](#6-tech-stack)
7. [High-Level Architecture](#7-high-level-architecture)
8. [Project / Folder Layout](#8-project--folder-layout)
9. [Functional Modules (Features)](#9-functional-modules-features)
10. [Data Model (Database Design)](#10-data-model-database-design)
11. [REST API Surface](#11-rest-api-surface)
12. [Authentication Flow](#12-authentication-flow)
13. [Request / Response Convention](#13-request--response-convention)
14. [Setup & Installation](#14-setup--installation)
15. [Running the Server](#15-running-the-server)
16. [Testing](#16-testing)
17. [Quick API Test (REST Client)](#17-quick-api-test-rest-client)
18. [Current Status](#18-current-status)
19. [Known Issues & Technical Debt](#19-known-issues--technical-debt)
20. [Recommended Next Steps](#20-recommended-next-steps)
21. [Conclusion](#21-conclusion)

---

## 1. Introduction

**Medisoft** is a healthcare service platform that centralises the most common
medical needs of a patient into a single, easy-to-integrate REST API.

Instead of using 8–10 separate apps for doctor consultation, hospital
admission, ambulance, blood, lab tests and medicine, Medisoft exposes them
all from one Django backend that can be consumed by a web frontend, a
mobile app, or any third-party client.

The project is built in two halves:

| Half    | Status         | Purpose                                            |
|---------|----------------|----------------------------------------------------|
| Backend | **Complete**   | 15 models, 25+ endpoints, session auth, MySQL      |
| Frontend| Planned        | React + Vite + TypeScript (see §6, §20)             |

The remainder of this document explains the **implemented backend**.

---

## 2. Problem Statement

In Bangladesh (and many similar markets) healthcare services are fragmented:

* Patients must **call** or visit multiple platforms to book a doctor, find
  blood, hire an ambulance, or order medicine.
* Doctors and hospitals lack a **central record** of patients they have seen.
* Blood requests and ambulance dispatch are still largely **manual / phone
  based**.
* There is no single place to view **all medical history** (appointments,
  prescriptions, lab results) for a patient.
* Medicine ordering and lab test booking have moved online, but they live
  in walled-garden apps that don't talk to each other.

Medisoft solves this by providing **one unified backend** with consistent
JSON responses, role-based access, and a single user identity per patient.

---

## 3. Objectives

1. Provide a **single REST API** for the most common healthcare workflows.
2. Support **four distinct user roles** (patient, doctor, admin, driver)
   with strict role-based access control.
3. Use a **custom User model** (email as login, role-aware permissions) to
   fit a multi-role product from day one.
4. Persist data in **MySQL** with a clear, normalised schema (15 tables).
5. Return a **uniform JSON envelope** from every endpoint for easy
   frontend consumption.
6. Keep the codebase simple — function-based views, no REST framework
   dependency, no JWT — so it is easy to read and present.

---

## 4. Scope of the System

### In Scope (Implemented)

* Registration & login (patient / doctor)
* Doctor directory with search/filter
* Appointment booking (In-Person / Video / Audio / Chat)
* Online consultation meeting URL generation
* Prescription writing (doctor) and reading (patient)
* Hospital directory and seat booking (General / Cabin / ICU / VIP)
* Blood donor registration and search
* Blood request creation and listing
* Ambulance booking with driver assignment
* Medicine catalog and ordering
* Health-article publishing and reading
* Lab test booking with status tracking
* Payment initiation and callback

### Out of Scope (Future)

* Native mobile app (will require JWT or token auth)
* Real WebRTC video calling (current meeting URL is a stub)
* Real payment gateway integration (bKash / SSLCommerz are placeholders)
* File uploads for profile photos, lab results, and article thumbnails
* Email verification and password reset
* SMS / push notifications

---

## 5. User Roles

| Role     | Created by      | Primary Capabilities                                         |
|----------|-----------------|--------------------------------------------------------------|
| `patient`| Self-register   | Book appointments, see prescriptions, book seats, request blood, hire ambulance, order medicine, book lab tests, pay, read articles |
| `doctor` | Self-register   | Manage incoming appointments, write prescriptions, publish health articles |
| `admin`  | `createsuperuser` | Create hospitals / medicines, see all records, change any status |
| `driver` | Backend / admin | See ambulance booking queue, claim trips, update status, enter fare |

Role enforcement lives in `core/views.py` inside each view: the `@login_required_api`
decorator checks authentication, then explicit `if user.role == ...` blocks
check authorisation.

---

## 6. Tech Stack

| Layer                | Technology                                |
|----------------------|-------------------------------------------|
| Language             | Python 3.x                                |
| Web framework        | Django 6.0.5                              |
| DB driver            | PyMySQL (used as a MySQLdb shim)          |
| Database             | MySQL 8 (`medisoft_db`)                   |
| CORS                 | `django-cors-headers` (open in dev)       |
| Authentication       | Django **session cookies** + CSRF-exempt  |
| API style            | Function-based views, JSON, no DRF        |
| Response envelope    | `{"success": bool, "data": ..., "error": ...}` |
| Test framework       | `django.test.TestCase` (4 integration tests) |
| Frontend (planned)   | React 18 + Vite + TypeScript + Axios + TanStack Query + Tailwind + shadcn/ui |

Why Django, not Node/Express? Django ships with a battle-tested ORM, an
admin site, an auth/session framework, migrations, and a test runner out of
the box — for a CRUD-heavy healthcare API that is exactly what is needed.

Why session cookies, not JWT? Session cookies are simpler for a
single-domain web frontend and avoid token-refresh complexity. (If a mobile
app is added later, switching to JWT is a focused refactor — see §20.)

---

## 7. High-Level Architecture

```
                  ┌─────────────────────┐
                  │   Client (browser / │
                  │   mobile, planned)  │
                  └──────────┬──────────┘
                             │  JSON over HTTP
                             │  Cookie: sessionid=...
                             ▼
        ┌────────────────────────────────────────┐
        │  Django 6.0  (backend/)                │
        │  ┌──────────────────────────────────┐  │
        │  │  medisoft/  (project package)    │  │
        │  │   - settings.py                  │  │
        │  │   - urls.py  -> /api/ → core/    │  │
        │  │   - __init__.py (pymysql shim)   │  │
        │  └──────────────────────────────────┘  │
        │  ┌──────────────────────────────────┐  │
        │  │  core/  (single Django app)      │  │
        │  │   - models.py   (15 tables)      │  │
        │  │   - views.py    (25+ endpoints)  │  │
        │  │   - urls.py                      │  │
        │  │   - tests.py                     │  │
        │  └──────────────────────────────────┘  │
        └────────────────────┬───────────────────┘
                             │  Django ORM (PyMySQL)
                             ▼
                  ┌─────────────────────┐
                  │  MySQL 8            │
                  │  medisoft_db        │
                  │  15 tables          │
                  └─────────────────────┘
```

* **One Django project** (`medisoft`) with **one app** (`core`) keeps the
  codebase small and easy to navigate.
* All endpoints are under `/api/` so a `/admin/` URL is reserved for the
  Django admin.
* The PyMySQL shim in `medisoft/__init__.py` lets Django talk to MySQL
  without requiring the C-extension `mysqlclient`.

---

## 8. Project / Folder Layout

```
MEDISOFTPROJECT/
├── README.md                       Title only
├── .gitignore                      Python / Django ignores
├── CREATE TABLE users.docx         Original design document (binary)
├── medisoft_project_document.txt   Dev reference (existing)
├── PROJECT_EXPLANATION.md          This file
├── myvenv/                         Local Python virtual environment
└── backend/
    ├── manage.py                   Django CLI entry point
    ├── db.sqlite3                  Leftover (settings target MySQL; ignore)
    ├── api_tests.http              VS Code REST Client sample requests
    ├── medisoft/                   Django project package
    │   ├── __init__.py             pymysql.install_as_MySQLdb()
    │   ├── settings.py             Installed apps, DB, CORS, middleware
    │   ├── urls.py                 /admin/  +  /api/  routes
    │   ├── asgi.py                 ASGI entry (for future channels)
    │   └── wsgi.py                 WSGI entry
    └── core/                       Single Django app holding all logic
        ├── __init__.py
        ├── apps.py
        ├── admin.py                (Empty — see §20)
        ├── models.py               15 database models
        ├── views.py                25+ REST endpoints
        ├── urls.py                 Routes for /api/...
        ├── tests.py                4 integration tests
        └── migrations/
            ├── __init__.py
            └── 0001_initial.py     Initial schema (Django 4.2 — see §19)
```

---

## 9. Functional Modules (Features)

The backend implements **11 functional modules**. Each one is a small
group of related endpoints backed by one or more models.

### 9.1 Authentication & Profiles
* `POST /api/auth/register/` — register patient or doctor
* `POST /api/auth/login/` — session login
* `POST /api/auth/logout/` — session logout
* `GET /api/auth/profile/` — view own profile (role-aware)
* `PUT /api/auth/profile/` — update own profile (role-aware)

### 9.2 Doctor Directory (public)
* `GET /api/doctors/` — list, with optional `?specialization=…`, `?city=…`, `?is_verified=true|false`
* `GET /api/doctors/specializations/` — distinct list for filter dropdowns

### 9.3 Appointments & Online Consultation
* `GET /api/appointments/` — list mine (patient), my incoming (doctor), or all (admin)
* `POST /api/appointments/` — patient books; supports `In-Person / Video / Audio / Chat`
* `PUT /api/appointments/{id}/status/` — confirm / complete / cancel with role checks
* `GET /api/appointments/{id}/meeting-url/` — auto-generates `https://meet.medisoft.com/room-{id}` on confirmation of a virtual appointment

### 9.4 Prescriptions
* `GET /api/prescriptions/` — patient sees their own, doctor sees theirs, admin sees all
* `POST /api/prescriptions/` — doctor issues a prescription for one of their appointments

### 9.5 Hospital Seat Booking
* `GET /api/hospitals/` — public list, optional `?city=…`
* `POST /api/hospitals/` — admin only, create a hospital with seat counts
* `GET /api/seat-bookings/` — patient sees own, admin sees all
* `POST /api/seat-bookings/` — patient books; **decrements `available_seats` automatically**
* `PUT /api/seat-bookings/{id}/status/` — check-in / check-out / cancel; **frees the seat back on cancel / check-out**

### 9.6 Blood Bank
* `GET /api/blood-donors/` — public search by `?blood_group=…` and `?city=…`
* `POST /api/blood-donors/register/` — logged-in user registers as donor (uses `update_or_create` so re-registering updates)
* `GET /api/blood-requests/` — list all
* `POST /api/blood-requests/` — patient creates a request with urgency (`Normal / Urgent / Critical`)

### 9.7 Ambulance Service
* `GET /api/ambulance/bookings/` — patient sees own; **driver sees own + unassigned queue**; admin sees all
* `POST /api/ambulance/bookings/` — patient books with pickup + destination + emergency contact
* `PUT /api/ambulance/bookings/{id}/status/` — driver assigns self, sets vehicle, updates to `En-Route / Completed`, enters fare; patient may only cancel

### 9.8 Medicine Marketplace
* `GET /api/medicines/` — public, supports `?query=…` and `?category=…`
* `POST /api/medicines/` — admin only, add to catalog
* `GET /api/medicines/orders/` — patient sees own, admin sees all
* `POST /api/medicines/orders/` — patient places order; **stock is decremented**; if the medicine is `requires_rx`, a `prescription_id` is mandatory

### 9.9 Health Articles
* `GET /api/articles/` — public sees only `is_published=True`; doctor / admin see all
* `GET /api/articles/{id}/` — single article; unpublished is hidden from patients
* `POST /api/articles/` — doctor or admin publishes; `published_at` is set automatically when `is_published=true`

### 9.10 Lab Test Booking
* `GET /api/lab-bookings/` — patient sees own, admin sees all
* `POST /api/lab-bookings/` — patient books with test name, lab, date, amount

### 9.11 Payments
* `POST /api/payments/` — create a payment for any of the 5 service types; generates a `TXN-…` reference
* `POST /api/payments/callback/` — public webhook to mark a payment `Success / Failed`

> **Note** The payment module records intent and result; it does **not**
> integrate with bKash/Nagad/SSLCommerz yet. The callback is a simple
> endpoint that the future gateway will POST to.

---

## 10. Data Model (Database Design)

15 tables. All primary keys are explicit `*_id` integer columns and
table names are explicit `db_table` values — the design clearly mirrors
a pre-existing SQL schema that was reverse-engineered into Django.

```
                          ┌──────────────┐
                          │  users (U)   │  role: patient/doctor/admin/driver
                          └──────┬───────┘
        ┌────────────┬──────────┼────────────┬────────────┐
        │1..1        │1..1      │n..1 (null) │n..1 (null) │1..1
        ▼            ▼          ▼            ▼            ▼
   patients      doctors    blood_donors   driver_      author_ (articles)
                                          bookings      payments
        │            │          (Ambulance)
        │ 1..N       │ 1..N
        ├───────────►│◄────────┐
        │            │         │
        │            │   appointments
        │            │     │
        │            │     │ 1..N
        │            │     ▼
        │            │  prescriptions
        │            │     │
        │            │     │ n..1 (nullable)
        │            │     ▼
        │            │  medicine_orders
        │            │
        │ 1..N       │
        ├───────────►hospitals ◄── seat_bookings (patient 1..N)
        │
        ├───────────►ambulance_bookings
        ├───────────►blood_requests
        ├───────────►medicine_orders
        └───────────►lab_bookings

   medicines ◄── medicine_orders
```

### 10.1 Reference Table

| #  | Model              | Table              | Purpose                                                        |
|----|--------------------|--------------------|----------------------------------------------------------------|
| 1  | `User`             | `users`            | Custom auth user with role                                     |
| 2  | `Patient`          | `patients`         | Profile data (DOB, gender, blood group, city, emergency contact) |
| 3  | `Doctor`           | `doctors`          | Specialization, license, fee, availability, verification flag  |
| 4  | `Hospital`         | `hospitals`        | Hospital record with `total_seats` / `available_seats`         |
| 5  | `Appointment`      | `appointments`     | Doctor booking with type, status, meeting URL                  |
| 6  | `Prescription`     | `prescriptions`    | One medicine line per prescription tied to an appointment      |
| 7  | `SeatBooking`      | `seat_bookings`    | Patient ↔ hospital bed reservation                             |
| 8  | `BloodDonor`       | `blood_donors`     | Volunteer donor record (optionally linked to a user)           |
| 9  | `BloodRequest`     | `blood_requests`   | Patient-initiated blood need with urgency                      |
| 10 | `AmbulanceBooking` | `ambulance_bookings` | Pickup + destination + driver + fare                          |
| 11 | `Medicine`         | `medicines`        | Catalog item with stock and `requires_rx` flag                 |
| 12 | `MedicineOrder`    | `medicine_orders`  | Patient purchase linked to a medicine (and optional prescription) |
| 13 | `LabBooking`       | `lab_bookings`     | Patient test booking with status pipeline                      |
| 14 | `Article`          | `articles`         | Health tip / blog post                                         |
| 15 | `Payment`          | `payments`         | Payment record for any of the 5 service types                  |

### 10.2 Key Field Highlights

* **`User.password`** is stored in column `password_hash` (`db_column='password_hash'`) and goes through `set_password()` so the real value is hashed with Django's PBKDF2, never plaintext.
* **`Appointment.status`** is one of `Pending / Confirmed / Completed / Cancelled`. A `meeting_url` is auto-generated only on `Confirmed` for virtual types.
* **`SeatBooking.total_amount`** is auto-computed as `price_per_day * max(1, days)`.
* **`MedicineOrder`** enforces business rules in the view: insufficient stock returns an error, and `requires_rx=True` mandates a `prescription_id`.
* **`Payment.status`** has 4 values: `Pending / Success / Failed / Refunded`.

---

## 11. REST API Surface

Base URL: `http://127.0.0.1:8000/api/`

| Method | Endpoint                                  | Auth | Purpose |
|--------|-------------------------------------------|------|---------|
| POST   | `/auth/register/`                         | —    | Register patient / doctor |
| POST   | `/auth/login/`                            | —    | Session login |
| POST   | `/auth/logout/`                           | ✓    | End session |
| GET    | `/auth/profile/`                          | ✓    | View own profile |
| PUT    | `/auth/profile/`                          | ✓    | Update own profile |
| GET    | `/doctors/`                               | —    | List / search doctors |
| GET    | `/doctors/specializations/`               | —    | Distinct specializations |
| GET    | `/appointments/`                          | ✓    | List mine |
| POST   | `/appointments/`                          | ✓    | Book new |
| PUT    | `/appointments/{id}/status/`              | ✓    | Confirm / complete / cancel |
| GET    | `/appointments/{id}/meeting-url/`         | ✓    | Get video meeting link |
| GET    | `/prescriptions/`                         | ✓    | Read prescriptions |
| POST   | `/prescriptions/`                         | ✓    | Doctor writes prescription |
| GET    | `/hospitals/`                             | —    | List hospitals |
| POST   | `/hospitals/`                             | admin | Create hospital |
| GET    | `/seat-bookings/`                         | ✓    | List mine |
| POST   | `/seat-bookings/`                         | ✓    | Book seat |
| PUT    | `/seat-bookings/{id}/status/`             | ✓    | Check-in / cancel / check-out |
| GET    | `/blood-donors/`                          | —    | Search donors |
| POST   | `/blood-donors/register/`                 | ✓    | Register as donor |
| GET    | `/blood-requests/`                        | ✓    | List requests |
| POST   | `/blood-requests/`                        | ✓    | Create request |
| GET    | `/ambulance/bookings/`                    | ✓    | Patient's / driver's queue |
| POST   | `/ambulance/bookings/`                    | ✓    | Patient books |
| PUT    | `/ambulance/bookings/{id}/status/`        | ✓    | Driver / admin updates |
| GET    | `/medicines/`                             | —    | Browse catalog |
| POST   | `/medicines/`                             | admin | Add medicine |
| GET    | `/medicines/orders/`                      | ✓    | List my orders |
| POST   | `/medicines/orders/`                      | ✓    | Place order |
| GET    | `/articles/`                              | ✓    | List articles |
| POST   | `/articles/`                              | ✓    | Doctor / admin publishes |
| GET    | `/articles/{id}/`                         | ✓    | Single article |
| GET    | `/lab-bookings/`                          | ✓    | List mine |
| POST   | `/lab-bookings/`                          | ✓    | Book lab test |
| POST   | `/payments/`                              | ✓    | Initiate payment |
| POST   | `/payments/callback/`                     | —    | Gateway webhook |

---

## 12. Authentication Flow

1. **Register** — `POST /api/auth/register/` with `email`, `password`, `full_name`, `phone`, `role` and role-specific extras. Backend creates a `User` row, then **automatically creates a `Patient` or `Doctor` profile** in the same transaction. Returns the user dict.
2. **Login** — `POST /api/auth/login/` with `email` + `password`. Django's `authenticate()` validates against the hashed password, `login()` sets a `sessionid` cookie. The response also includes role-specific details (`patient_details` or `doctor_details`).
3. **Authorised calls** — every subsequent request sends the `sessionid` cookie. `@login_required_api` blocks unauthenticated callers with `401`. Inside the view, the role is read from `request.user.role`.
4. **Logout** — `POST /api/auth/logout/` clears the session.

```
   Client                       Backend
   ------                       -------
   POST /auth/register/ ───►   create User + profile
                          ◄─── 201 { success, data: { user } }

   POST /auth/login/     ───►   authenticate + login()
                          ◄─── 200 { success, data: { user } }
                                  Set-Cookie: sessionid=...

   GET  /auth/profile/   ───►   read request.user
        Cookie: sessionid       from session
                          ◄─── 200 { success, data: { ... } }

   POST /auth/logout/    ───►   logout()
                          ◄─── 200 { success, data: { message } }
```

> The frontend must use `withCredentials: true` in its Axios instance so the
> cookie is sent on every request.

---

## 13. Request / Response Convention

Every endpoint returns one of two JSON envelopes:

```jsonc
// Success
{ "success": true,  "data": <payload> }

// Error
{ "success": false, "error": "<human-readable message>" }
```

HTTP status codes used:

| Code | Meaning in Medisoft                                           |
|------|---------------------------------------------------------------|
| 200  | OK (GET, PUT, login, list)                                    |
| 201  | Created (register, book, post)                                |
| 400  | Bad request / validation                                      |
| 401  | Not authenticated                                             |
| 403  | Authenticated but wrong role or not the resource owner        |
| 404  | Resource not found                                            |
| 405  | Method not allowed                                            |

There is **no DRF**, no serializer layer, no `?format=` — the views
manually call `JsonResponse` with a small `success_response` / `error_response`
helper.

---

## 14. Setup & Installation

### Prerequisites
* Python 3.10+
* MySQL 8 running locally on `127.0.0.1:3306`
* (Optional) VS Code with the **REST Client** extension

### 1. Create a database in MySQL

```sql
CREATE DATABASE medisoft_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

If you don't want to use the default `root` user with no password (as in
`settings.py`), create a dedicated user:

```sql
CREATE USER 'medisoft'@'localhost' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON medisoft_db.* TO 'medisoft'@'localhost';
FLUSH PRIVILEGES;
```

…and update `backend/medisoft/settings.py` lines 80–89 with the new
`USER` / `PASSWORD`.

### 2. Create and activate a virtual environment

```bash
cd MEDISOFTPROJECT
python -m venv myvenv

# Windows
myvenv\Scripts\activate
# macOS / Linux
source myvenv/bin/activate
```

### 3. Install dependencies

If a `requirements.txt` is not yet in the repo, install at minimum:

```bash
pip install "django>=6.0,<6.1" pymysql django-cors-headers
```

### 4. Run migrations

```bash
cd backend
python manage.py migrate
```

This creates all 15 tables in `medisoft_db`.

### 5. Create a superuser (admin)

```bash
python manage.py createsuperuser
```

The custom `UserManager.create_superuser` automatically sets `role='admin'`.

### 6. (Optional) Remove leftover `db.sqlite3`

The file is unused; settings target MySQL. Delete it and ensure
`.gitignore` keeps it out of git.

---

## 15. Running the Server

```bash
cd backend
python manage.py runserver
```

The API is now live at:

* **Admin (Django)**: <http://127.0.0.1:8000/admin/>
* **API root**:       <http://127.0.0.1:8000/api/>

---

## 16. Testing

`backend/core/tests.py` contains **4 integration tests** in a single
`MedisoftAPITests` class. They use Django's `Client` (which simulates a
browser including cookies and CSRF), so they cover the real session
authentication path.

| Test                                | Verifies                                                                 |
|-------------------------------------|--------------------------------------------------------------------------|
| `test_user_registration_and_login`  | Patient/Doctor profile auto-creation on register; session login succeeds |
| `test_appointment_booking`          | Patient books a video appointment and sees it in the list                |
| `test_hospital_seat_booking`        | Seat booking decrements `available_seats` and computes `total_amount`    |
| `test_medicine_purchasing`          | Medicine order decrements `stock` and computes `total_price`             |

Run with:

```bash
cd backend
python manage.py test core
```

Coverage gap (see §19 / §20): prescriptions, ambulance, blood, payments,
articles, lab bookings, and the doctor-city filter are **not** covered.

---

## 17. Quick API Test (REST Client)

The file `backend/api_tests.http` is a ready-made set of requests for the
**VS Code REST Client** extension.

1. Open `backend/api_tests.http` in VS Code.
2. Start the server (`python manage.py runserver`).
3. Click "Send Request" above the register call.
4. Click "Send Request" above the login call — this sets the `sessionid`
   cookie for subsequent calls in the same VS Code session.
5. Try `/auth/profile/`, `/doctors/`, `/hospitals/`, `/medicines/`, etc.

---

## 18. Current Status

| Area                  | Status     | Notes                                                  |
|-----------------------|------------|--------------------------------------------------------|
| Project scaffolding   | ✅ Done    | Django 6 project + `core` app                          |
| Database schema       | ✅ Done    | 15 models, 1 migration                                 |
| Auth (session)        | ✅ Done    | Register, login, logout, profile                       |
| Doctor directory      | ✅ Done    | List + 3 filters                                       |
| Appointments          | ✅ Done    | Book, list, status transition, meeting URL stub        |
| Prescriptions         | ✅ Done    | Doctor issues; patient reads                          |
| Hospital seat booking | ✅ Done    | Auto-decrement + auto-restore on cancel/checkout       |
| Blood bank            | ✅ Done    | Donor search, registration, request lifecycle          |
| Ambulance             | ✅ Done    | Patient book + driver queue + status flow + fare       |
| Medicine marketplace  | ✅ Done    | Catalog search, stock decrement, RX enforcement         |
| Articles              | ✅ Done    | Doctor/admin publish, public read, draft support       |
| Lab bookings          | ✅ Done    | Book, list, status pipeline                            |
| Payments              | ✅ Done    | Initiation + callback; gateway integration is a stub    |
| Tests                 | ⚠️ Partial | 4 tests covering happy paths                           |
| Django admin          | ❌ Empty   | `core/admin.py` has no registrations yet               |
| Frontend              | ❌ Planned | React + Vite + TypeScript, not yet started             |
| Deployment            | ❌ Planned | `DEBUG=True`, `ALLOWED_HOSTS=*`, hard-coded secret      |

---

## 19. Known Issues & Technical Debt

1. **Doctor city filter is broken** — `core/views.py:187` filters doctors
   via `user__patient_profile__city`, which only exists on patients.
   Fix: add `User.city` (or `Doctor.city`) and filter on that, or remove
   the city filter.
2. **Hard-coded secret and `DEBUG=True`** — `core/settings.py` line 23 has
   the `SECRET_KEY` in plaintext, `DEBUG=True`, and `ALLOWED_HOSTS=['*']`.
   Move to environment variables (`.env` + `python-decouple` or
   `django-environ`) before any deployment.
3. **Empty Django admin** — none of the 15 models are registered in
   `core/admin.py`, so `/admin/` shows no Medisoft data.
4. **Django version mismatch** — `settings.py` docstring says 6.0.5 but
   `0001_initial.py` was generated by Django 4.2. Pin a single version.
5. **Leftover `db.sqlite3`** — settings target MySQL; the SQLite file is
   dead weight and is in `.gitignore`.
6. **Meeting URL is a stub** — `https://meet.medisoft.com/room-{id}` is
   not a real WebRTC room. Needs Daily.co / Jitsi / Agora.
7. **No file uploads** — `profile_photo`, `thumbnail_url`, `result_url`
   are URL strings, not uploaded files.
8. **No password reset / email verification** — would require an
   email backend and a token table.
9. **No rate limiting** on `auth/login` or `auth/register`.
10. **No pagination** — list endpoints return the full result set.
11. **CSRF is fully disabled** (`@csrf_exempt` everywhere) which trades
    security for cross-origin convenience in dev. Production should use
    token-based auth or properly configured CORS + CSRF.

---

## 20. Recommended Next Steps

1. **Add a `.env` file** and externalise `SECRET_KEY`, `DEBUG`, DB
   credentials (and add a `core/.env` example file).
2. **Fix the doctor city filter** (see §19.1) — recommended: add
   `User.city` and migrate.
3. **Register all 15 models in `core/admin.py`** so admins can manage
   data through Django's built-in admin.
4. **Add a seed management command** (`python manage.py seed`) that
   loads 3 hospitals, 5 doctors, 10 medicines, 3 blood donors per group,
   3 articles — so the API is testable without manual entry.
5. **Add indexes** on `Doctor(specialization)`, `Doctor(is_verified)`,
   `Appointment(appointment_date)`, `Appointment(patient_id, status)`,
   `Article(published_at)`, `MedicineOrder(status, placed_at)`.
6. **Add pagination** to every list endpoint (a `?page=` parameter).
7. **Build the frontend** (React 18 + Vite + TypeScript + Axios +
   TanStack Query + Tailwind + shadcn/ui), with:
   * `AuthContext` storing the user dict returned by `/auth/login/`
   * Axios with `withCredentials: true`
   * `ProtectedRoute` for authenticated pages
   * `RoleGate` for role-scoped pages
   * 4 dashboards: patient, doctor, admin, driver
8. **Swap session auth for JWT** (`djangorestframework-simplejwt`) if a
   mobile app becomes a goal.
9. **Integrate a real payment gateway** (bKash, Nagad, SSLCommerz) and
   make `/payments/callback/` verify the gateway signature.
10. **Integrate a real video room provider** (Daily.co or Jitsi) and stop
    using the `medisoft.com` stub.
11. **Add file uploads** (profile photos, lab reports, article images)
    via Django's `MEDIA_ROOT` + a CDN.
12. **CI/CD** with GitHub Actions: `python manage.py test` and
    `npm run build` on every push.

---

## 21. Conclusion

Medisoft's backend delivers a **complete, end-to-end healthcare API** —
authentication, role-based access, doctor / hospital / blood / ambulance /
medicine / lab / article / payment modules — in a single small Django
project of 15 models and 25+ endpoints. It is a strong foundation for the
planned React frontend and the future mobile app, and the work needed to
make it production-ready (env-driven config, admin registration,
pagination, real payment + video integrations, JWT) is well-scoped and
clearly catalogued in §19 / §20.

For questions or to extend the system, the entry points are:

* `backend/medisoft/settings.py` — configuration
* `backend/core/models.py` — schema
* `backend/core/views.py` — business logic
* `backend/core/urls.py` — routes
* `backend/core/tests.py` — integration tests
