# MEDISOFT — Comprehensive Codebase Report

> **Generated:** June 11, 2026  
> **Version:** 1.0  
> **Project:** Medisoft Healthcare Service Platform

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Technology Stack](#3-technology-stack)
4. [Architecture](#4-architecture)
5. [Directory Structure](#5-directory-structure)
6. [Backend](#6-backend)
7. [Frontend](#7-frontend)
8. [Database Schema](#8-database-schema)
9. [API Reference](#9-api-reference)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Frontend Routing](#11-frontend-routing)
12. [UI/Animation System](#12-uianimation-system)
13. [Payment Integration](#13-payment-integration)
14. [Code Statistics](#14-code-statistics)
15. [Known Issues & Technical Debt](#15-known-issues--technical-debt)
16. [Recommendations](#16-recommendations)

---

## 1. Executive Summary

**Medisoft** is a full-stack healthcare service platform that unifies doctor appointments, online consultation, prescriptions, hospital seat booking, blood bank, ambulance service, medicine marketplace, health articles, lab test booking, and payments into a single system.

The platform consists of a **Django REST API backend** and a **React + Vite frontend** with a modern, animated UI built with Tailwind CSS. It supports four user roles (patient, doctor, admin, driver) with role-based access control, session-based authentication, and integration with the bKash payment gateway (sandbox mode).

---

## 2. Project Overview

| Attribute | Value |
|-----------|-------|
| **Name** | Medisoft |
| **Type** | Full-Stack Healthcare Platform |
| **Backend** | Django 6.0.5 + MySQL 8 |
| **Frontend** | React 19.2.6 + Vite 8.0.16 + Tailwind CSS 3.4.19 |
| **Auth** | Django Session Cookies (CSRF-exempt) |
| **API Style** | Function-based views, JSON responses, no DRF |
| **Database** | MySQL 8 (`medisoft_db`) with 15 tables |
| **Payment** | bKash Tokenized Checkout (sandbox) |

### User Roles

| Role | Capabilities |
|------|-------------|
| **patient** | Book appointments, see prescriptions, book seats, request blood, hire ambulance, order medicine, book lab tests, pay, read articles |
| **doctor** | Manage appointments, write prescriptions, publish health articles |
| **admin** | Full CRUD on all resources, dashboard with statistics |
| **driver** | See ambulance booking queue, claim trips, update status, enter fare |

---

## 3. Technology Stack

### Backend

| Layer | Technology |
|-------|-----------|
| Language | Python 3.x |
| Web Framework | Django 6.0.5 |
| Database Driver | PyMySQL (MySQLdb shim) |
| Database | MySQL 8 (`medisoft_db`) |
| CORS | `django-cors-headers` (open in dev) |
| Authentication | Django session cookies + `@csrf_exempt` |
| API Style | Function-based views, JSON, no DRF |
| Response Envelope | `{"success": bool, "data": ..., "error": ...}` |
| Payment Gateway | bKash Tokenized Checkout (sandbox) |

### Frontend

| Layer | Technology |
|-------|-----------|
| Language | JavaScript (JSX) |
| UI Framework | React 19.2.6 |
| Build Tool | Vite 8.0.16 |
| Routing | React Router DOM 7.17.0 |
| HTTP Client | Axios 1.17.0 (with `withCredentials: true`) |
| CSS Framework | Tailwind CSS 3.4.19 |
| PostCSS | autoprefixer + tailwindcss |
| Animation | Custom CSS keyframes + React components |

### Key Dependencies

**Backend:**
- `django>=6.0,<6.1`
- `pymysql`
- `django-cors-headers`

**Frontend (`package.json`):**
- `react` 19.2.6
- `react-dom` 19.2.6
- `react-router-dom` 7.17.0
- `axios` 1.17.0

**Frontend (devDependencies):**
- `@vitejs/plugin-react` 4.8.3
- `vite` 8.0.16
- `tailwindcss` 3.4.19
- `postcss` 9.0.0
- `autoprefixer` 10.4.21
- `eslint` 9.27.0
- `@eslint/js` 9.27.0
- `eslint-plugin-react-hooks` 5.2.0
- `eslint-plugin-react-refresh` 4.20.0
- `globals` 16.0.0

---

## 4. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────┐
│         Client (Browser)            │
│    React 19 + Vite + Tailwind       │
│    Port: 5173 (Vite dev server)     │
└────────────────┬────────────────────┘
                 │  JSON over HTTP
                 │  Cookie: sessionid=...
                 │  Base URL: /api
                 ▼
┌─────────────────────────────────────┐
│      Django 6.0 (Backend API)       │
│      Port: 8000                     │
│  ┌───────────────────────────────┐  │
│  │  medisoft/ (project package)  │  │
│  │   settings.py                 │  │
│  │   urls.py → /api/ → core/     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  core/ (single Django app)    │  │
│  │   models.py (15 tables)       │  │
│  │   views.py (25+ endpoints)    │  │
│  │   admin_views.py (20+ admin)  │  │
│  │   urls.py                     │  │
│  └───────────────────────────────┘  │
└────────────────┬────────────────────┘
                 │  Django ORM (PyMySQL)
                 ▼
┌─────────────────────────────────────┐
│         MySQL 8 Database            │
│         medisoft_db                 │
│         22 tables                   │
└─────────────────────────────────────┘
```

### Design Principles

- **One Django project** (`medisoft`) with **one app** (`core`) keeps the codebase small
- All API endpoints under `/api/` prefix
- PyMySQL shim in `medisoft/__init__.py` for MySQL access without C extensions
- Function-based views (no DRF dependency)
- Uniform JSON envelope from every endpoint
- Session-based auth (no JWT complexity for single-domain web frontend)

---

## 5. Directory Structure

```
MEDISOFTPROJECT/
├── .gitignore                          Python / Django ignores
├── CODEBASE_REPORT.md                  This file
├── PROJECT_EXPLANATION.md              Project documentation
├── README.md                           Project readme
├── START_HERE.md                       Quick start guide
│
├── backend/
│   ├── manage.py                       Django CLI entry point
│   ├── api_tests.http                  VS Code REST Client samples
│   ├── test_admin_api.py               Admin API test scripts
│   ├── test_admin_api2.py              Admin API test scripts
│   ├── test_admin_api3.py              Admin API test scripts
│   │
│   ├── medisoft/                       Django project package
│   │   ├── __init__.py                 PyMySQL shim
│   │   ├── settings.py                 Installed apps, DB, CORS, bKash config
│   │   ├── urls.py                     /admin/ + /api/ routes
│   │   ├── asgi.py                     ASGI entry
│   │   ├── wsgi.py                     WSGI entry
│   │   └── backends/
│   │       └── mysql/
│   │           └── base.py             Custom MySQL database backend
│   │
│   └── core/                           Single Django app (all logic)
│       ├── __init__.py
│       ├── apps.py
│       ├── admin.py                    (Empty — models not registered)
│       ├── models.py                   15 database models
│       ├── views.py                    25+ REST endpoints
│       ├── admin_views.py              20+ admin endpoints
│       ├── urls.py                     All API routes
│       ├── tests.py                    4 integration tests
│       ├── bkash_service.py            bKash payment gateway service
│       ├── sslcommerz_service.py       SSLCommerz payment gateway service
│       ├── management/
│       │   └── commands/
│       │       └── seed_data.py        Database seed command
│       └── migrations/
│           └── 0001_initial.py         Initial schema
│
└── frontend/
    ├── index.html                      HTML entry point
    ├── package.json                    NPM dependencies & scripts
    ├── package-lock.json               Dependency lock file
    ├── vite.config.js                  Vite build configuration
    ├── tailwind.config.js              Tailwind CSS configuration (12 animations)
    ├── postcss.config.js               PostCSS configuration
    ├── eslint.config.js                ESLint configuration
    ├── public/
    │   ├── favicon.svg                 Application icon
    │   └── icons.svg                   SVG icons
    │
    └── src/
        ├── main.jsx                    React entry point
        ├── index.css                   Global CSS + animation keyframes
        ├── App.jsx                     Root component + routing
        │
        ├── api/
        │   ├── axios.js                Axios instance (baseURL, interceptors)
        │   └── index.js                70+ API function exports
        │
        ├── assets/
        │   ├── hero.png                Hero image
        │   ├── react.svg               React logo
        │   └── vite.svg                Vite logo
        │
        ├── components/
        │   ├── AnimatedPage.jsx         Animation components (FadeIn, ScaleIn, ScrollReveal, etc.)
        │   └── Layout.jsx              Sidebar + navbar layout with animations
        │
        ├── context/
        │   └── AuthContext.jsx          Authentication context provider
        │
        └── pages/
            ├── Landing.jsx              Public landing page
            ├── Login.jsx                Sign-in page
            ├── Register.jsx             Sign-up page
            ├── Dashboard.jsx            Patient dashboard
            ├── Doctors.jsx              Doctor directory
            ├── Appointments.jsx         Appointment management
            ├── Hospitals.jsx            Hospital directory + seat booking
            ├── BloodBank.jsx            Blood donor search + requests
            ├── Ambulance.jsx            Ambulance booking
            ├── Medicines.jsx            Medicine marketplace
            ├── Articles.jsx             Health articles
            ├── LabBookings.jsx          Lab test booking
            ├── Payments.jsx             Payment management + bKash
            ├── PaymentSuccess.jsx       bKash success callback
            ├── PaymentFail.jsx          bKash fail callback
            ├── PaymentCancel.jsx        bKash cancel callback
            ├── Profile.jsx              User profile management
            │
            └── admin/
                ├── AdminDashboard.jsx   Admin overview dashboard
                ├── AdminUsers.jsx       User management
                ├── AdminDoctors.jsx     Doctor management
                ├── AdminHospitals.jsx   Hospital management
                ├── AdminMedicines.jsx   Medicine catalog management
                ├── AdminMedicineOrders.jsx  Order management
                ├── AdminBloodBank.jsx   Blood donor/request management
                ├── AdminAmbulance.jsx   Ambulance booking management
                ├── AdminAppointments.jsx    Appointment management
                ├── AdminArticles.jsx    Article management
                ├── AdminLabBookings.jsx     Lab booking management
                └── AdminSeatBookings.jsx    Seat booking management
```

---

## 6. Backend

### 6.1 Django Configuration ([`settings.py`](backend/medisoft/settings.py))

| Setting | Value |
|---------|-------|
| `SECRET_KEY` | Hard-coded (insecure — see §15) |
| `DEBUG` | `True` |
| `ALLOWED_HOSTS` | `['*']` |
| `AUTH_USER_MODEL` | `core.User` |
| `DATABASES` | MySQL on `127.0.0.1:3306`, database `medisoft`, user `root` |
| `CORS_ALLOW_ALL_ORIGINS` | `True` |
| `STATIC_URL` | `/static/` |
| `MEDIA_URL` | `/media/` |
| `LOGIN_URL` | `/api/auth/login/` |

### 6.2 Custom MySQL Backend ([`base.py`](backend/medisoft/backends/mysql/base.py))

Custom `DatabaseWrapper`, `DatabaseFeatures`, and `DatabaseOperations` classes that extend Django's MySQL backend to handle specific MySQL compatibility issues (e.g., `allows_group_by_selected`).

### 6.3 Models ([`models.py`](backend/core/models.py))

15 models with explicit primary keys and `db_table` names:

| # | Model | Table | Key Fields |
|---|-------|-------|------------|
| 1 | [`User`](backend/core/models.py:38) | `users` | email (login), password_hash, full_name, phone, role, is_active |
| 2 | [`Patient`](backend/core/models.py:90) | `patients` | user (FK), dob, gender, blood_group, city, emergency_contact |
| 3 | [`Doctor`](backend/core/models.py:124) | `doctors` | user (FK), specialization, license_number, consultation_fee, is_verified |
| 4 | [`Hospital`](backend/core/models.py:160) | `hospitals` | name, address, city, phone, total_seats, available_seats, seat_types |
| 5 | [`Appointment`](backend/core/models.py:185) | `appointments` | patient (FK), doctor (FK), appointment_date, type, status, meeting_url |
| 6 | [`Prescription`](backend/core/models.py:232) | `prescriptions` | appointment (FK), doctor (FK), patient (FK), medicine, dosage, notes |
| 7 | [`SeatBooking`](backend/core/models.py:261) | `seat_bookings` | patient (FK), hospital (FK), seat_type, check_in, check_out, total_amount |
| 8 | [`BloodDonor`](backend/core/models.py:307) | `blood_donors` | user (FK), blood_group, city, last_donation_date |
| 9 | [`BloodRequest`](backend/core/models.py:332) | `blood_requests` | patient (FK), blood_group, hospital, urgency, status |
| 10 | [`AmbulanceBooking`](backend/core/models.py:371) | `ambulance_bookings` | patient (FK), driver (FK), pickup, destination, status, fare |
| 11 | [`Medicine`](backend/core/models.py:410) | `medicines` | name, description, price, stock, category, requires_rx |
| 12 | [`MedicineOrder`](backend/core/models.py:441) | `medicine_orders` | patient (FK), medicine (FK), quantity, total_price, status |
| 13 | [`LabBooking`](backend/core/models.py:482) | `lab_bookings` | patient (FK), test_name, lab_name, booking_date, status |
| 14 | [`Article`](backend/core/models.py:522) | `articles` | author (FK), title, content, category, is_published, published_at |
| 15 | [`Payment`](backend/core/models.py:550) | `payments` | user (FK), service_type, service_id, amount, status, txn_reference |

### 6.4 API Endpoints

#### Public Routes ([`views.py`](backend/core/views.py))

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | — | Register patient/doctor |
| POST | `/api/auth/login/` | — | Session login |
| POST | `/api/auth/logout/` | ✓ | Session logout |
| GET | `/api/auth/profile/` | ✓ | View own profile |
| PUT | `/api/auth/profile/` | ✓ | Update own profile |
| GET | `/api/doctors/` | — | List/search doctors |
| GET | `/api/doctors/specializations/` | — | Distinct specializations |
| GET | `/api/appointments/` | ✓ | List appointments |
| POST | `/api/appointments/` | ✓ | Book appointment |
| PUT | `/api/appointments/{id}/status/` | ✓ | Update status |
| GET | `/api/appointments/{id}/meeting-url/` | ✓ | Get meeting URL |
| GET | `/api/prescriptions/` | ✓ | List prescriptions |
| POST | `/api/prescriptions/` | ✓ | Create prescription |
| GET | `/api/hospitals/` | — | List hospitals |
| POST | `/api/hospitals/` | admin | Create hospital |
| GET | `/api/seat-bookings/` | ✓ | List seat bookings |
| POST | `/api/seat-bookings/` | ✓ | Book seat |
| PUT | `/api/seat-bookings/{id}/status/` | ✓ | Update booking status |
| GET | `/api/blood-donors/` | — | Search donors |
| POST | `/api/blood-donors/register/` | ✓ | Register as donor |
| GET | `/api/blood-requests/` | ✓ | List blood requests |
| POST | `/api/blood-requests/` | ✓ | Create blood request |
| GET | `/api/ambulance/bookings/` | ✓ | List ambulance bookings |
| POST | `/api/ambulance/bookings/` | ✓ | Book ambulance |
| PUT | `/api/ambulance/bookings/{id}/status/` | ✓ | Update booking status |
| GET | `/api/medicines/` | — | Browse catalog |
| POST | `/api/medicines/` | admin | Add medicine |
| GET | `/api/medicines/orders/` | ✓ | List orders |
| POST | `/api/medicines/orders/` | ✓ | Place order |
| PUT | `/api/medicines/orders/{id}/cancel/` | ✓ | Cancel order |
| GET | `/api/articles/` | ✓ | List articles |
| GET | `/api/articles/{id}/` | ✓ | Single article |
| POST | `/api/articles/` | ✓ | Publish article |
| GET | `/api/lab-bookings/` | ✓ | List lab bookings |
| POST | `/api/lab-bookings/` | ✓ | Book lab test |
| POST | `/api/payments/` | ✓ | Initiate payment |
| POST | `/api/payments/callback/` | — | Gateway webhook |
| GET | `/api/payments/prices/` | ✓ | Service prices |
| GET | `/api/dashboard-stats/` | ✓ | Dashboard statistics |

#### bKash Payment Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/bkash/init/` | Initialize bKash payment |
| POST | `/api/payments/bkash/success/` | Success callback |
| POST | `/api/payments/bkash/fail/` | Fail callback |
| POST | `/api/payments/bkash/cancel/` | Cancel callback |
| POST | `/api/payments/bkash/ipn/` | Instant Payment Notification |

#### Admin API Routes ([`admin_views.py`](backend/core/admin_views.py))

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/` | Admin dashboard stats |
| GET/PUT/DELETE | `/api/admin/users/` | User management |
| GET/POST/PUT/DELETE | `/api/admin/doctors/` | Doctor management |
| GET/POST/PUT/DELETE | `/api/admin/hospitals/` | Hospital management |
| GET/POST/PUT/DELETE | `/api/admin/blood-donors/` | Donor management |
| GET/PUT/DELETE | `/api/admin/blood-requests/` | Blood request management |
| GET/POST/PUT/DELETE | `/api/admin/medicines/` | Medicine management |
| GET/PUT | `/api/admin/medicine-orders/` | Order management |
| GET/PUT | `/api/admin/ambulance-bookings/` | Ambulance management |
| GET/PUT | `/api/admin/appointments/` | Appointment management |
| GET/PUT | `/api/admin/seat-bookings/` | Seat booking management |
| GET/PUT | `/api/admin/lab-bookings/` | Lab booking management |
| GET/POST/PUT/DELETE | `/api/admin/articles/` | Article management |
| GET/PUT | `/api/admin/payments/` | Payment management |
| GET | `/api/admin/prescriptions/` | Prescription management |

### 6.5 Response Convention

Every endpoint returns a uniform JSON envelope:

```json
// Success
{ "success": true, "data": <payload> }

// Error
{ "success": false, "error": "<human-readable message>" }
```

HTTP Status Codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 405 (Method Not Allowed).

### 6.6 Tests ([`tests.py`](backend/core/tests.py))

4 integration tests in `MedisoftAPITests` class:

| Test | Coverage |
|------|----------|
| `test_user_registration_and_login` | Patient/Doctor profile auto-creation, session login |
| `test_appointment_booking` | Patient books video appointment, sees it in list |
| `test_hospital_seat_booking` | Seat booking decrements `available_seats`, computes `total_amount` |
| `test_medicine_purchasing` | Medicine order decrements `stock`, computes `total_price` |

---

## 7. Frontend

### 7.1 Build Configuration

- **Vite** 8.0.16 with `@vitejs/plugin-react` 4.8.3
- **Tailwind CSS** 3.4.19 with PostCSS
- **ESLint** 9.27.0 with React hooks and React Refresh plugins

### 7.2 Axios Configuration ([`axios.js`](frontend/src/api/axios.js))

```javascript
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // Essential for session cookies
});
```

- Response interceptor extracts error messages from API responses
- `withCredentials: true` ensures session cookies are sent on every request

### 7.3 API Layer ([`index.js`](frontend/src/api/index.js))

70+ exported API functions organized by module:
- **Auth:** `loginUser`, `registerUser`, `logoutUser`, `getProfile`, `updateProfile`
- **Doctors:** `getDoctors`, `getSpecializations`
- **Appointments:** `getAppointments`, `createAppointment`, `updateAppointmentStatus`, `getMeetingUrl`
- **Prescriptions:** `getPrescriptions`, `createPrescription`
- **Hospitals:** `getHospitals`, `createHospital`
- **Seat Bookings:** `getSeatBookings`, `createSeatBooking`, `updateSeatBookingStatus`
- **Blood:** `searchDonors`, `registerDonor`, `getBloodRequests`, `createBloodRequest`
- **Ambulance:** `getAmbulanceBookings`, `createAmbulanceBooking`, `updateAmbulanceStatus`
- **Medicines:** `getMedicines`, `createMedicine`, `getMedicineOrders`, `createMedicineOrder`, `cancelMedicineOrder`
- **Lab:** `getLabBookings`, `createLabBooking`
- **Articles:** `getArticles`, `getArticle`, `createArticle`
- **Payments:** `createPayment`, `getServicePrices`, `initBkashPayment`, `getDashboardStats`
- **Admin (20+ functions):** Full CRUD for all admin resources with `unwrap` helper

### 7.4 Authentication Context ([`AuthContext.jsx`](frontend/src/context/AuthContext.jsx))

- `AuthProvider` wraps the entire app
- On mount, calls `getProfile()` to restore session
- Exposes: `user`, `login()`, `register()`, `logout()`, `loading`
- `logout()` catches API errors and always clears local state (`setUser(null)`)

### 7.5 Page Components

#### Public Pages
| Component | File | Features |
|-----------|------|----------|
| Landing | [`Landing.jsx`](frontend/src/pages/Landing.jsx) | Hero section, 8 service cards, statistics with counter animation, testimonials, scroll-triggered animations |
| Login | [`Login.jsx`](frontend/src/pages/Login.jsx) | Animated entrance, email/password form, error handling |
| Register | [`Register.jsx`](frontend/src/pages/Register.jsx) | Multi-field form (name, email, phone, password, role), animated entrance |

#### Patient Pages
| Component | File | Features |
|-----------|------|----------|
| Dashboard | [`Dashboard.jsx`](frontend/src/pages/Dashboard.jsx) | Stats overview, 8 feature cards with icons, animated grid |
| Doctors | [`Doctors.jsx`](frontend/src/pages/Doctors.jsx) | Doctor directory with search/filter, specialization icons, avatar colors |
| Appointments | [`Appointments.jsx`](frontend/src/pages/Appointments.jsx) | Appointment list with status filtering, video meeting URL, status updates |
| Hospitals | [`Hospitals.jsx`](frontend/src/pages/Hospitals.jsx) | Hospital directory, seat booking with type selection (General/Cabin/ICU/VIP) |
| BloodBank | [`BloodBank.jsx`](frontend/src/pages/BloodBank.jsx) | Donor search, donor registration, blood request creation with urgency levels |
| Ambulance | [`Ambulance.jsx`](frontend/src/pages/Ambulance.jsx) | Booking form, status tracking, driver assignment |
| Medicines | [`Medicines.jsx`](frontend/src/pages/Medicines.jsx) | Medicine catalog, cart system, order placement, 30-minute cancellation window |
| Articles | [`Articles.jsx`](frontend/src/pages/Articles.jsx) | Health articles with categories, article creation for doctors |
| LabBookings | [`LabBookings.jsx`](frontend/src/pages/LabBookings.jsx) | Lab test booking with test type icons, status tracking |
| Payments | [`Payments.jsx`](frontend/src/pages/Payments.jsx) | Payment management, bKash integration, service price selection |
| Profile | [`Profile.jsx`](frontend/src/pages/Profile.jsx) | User profile view/edit, role-based field display |

#### Payment Callback Pages
| Component | File | Features |
|-----------|------|----------|
| PaymentSuccess | [`PaymentSuccess.jsx`](frontend/src/pages/PaymentSuccess.jsx) | Success animation, transaction details, auto-redirect |
| PaymentFail | [`PaymentFail.jsx`](frontend/src/pages/PaymentFail.jsx) | Error display, retry button |
| PaymentCancel | [`PaymentCancel.jsx`](frontend/src/pages/PaymentCancel.jsx) | Cancellation notice |

#### Admin Pages
| Component | File | Features |
|-----------|------|----------|
| AdminDashboard | [`AdminDashboard.jsx`](frontend/src/pages/admin/AdminDashboard.jsx) | Overview cards with statistics |
| AdminUsers | [`AdminUsers.jsx`](frontend/src/pages/admin/AdminUsers.jsx) | User CRUD, role-based color coding |
| AdminDoctors | [`AdminDoctors.jsx`](frontend/src/pages/admin/AdminDoctors.jsx) | Doctor CRUD with specialization, verification flag |
| AdminHospitals | [`AdminHospitals.jsx`](frontend/src/pages/admin/AdminHospitals.jsx) | Hospital CRUD with seat management |
| AdminMedicines | [`AdminMedicines.jsx`](frontend/src/pages/admin/AdminMedicines.jsx) | Medicine catalog CRUD |
| AdminMedicineOrders | [`AdminMedicineOrders.jsx`](frontend/src/pages/admin/AdminMedicineOrders.jsx) | Order status management |
| AdminBloodBank | [`AdminBloodBank.jsx`](frontend/src/pages/admin/AdminBloodBank.jsx) | Donor and blood request management |
| AdminAmbulance | [`AdminAmbulance.jsx`](frontend/src/pages/admin/AdminAmbulance.jsx) | Ambulance booking management |
| AdminAppointments | [`AdminAppointments.jsx`](frontend/src/pages/admin/AdminAppointments.jsx) | Appointment management |
| AdminArticles | [`AdminArticles.jsx`](frontend/src/pages/admin/AdminArticles.jsx) | Article CRUD with publish toggle |
| AdminLabBookings | [`AdminLabBookings.jsx`](frontend/src/pages/admin/AdminLabBookings.jsx) | Lab booking management |
| AdminSeatBookings | [`AdminSeatBookings.jsx`](frontend/src/pages/admin/AdminSeatBookings.jsx) | Seat booking management |

---

## 8. Database Schema

### Entity Relationship

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

### Key Business Rules

- **Seat Booking:** `available_seats` auto-decrements on booking, auto-restores on cancel/check-out
- **Medicine Orders:** Stock is decremented; `requires_rx=True` mandates a `prescription_id`
- **Appointments:** `meeting_url` auto-generated only on `Confirmed` for virtual types
- **Blood Donors:** `update_or_create` so re-registering updates existing record
- **Payments:** 4 statuses: `Pending / Success / Failed / Refunded`

---

## 9. API Reference

### Base URL
```
http://127.0.0.1:8000/api/
```

### Authentication
All authenticated endpoints require the `sessionid` cookie (set automatically by the browser via `withCredentials: true` in Axios).

### Response Format
```json
{ "success": true, "data": { ... } }
```
```json
{ "success": false, "error": "Human-readable error message" }
```

### Endpoint Count

| Category | Endpoints |
|----------|-----------|
| Auth & Profile | 5 |
| Doctors | 2 |
| Appointments | 4 |
| Prescriptions | 2 |
| Hospitals | 2 |
| Seat Bookings | 3 |
| Blood Bank | 4 |
| Ambulance | 3 |
| Medicines | 4 |
| Articles | 3 |
| Lab Bookings | 2 |
| Payments (general) | 3 |
| bKash | 5 |
| Dashboard | 1 |
| **Total Public** | **43** |
| Admin | 30+ |
| **Grand Total** | **70+** |

---

## 10. Authentication & Authorization

### Flow

```
Client                          Backend
------                          -------
POST /auth/register/ ───►      create User + profile
                          ◄─── 201 { success, data: { user } }

POST /auth/login/     ───►     authenticate + login()
                          ◄─── 200 { success, data: { user } }
                                Set-Cookie: sessionid=...

GET  /auth/profile/   ───►     read request.user
     Cookie: sessionid        from session
                          ◄─── 200 { success, data: { ... } }

POST /auth/logout/    ───►     logout()
                          ◄─── 200 { success, data: { message } }
```

### Role Enforcement

- Backend: `@login_required_api` decorator + explicit `if user.role == ...` blocks in each view
- Frontend: [`ProtectedRoute`](frontend/src/App.jsx:35) for authenticated pages, [`AdminRoute`](frontend/src/App.jsx:42) for admin pages, [`PublicRoute`](frontend/src/App.jsx:50) for login/register
- Logout redirect: Unauthenticated users are redirected to `/` (landing page)

---

## 11. Frontend Routing

Defined in [`App.jsx`](frontend/src/App.jsx:57):

### Public Routes
| Path | Component | Auth |
|------|-----------|------|
| `/` | `Landing` | Public |
| `/login` | `Login` | PublicRoute (redirects to `/dashboard` if logged in) |
| `/register` | `Register` | PublicRoute |

### Protected Routes (require login)
| Path | Component |
|------|-----------|
| `/dashboard` | `Dashboard` |
| `/doctors` | `Doctors` |
| `/appointments` | `Appointments` |
| `/hospitals` | `Hospitals` |
| `/blood-bank` | `BloodBank` |
| `/ambulance` | `Ambulance` |
| `/medicines` | `Medicines` |
| `/lab-bookings` | `LabBookings` |
| `/articles` | `Articles` |
| `/payments` | `Payments` |
| `/profile` | `Profile` |

### Payment Callback Routes (public)
| Path | Component |
|------|-----------|
| `/payments/success` | `PaymentSuccess` |
| `/payments/fail` | `PaymentFail` |
| `/payments/cancel` | `PaymentCancel` |

### Admin Routes (require admin role)
| Path | Component |
|------|-----------|
| `/admin` | `AdminDashboard` |
| `/admin/doctors` | `AdminDoctors` |
| `/admin/hospitals` | `AdminHospitals` |
| `/admin/medicines` | `AdminMedicines` |
| `/admin/medicine-orders` | `AdminMedicineOrders` |
| `/admin/blood-bank` | `AdminBloodBank` |
| `/admin/ambulance` | `AdminAmbulance` |
| `/admin/appointments` | `AdminAppointments` |
| `/admin/users` | `AdminUsers` |
| `/admin/articles` | `AdminArticles` |
| `/admin/lab-bookings` | `AdminLabBookings` |
| `/admin/seat-bookings` | `AdminSeatBookings` |

### Catch-All
- `*` → Redirects to `/`

---

## 12. UI/Animation System

### Animation Components ([`AnimatedPage.jsx`](frontend/src/components/AnimatedPage.jsx))

| Component | Description |
|-----------|-------------|
| `AnimatedPage` | Base page transition wrapper with CSS animation |
| `FadeIn` | Simple opacity fade-in with configurable delay and duration |
| `ScaleIn` | Scale + opacity entrance animation |
| `StaggerChildren` | Staggered entrance animation for lists |
| `ScrollReveal` | Intersection Observer-based scroll-triggered animations |
| `CountUpNumber` | Animated number counter for statistics |

### CSS Keyframes ([`index.css`](frontend/src/index.css))

12 custom animation keyframes:
- `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn`, `bounceIn`, `float`
- `pulseGlow`, `shimmer`, `slideInLeft`, `slideOutLeft`
- `countUp`

### Tailwind Animation Utilities ([`tailwind.config.js`](frontend/tailwind.config.js))

Extended Tailwind config with 12 animation utilities:
- `animate-fade-in`, `animate-fade-in-up`, `animate-fade-in-down`
- `animate-fade-in-left`, `animate-fade-in-right`
- `animate-scale-in`, `animate-bounce-in`, `animate-float`
- `animate-pulse-glow`, `animate-slide-in-left`, `animate-shimmer`
- `animate-count-up`

### Layout Animations ([`Layout.jsx`](frontend/src/components/Layout.jsx))

- Animated sidebar with slide-in/out toggle
- Mobile sidebar overlay with fade transition
- Active navigation item highlighting with color transitions
- Heart icon pulse animation in sidebar header

### Page Animations

Every page component uses the animation system:
- **Landing:** Hero fade-in, service card stagger, statistics counter, testimonial carousel
- **Login/Register:** Staggered form field entrance
- **Dashboard:** Feature card stagger animation
- **All other pages:** Header fade-in, content area animations

---

## 13. Payment Integration

### bKash Tokenized Checkout

Configuration in [`settings.py`](backend/medisoft/settings.py:147):

```python
BKASH = {
    'app_key': '',
    'app_secret': '',
    'username': 'sandbox',
    'password': 'sandbox',
    'sandbox': True,
    'success_url': 'http://localhost:5173/payments/success',
    'fail_url': 'http://localhost:5173/payments/fail',
    'cancel_url': 'http://localhost:5173/payments/cancel',
    'ipn_url': 'http://127.0.0.1:8000/api/payments/bkash/ipn/',
}
```

### Service Types & Prices

| Service | Default Price (BDT) |
|---------|-------------------|
| Appointment | 500.00 |
| SeatBooking | 1,500.00 |
| MedicineOrder | 0.00 |
| LabBooking | 800.00 |
| Ambulance | 1,200.00 |

### Payment Flow

1. Frontend calls [`initBkashPayment()`](frontend/src/api/index.js:130) → `POST /api/payments/bkash/init/`
2. Backend creates payment record and returns bKash checkout URL
3. User completes payment on bKash gateway
4. Gateway redirects to success/fail/cancel URL on frontend
5. Backend receives IPN (Instant Payment Notification) at `/api/payments/bkash/ipn/`
6. Payment status is updated in the database

---

## 14. Code Statistics

### File Counts

| Area | Files |
|------|-------|
| Backend Python files | 12 |
| Frontend JSX components | 27 |
| Frontend JS modules | 4 |
| Configuration files | 6 |
| **Total source files** | **49** |

### Lines of Code (Approximate)

| Area | Lines |
|------|-------|
| `backend/core/views.py` | ~1,353 |
| `backend/core/admin_views.py` | ~1,001 |
| `backend/core/models.py` | ~598 |
| `frontend/src/pages/Landing.jsx` | ~452 |
| `frontend/src/pages/Medicines.jsx` | ~530 |
| `frontend/src/pages/Hospitals.jsx` | ~457 |
| `frontend/src/pages/BloodBank.jsx` | ~435 |
| `frontend/src/pages/Payments.jsx` | ~408 |
| `frontend/src/components/Layout.jsx` | ~269 |
| `frontend/src/pages/Doctors.jsx` | ~270 |
| `frontend/src/api/index.js` | ~286 |
| `frontend/src/components/AnimatedPage.jsx` | ~170 |
| `frontend/tailwind.config.js` | ~81 |
| `frontend/src/App.jsx` | ~107 |

### Component Count

| Category | Count |
|----------|-------|
| Page components (patient) | 13 |
| Page components (admin) | 12 |
| Shared components | 2 |
| Context providers | 1 |
| Animation components | 6 |
| **Total React components** | **34** |

---

## 15. Known Issues & Technical Debt

1. **Hard-coded secret key** — [`settings.py`](backend/medisoft/settings.py:23) has `SECRET_KEY` in plaintext, `DEBUG=True`, and `ALLOWED_HOSTS=['*']`
2. **Empty Django admin** — [`core/admin.py`](backend/core/admin.py) has no model registrations
3. **Doctor city filter bug** — Filters on `user__patient_profile__city` which only exists on patients
4. **CSRF fully disabled** — `@csrf_exempt` on all views for cross-origin convenience in dev
5. **No pagination** — List endpoints return full result sets
6. **No rate limiting** — Auth endpoints have no brute-force protection
7. **No file uploads** — Profile photos, lab results, article images are URL strings
8. **No password reset / email verification** — Would require email backend and token table
9. **Meeting URL stub** — `https://meet.medisoft.com/room-{id}` is not a real WebRTC room
10. **bKash sandbox only** — No production credentials configured
11. **No CORS credentials configuration** — `CORS_ALLOW_ALL_ORIGINS = True` without `CORS_ALLOW_CREDENTIALS`
12. **Custom MySQL backend** — [`base.py`](backend/medisoft/backends/mysql/base.py) may need updates for newer Django versions
13. **No environment variable support** — All config is hard-coded in settings
14. **No CI/CD pipeline** — No automated testing or deployment

---

## 16. Recommendations

### High Priority

1. **Externalize configuration** — Add `.env` file for `SECRET_KEY`, `DEBUG`, DB credentials, bKash keys
2. **Register Django admin models** — Enable `/admin/` for data management
3. **Add CORS credentials support** — `CORS_ALLOW_CREDENTIALS = True` with specific allowed origins
4. **Enable CSRF protection** — Configure proper CSRF for production
5. **Add pagination** — Implement `?page=` parameter for all list endpoints

### Medium Priority

6. **Add database indexes** — On `Doctor(specialization)`, `Doctor(is_verified)`, `Appointment(appointment_date)`, `MedicineOrder(status)`
7. **Add rate limiting** — Protect auth endpoints from brute-force attacks
8. **Implement file uploads** — Profile photos, lab reports, article images via `MEDIA_ROOT` + CDN
9. **Add seed data command** — `python manage.py seed` for test data
10. **Fix doctor city filter** — Add `User.city` or `Doctor.city` field

### Low Priority

11. **Integrate real video room** — Daily.co or Jitsi instead of stub URL
12. **Integrate real payment gateway** — Production bKash or SSLCommerz
13. **Add JWT authentication** — If mobile app is planned
14. **Add CI/CD** — GitHub Actions for `python manage.py test` and `npm run build`
15. **Add email/SMS notifications** — Appointment reminders, blood request alerts

---

## Appendix A: Configuration Files

### Vite Configuration
```javascript
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### PostCSS Configuration
```javascript
// frontend/postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Axios Configuration
```javascript
// frontend/src/api/axios.js
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
```

---

## Appendix B: Development Commands

### Backend
```bash
# Start development server
cd backend
python manage.py runserver

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test core

# Seed database
python manage.py seed
```

### Frontend
```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

---

*This report was generated automatically by analyzing the MEDISOFT codebase.*
