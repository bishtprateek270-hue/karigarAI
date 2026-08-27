# KarigarAI - AI-Powered Platform for Local Artisans

**KarigarAI** is an end-to-end AI-powered e-commerce marketplace platform designed to empower local artisans and craftspeople. It automates product feature recognition from craft photos, generates marketplace-ready titles and descriptions, recommends transparent pricing, and translates listings into local languages (English & Hindi).


---

## 🌐 Live Production Deployment

- 🎨 **Live Frontend Web Portal**: [https://karigar-ai-amber.vercel.app](https://karigar-ai-amber.vercel.app)
- ⚡ **Live FastAPI Backend API**: [https://karigar-ai-8nik.vercel.app](https://karigar-ai-8nik.vercel.app)
- 📄 **Interactive OpenAPI/Swagger Docs**: [https://karigar-ai-8nik.vercel.app/docs](https://karigar-ai-8nik.vercel.app/docs)
- 💓 **Live Health Check Endpoint**: [https://karigar-ai-8nik.vercel.app/health](https://karigar-ai-8nik.vercel.app/health)

---


## 🌟 Key Features

- 📸 **Vision AI Product Feature Extraction**: Automatically detects product type, primary material, dominant colors, craft technique, and artistic style from uploaded product photos (`.jpg`, `.jpeg`, `.png`).
- ✍️ **Automated Marketplace Catalog Generation**: Produces concise titles, grounded descriptions, category paths, and 5–10 relevant search tags.
- 💡 **Rule-Based Price Recommendation Engine**: Transparently calculates production costs, labor rates, craft complexity multipliers, and suggests minimum, recommended, and maximum selling prices in INR (₹).
- 🌐 **Multilingual Support (English & Hindi)**: Instant bidirectional translation for titles, descriptions, categories, and tags.
- 🔐 **PostgreSQL & JWT Authentication**: Secure bcrypt password hashing, token-based authentication, and strict per-user product isolation.
- 🎨 **Modern Artisan React Frontend**: Modern responsive web application built with React, Vite, and an earthy terracotta artisan aesthetic.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.14)
- **AI Integration**: Google Gemini Vision API (`gemini-2.5-flash`) / OpenAI Vision API (`gpt-4o-mini`)
- **Database & ORM**: PostgreSQL with SQLAlchemy ORM (Automatic local SQLite fallback)
- **Security & Auth**: PyJWT, Bcrypt password hashing
- **Testing & Validation**: FastAPI TestClient, Pydantic v2, HTTPX

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS with custom Artisan Design System (Terracotta & Gold theme)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7

---

## 📐 System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│              KarigarAI React Frontend (Vite)             │
│   Dashboard | Add Product | Preview | My Products | Edit│
└────────────────────────────┬────────────────────────────┘
                             │  HTTP REST (JWT Auth)
┌────────────────────────────▼────────────────────────────┐
│                  FastAPI Backend Server                 │
│  ┌──────────────────┐ ┌────────────────┐ ┌────────────┐ │
│  │ Auth & User API  │ │ Vision AI API  │ │ Pricing API│ │
│  └────────┬─────────┘ └───────┬────────┘ └─────┬──────┘ │
│           │                   │                │        │
│  ┌────────▼─────────┐ ┌───────▼────────┐ ┌─────▼──────┐ │
│  │ SQLAlchemy ORM   │ │ Vision & LLM   │ │ Price      │ │
│  │ User & Product   │ │ Service        │ │ Service    │ │
│  └────────┬─────────┘ └────────────────┘ └────────────┘ │
└───────────┼─────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────┐
│    PostgreSQL Database (Fallback: SQLite karigarai.db)  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
copy .env.example .env
```

*Configure your API keys in `backend/.env`:*
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/karigarai_db
JWT_SECRET=your_jwt_secret_key
```

*Run FastAPI backend server:*
```bash
python -m uvicorn main:app --reload --port 8000
```
API Documentation will be available at: **http://127.0.0.1:8000/docs**

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```
Frontend Web Portal will be available at: **http://127.0.0.1:5173**

---

## 📋 API Overview

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | No | System health check |
| `POST` | `/register` | No | Register new artisan account |
| `POST` | `/login` | No | Authenticate user & receive JWT token |
| `POST` | `/analyze-product` | Optional | Vision AI feature extraction & catalog generation |
| `POST` | `/suggest-price` | Optional | Rule-based price recommendations |
| `POST` | `/translate` | Optional | Multilingual translation (English $\leftrightarrow$ Hindi) |
| `POST` | `/products` | **Required** | Create & save new product to user catalog |
| `GET` | `/products` | **Required** | List all products belonging to user |
| `GET` | `/products/{id}` | **Required** | Retrieve specific product by ID |
| `PUT` | `/products/{id}` | **Required** | Update specific product by ID |
| `DELETE` | `/products/{id}` | **Required** | Delete specific product by ID |

---

## 📸 Screenshots

*(Place screenshots here)*
- **Dashboard**: Overview of artisan product listings and quick stats.
- **Add Product & AI Preview**: Image dropzone, Vision AI detected attributes, editable catalog fields, and price calculator.
- **My Products**: Filterable grid view of saved artisan products.

---

## ⚠️ Limitations & Future Scope
- **Vision AI Dependency**: When operating offline without an API key, the system uses deterministic rule-based fallback analysis.
- **Image Storage**: Currently stores uploaded image URLs or local object URLs. Production deployment will integrate AWS S3 / Firebase Storage.
- **Payment Gateway**: Pricing engine suggests recommended prices; future phases will integrate payment gateways (Razorpay / Stripe).

---

## 📄 License
Licensed under the MIT License.
