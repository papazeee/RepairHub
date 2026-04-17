# 🔧 RepairHub — Device Repair Service Web App

A full-stack web application for managing device repair requests.
Customers submit repair orders; admins track and update their status.

---

## 🗂 Project Structure

```
repairshop/
├── .vscode/
│   └── settings.json
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py        # App settings & env vars
│   │   │   ├── database.py      # SQLAlchemy engine/session
│   │   │   └── security.py      # JWT auth, password hashing
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── notification.py
│   │   │   ├── repair_request.py
│   │   │   └── user.py
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   ├── notification_repository.py
│   │   │   ├── repair_repository.py
│   │   │   └── user_repository.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── notifications.py
│   │   │   └── repairs.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── notification.py
│   │   │   └── repair.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── notification_service.py
│   │   │   └── repair_service.py
│   │   └── __init__.py
│   ├── .env.example
│   ├── main.py                  # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── run.py
│   └── seed_admin.py            # Creates default admin account
├── frontend/
│   ├── pages/
│   │   ├── admin.html
│   │   ├── booking.html
│   │   ├── dashboard.html
│   │   ├── home.html
│   │   ├── login.html
│   │   ├── my-orders.html
│   │   ├── notifications.html
│   │   └── profile.html
│   ├── scripts/
│   │   ├── admin.js
│   │   ├── api.js
│   │   ├── dashboard.js
│   │   ├── home.js
│   │   ├── index.js
│   │   ├── my-orders.js
│   │   ├── notifications.js
│   │   └── profile.js
│   └── styles/
│       └── main.css
├── index.html
├── LICENSE
└── README.md
```

---

##  Quick Start — Local (SQLite)

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

Open `frontend/pages/login.html` with a local server:

```bash
# Option A: VS Code Live Server extension (recommended)
# Right-click login.html → "Open with Live Server"

# Option B: Python
cd frontend
python -m http.server 5500
# Open http://localhost:5500/pages/login.html
```

### Default Admin Credentials
```
Email:    admin@repairhub.com
Password: Admin@1234
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

### Railway deployment

Railway injects a `PORT` environment variable at runtime. Use a start command like:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

If you run the bundled entrypoint instead, it now falls back to `PORT` automatically and uses `8000` locally when `PORT` is not set.

---

## API Endpoints

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

## Features

- JWT authentication (bcrypt password hashing)
- Customer: register, login, submit repair orders, track status
- Admin: dashboard with stats, view all orders, update status with notes
- In-app notification system (admin notified on every new order, polls every 30s)
- PostgreSQL in production, SQLite for local dev
- Responsive UI — works on mobile and desktop
- Toast notifications for all user feedback

---

## Security Notes

- Passwords hashed with **bcrypt** (not plain SHA256)
- JWT tokens expire after 24 hours (configurable)
- Admin routes protected by role check on backend
- Never hardcode credentials — always use `.env`
- Set `ALLOWED_ORIGINS` to your domain in production
