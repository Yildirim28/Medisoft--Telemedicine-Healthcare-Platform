# Medisoft - Telemedicine Healthcare Platform

## Quick Start Guide

### Prerequisites
- **XAMPP** installed and running (MySQL on port 3306)
- **Python 3.x** installed
- **Node.js** installed (v18+)

---

### Step 1: Start XAMPP
Open **XAMPP Control Panel** → Click **Start** for:
- ✅ Apache
- ✅ MySQL

---

### Step 2: Start the Backend (Django API)

Open a **PowerShell terminal** and run:

```powershell
cd "e:\Education\11th Trimester\MEDISOFTPROJECT\backend"
.\venv\Scripts\Activate.ps1
python manage.py runserver 8080
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

**Keep this terminal open!**

---

### Step 3: Start the Frontend (React)

Open a **second PowerShell terminal** and run:

```powershell
cd "e:\Education\11th Trimester\MEDISOFTPROJECT\frontend"
npm install
npm run dev
```

You should see:
```
Local:   http://localhost:5174/
```

**Keep this terminal open!**

---

### Step 4: Open Your Website

Open your browser and go to: **http://localhost:5174**

---

## Login Credentials

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@medisoft.com       | admin123   |
| Doctor  | doctor@medisoft.com      | password123|
| Patient | patient@medisoft.com     | password123|

---

## Database Management

### Reset database (if needed):
```powershell
cd "e:\Education\11th Trimester\MEDISOFTPROJECT\backend"
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py seed_data
```

---

## How to Stop the Servers

In each terminal, press **Ctrl + C** to stop the running server.

---

## Project Structure

```
MEDISOFTPROJECT/
├── backend/                  # Django backend
│   ├── core/                 # Main app (models, views, admin views)
│   ├── medisoft/             # Django project settings
│   ├── venv/                 # Python virtual environment
│   └── manage.py
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/            # User-facing pages
│   │   ├── pages/admin/      # Admin panel pages (11 pages)
│   │   ├── api/              # API functions
│   │   ├── components/       # Shared components
│   │   ├── context/          # Auth context
│   │   └── App.jsx           # Router
│   └── package.json
├── START_HERE.md             # This file
└── README.md
```

---

## Admin Panel Pages

1. **Dashboard** - Overview and statistics
2. **Doctors** - Manage doctors (add/edit/delete)
3. **Hospitals** - Manage hospitals
4. **Medicines** - Manage medicine inventory
5. **Blood Bank** - Manage blood donors and requests
6. **Ambulance** - View ambulance bookings
7. **Appointments** - View all appointments
8. **Users** - View all registered users
9. **Articles** - Manage health articles
10. **Lab Bookings** - View lab test bookings
11. **Seat Bookings** - View hospital seat bookings
