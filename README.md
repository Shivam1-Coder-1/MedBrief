# 🏥 MedBrief

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge&logo=vercel)](https://med-brief-4hin.vercel.app/)

A full-stack health monitoring web application that allows users to upload medical reports, extract meaningful health data, and view structured insights through an interactive dashboard.

> Built to scale. Not a toy. Not a tutorial clone.

## 🚀 Features

- User authentication (JWT-based)
- User profile management
- Medical report upload (PDF / Image)
- Automated text extraction from reports
- Extraction of vitals (BP, Sugar, etc.)
- Structured health summary & observations
- Secure backend APIs
- Clean React-based frontend dashboard

## 🛠 Tech Stack

**Frontend**
- React.js
- Vite
- React Router
- Fetch API
- CSS

**Backend**
- Django
- Django REST Framework
- Simple JWT (Authentication)
- PostgreSQL / SQLite (dev)

**AI / Processing**
- OCR & text extraction
- Rule-based + AI-assisted analysis (extendable)

## 📁 Project Structure

```
health-project/
├── backend/
│   ├── core/
│   ├── reports/
│   ├── users/
│   ├── manage.py
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   └── .env
└── README.md
```

## 🔐 Environment Variables

**Backend** (`backend/.env`)
```env
DEBUG=True
SECRET_KEY=your_django_secret_key
DATABASE_NAME=health_db
DATABASE_USER=db_user
DATABASE_PASSWORD=db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
JWT_ACCESS_LIFETIME=60
JWT_REFRESH_LIFETIME=1
MEDIA_URL=/media/
MEDIA_ROOT=media/
```

**Frontend** (`frontend/.env`)
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

⚠️ Never commit `.env` files to GitHub.

## ⚙️ Setup Instructions

**Backend**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
## 📌 API Overview

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/token/` | POST | Login |
| `/api/token/refresh/` | POST | Refresh token |
| `/signup/` | POST | User registration |
| `/login/` | POST | User login |
| `/logout/` | POST | User logout |
| `/forgot-password/` | POST | Request password reset |
| `/reset-password/` | POST | Reset password |
| `/profile/create/` | POST | Create user profile |
| `/profile/get/` | GET | Get user profile data |
| `/profile/status/` | GET | Check profile status |
| `/Smart_Help/` | GET | AI assistance endpoint |
| `/api/reports/upload/` | POST | Upload medical report |
| `/api/reports/download/<id>/` | GET | Download report as PDF |
| `/api/reports/history/` | GET | Get user's report history |
| `/api/reports/dashboard/` | GET | Get dashboard analytics |


## 🧠 Future Improvements

- AI-based disease risk prediction
- Charts & health trends
- Doctor/patient role separation
- Cloud storage integration
- Mobile app version

## ⚠️ Disclaimer

This application is not a medical diagnosis tool. It is intended for educational and informational purposes only.
