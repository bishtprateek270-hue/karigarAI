<div align="center">

# ✨ KarigarAI (कारीगर AI)

### *Empowering Indian Artisans through AI-Driven E-Commerce & WhatsApp Commerce*

[![Live Demo](https://img.shields.io/badge/Live_Demo-karigar--ai--amber.vercel.app-d97706?style=for-the-badge&logo=vercel)](https://karigar-ai-amber.vercel.app)
[![API Status](https://img.shields.io/badge/API_Status-Online-10b981?style=for-the-badge&logo=fastapi)](https://karigar-ai-8nik.vercel.app/health)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Python Version](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React Version](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

---

</div>

## 📌 Executive Overview

**KarigarAI** is a full-stack, production-ready AI marketplace platform built specifically to bridge the digital gap for local artisans, craftspeople, and heritage creators in India. 

Artisans often face challenges in writing marketing titles, setting competitive prices, creating digital catalogs, and communicating in multiple languages. **KarigarAI** solves this by turning craft photos and basic artisan facts into marketplace-ready listings, generating cultural heritage stories, calculating fair labor-based prices, creating printable exhibition QR price tags, and enabling **direct buyer-to-artisan ordering via WhatsApp**.

---

## 🔗 Live Production Links

- 🎨 **Live Web Portal**: [karigar-ai-amber.vercel.app](https://karigar-ai-amber.vercel.app)
- ⚡ **Production FastAPI Server**: [karigar-ai-8nik.vercel.app](https://karigar-ai-8nik.vercel.app)
- 📖 **Interactive Swagger Docs**: [karigar-ai-8nik.vercel.app/docs](https://karigar-ai-8nik.vercel.app/docs)
- 💓 **Health Check Endpoint**: [karigar-ai-8nik.vercel.app/health](https://karigar-ai-8nik.vercel.app/health)

---

## ✨ Core Features & Highlights

### 🛍️ 1. Smart Artisan Catalog Generation
- **Vision AI Feature Extraction**: Upload craft photos (`.jpg`, `.jpeg`, `.png`) to automatically extract materials, craft techniques, dominant colors, and artistic styles.
- **Multilingual Support (English & Hindi)**: Instant bi-directional translation for titles, descriptions, categories, and tags.

### 💰 2. Fair Pricing Recommendation Engine
- **Labor-Based Cost Tiering**: Calculates production costs based on raw material expenses, artisan labor hours, hourly rates, and craft complexity.
- **Tiered Recommendations**: Outputs transparent **Minimum**, **Recommended**, and **Maximum** selling price tiers in Indian Rupees (₹).

### 💬 3. Direct WhatsApp Commerce
- **Zero-Middleman Ordering**: Buyers can click **Order Directly via WhatsApp** on any product page.
- **Verified Seller Routing**: Automatically routes order requests to the artisan's verified database phone number (`+91...`) with pre-filled product details, price, and craft links.

### 📜 4. Cultural Heritage Story Engine & Exhibition QR Tags
- **Artisan Heritage Bio**: Generates 2-paragraph authentic cultural narratives highlighting lineage and craft technique in both English and Hindi.
- **Printable Exhibition QR Tags**: Generates printable physical price tags with scannable QR codes for fairs, craft melas, and shop displays.

### 🔑 5. Production Security & Email OTP Reset
- **Email OTP Password Recovery**: Powered by **Resend API**, delivering 6-digit numeric OTP codes directly to user email inboxes.
- **BCrypt & JWT Authentication**: Token-based access control with password eye visibility toggles (`Eye` / `EyeOff`).
- **Dedicated Profile Management (`/profile`)**: Standalone page for artisans to update Full Name, WhatsApp Number (`+91`), Email, and Studio Bio.

---

## 🛠️ Tech Stack & System Architecture

### Frontend Stack
- **Framework**: React 19 + Vite 8
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Earthy Terracotta & Gold Artisan Design System)
- **Deployment**: Vercel

### Backend Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database & ORM**: PostgreSQL (Neon DB) with SQLAlchemy ORM (Automatic local SQLite fallback)
- **AI Services**: Google Gemini Vision API (`gemini-2.5-flash`) / OpenAI Vision API (`gpt-4o-mini`)
- **Email Dispatch**: Resend REST API & Python `smtplib`
- **Auth & Security**: PyJWT, BCrypt, Passlib
- **Testing**: FastAPI TestClient, Pydantic v2, HTTPX

---

## 📐 Architecture Diagram

```text
 ┌───────────────────────────────────────────────────────────────┐
 │                   KarigarAI React Web Portal                  │
 │   Dashboard | Add Product | Preview | My Products | Profile  │
 └───────────────────────────────┬───────────────────────────────┘
                                 │
                                 │ HTTP REST (JWT Bearer Auth)
                                 ▼
 ┌───────────────────────────────────────────────────────────────┐
 │                     FastAPI Backend API Server                │
 │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
 │  │ Auth & User API │  │  Vision AI API   │  │ Pricing API  │ │
 │  └────────┬────────┘  └────────┬─────────┘  └──────┬───────┘ │
 │           │                    │                   │         │
 │  ┌────────▼────────┐  ┌────────▼─────────┐  ┌──────▼───────┐ │
 │  │ SQLAlchemy ORM  │  │ Resend Email OTP │  │ Catalog &    │ │
 │  │ User & Product  │  │ Service          │  │ Story Engine │ │
 │  └────────┬────────┘  └──────────────────┘  └──────────────┘ │
 └───────────┼───────────────────────────────────────────────────┘
             │
 ┌───────────▼───────────────────────────────────────────────────┐
 │      Neon PostgreSQL Database (Fallback: SQLite karigarai.db) │
 └───────────────────────────────────────────────────────────────┘
```

---

## 📋 Complete REST API Documentation

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | No | Server status & health check |
| `POST` | `/register` | No | Register new artisan account |
| `POST` | `/login` | No | Authenticate credentials & receive JWT token |
| `POST` | `/forgot-password/request-otp` | No | Generate & dispatch 6-digit email OTP via Resend |
| `POST` | `/forgot-password/reset-password` | No | Verify OTP code & update password hash |
| `GET` | `/me` | **Bearer** | Retrieve authenticated artisan profile & bio |
| `PUT` | `/me` | **Bearer** | Update artisan name, WhatsApp phone (`+91`), & bio |
| `POST` | `/analyze-product` | Optional | Vision AI feature extraction from craft photo |
| `POST` | `/generate-catalog` | Optional | Generate structured catalog from artisan facts |
| `POST` | `/generate-story` | Optional | Generate cultural heritage narrative (EN & HI) |
| `POST` | `/suggest-price` | Optional | Calculate pricing tiers (min, recommended, max) |
| `POST` | `/translate` | Optional | Translate catalog fields to target language |
| `POST` | `/products` | **Bearer** | Create & persist new craft listing |
| `GET` | `/products` | **Bearer** | List all products belonging to logged-in user |
| `GET` | `/products/{id}` | **Bearer** | Fetch specific product details |
| `PUT` | `/products/{id}` | **Bearer** | Update existing product listing |
| `DELETE` | `/products/{id}` | **Bearer** | Delete product listing |

---

## ⚡ Quickstart & Installation Guide

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/bishtprateek270-hue/karigarAI.git
cd karigarAI
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate virtual environment (Linux/Mac)
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure `.env` file (`backend/.env`):
```env
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@ep-host.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=super-secret-karigarai-jwt-key-2026
RESEND_API_KEY=re_your_resend_api_key
```

#### Start FastAPI Server:
```bash
python -m uvicorn main:app --reload --port 8000
```
Swagger Documentation will be live at: **`http://localhost:8000/docs`**

---

### 3. Frontend Setup
```bash
# Open a new terminal in project root
cd frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```
React Web Application will be live at: **`http://localhost:5173`**

---

## 🧪 Testing & Automated Verification

KarigarAI includes a comprehensive **23-test automated test suite** validating authentication, user isolation, vision fallbacks, pricing logic, translation, and OTP password resets.

```bash
# Run backend test suite
cd backend
$env:PYTHONPATH="."
.\.venv\Scripts\python.exe tests/test_suite.py
```

```text
=======================================================
   ALL TESTS EXECUTED AND VERIFIED SUCCESSFULLY (100%)  
=======================================================
```

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Made with ❤️ for Indian Artisans & Craft Creators**

</div>
