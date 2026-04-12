# 🔧 RepairHub — Device Repair Service Web App

A full-stack web application for managing device repair requests.
Customers submit repair orders; admins track and update their status.

---

## 🗂 Project Structure

```
repairshop/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py        # App settings & env vars
│   │   │   ├── database.py      # SQLAlchemy engine (SQLite/PostgreSQL)
│   │   │   └── security.py      # JWT auth, password hashing (bcrypt)
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── repair_request.py
│   │   │   └── notification.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── repair.py
│   │   │   └── notification.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── repair_service.py
│   │   │   └── notification_service.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── repairs.py
│   │       └── notifications.py
│   ├── main.py                  # FastAPI app entrypoint
│   ├── seed_admin.py            # Creates default admin account
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── pages/
    │   ├── index.html           # Customer login / register
    │   ├── dashboard.html       # Multi-step repair request form
    │   ├── my-orders.html       # Customer order tracking
    │   └── admin.html           # Admin panel (login + dashboard)
    ├── styles/
    │   └── main.css             # Shared stylesheet
    └── scripts/
        └── api.js               # API helpers, auth, toasts (ES module)
```

---

## ⚡ Quick Start — Local (SQLite)

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure env
cp .env.example .env
# Edit .env — at minimum set a strong SECRET_KEY

# Create admin account
python seed_admin.py

# Start server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API is now live at: http://127.0.0.1:8000
Interactive docs: http://127.0.0.1:8000/docs

### 2. Frontend

Open `frontend/pages/index.html` with a local server:

```bash
# Option A: VS Code Live Server extension (recommended)
# Right-click index.html → "Open with Live Server"

# Option B: Python
cd frontend
python -m http.server 5500
# Open http://localhost:5500/pages/index.html
```

### Default Admin Credentials
```
Email:    admin@repairhub.com
Password: Admin@1234
```
> ⚠️ Change these after first login in production.

---

## 🐘 Production Setup (PostgreSQL)

### 1. Create database

```sql
CREATE DATABASE repairhub;
CREATE USER repairhub_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE repairhub TO repairhub_user;
```

### 2. Update `.env`

```env
SECRET_KEY=your-strong-random-secret-here
DATABASE_URL=postgresql://repairhub_user:your_password@localhost:5432/repairhub
ALLOWED_ORIGINS=https://yourdomain.com
```

### 3. Run migrations & seed

```bash
python seed_admin.py
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET  | `/api/auth/me` | Get current user profile |

### Customer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/repair-requests` | Submit repair request |
| GET  | `/api/repair-requests/my` | View own orders |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/admin/stats` | Dashboard statistics |
| GET    | `/api/admin/requests` | All repair requests |
| PATCH  | `/api/admin/requests/{id}/status` | Update order status |
| GET    | `/api/admin/users` | All customers |
| GET    | `/api/admin/notifications` | Admin notifications |
| PATCH  | `/api/admin/notifications/read-all` | Mark all read |
| PATCH  | `/api/admin/notifications/{id}/read` | Mark one read |

---

## ✅ Features

- JWT authentication (bcrypt password hashing)
- Customer: register, login, submit repair orders, track status
- Admin: dashboard with stats, view all orders, update status with notes
- In-app notification system (admin notified on every new order, polls every 30s)
- PostgreSQL in production, SQLite for local dev
- Responsive UI — works on mobile and desktop
- Toast notifications for all user feedback

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (not plain SHA256)
- JWT tokens expire after 24 hours (configurable)
- Admin routes protected by role check on backend
- Never hardcode credentials — always use `.env`
- Set `ALLOWED_ORIGINS` to your domain in production
