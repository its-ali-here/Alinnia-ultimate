# Alinnia

**Alinnia** is a SaaS business intelligence web application designed to help **SMEs make better financial and operational decisions** by transforming raw organisational data into actionable insights.

The platform connects directly to organisational data sources (primarily spreadsheets such as Excel/Sheets), visualises them through dashboards and KPIs, and augments decision-making with **AI-driven recommendations** and **market context**.

---

## 🚀 What Alinnia Does

Alinnia helps SMEs **make or save money** by:

- Centralising business data in one place  
- Turning spreadsheets into live dashboards  
- Tracking key performance indicators (KPIs)  
- Providing AI-based recommendations on next actions  
- Incorporating relevant market news into insights  

This allows non-technical business owners and managers to move from *data collection* to *decision execution* faster.

---

## 🧠 Core Features

### Current / In Progress
- Organisation-based accounts (paid SaaS model)
- Data ingestion from spreadsheets (Excel / Sheets-style data)
- Dashboard visualisation
- KPI tracking
- Authentication via Supabase
- AI integration using Groq AI (early stage)

### Planned
- Advanced AI decision recommendations
- Context-aware insights using market news
- Custom KPI definitions per organisation
- Alerts & notifications
- Forecasting & trend analysis
- Role-based access control (RBAC)

---

## 🏗️ Tech Stack

### Frontend
- Next.js
- React

### Backend & Services
- Supabase
  - Authentication
  - Database
  - Row-level security (RLS)
- Groq AI (decision intelligence & recommendations)

### Hosting & DevOps
- Vercel (deployment & hosting)
- GitHub (version control & CI integration)

---

## 🔐 Authentication

- Managed entirely via **Supabase Auth**
- Organisation-scoped access
- Session handling via Supabase client

---

## 📁 Project Status

⚠️ **Under active development**

This project is evolving rapidly. APIs, schemas, and feature scope may change without notice.

---

## 🧑‍💻 Internal Development Notes

- This README is intended for the **internal Alinnia team**
- No public API guarantees yet
- No legal, licensing, or compliance framework defined at this stage
- Environment variables and secrets are managed locally and on Vercel

---

## 🧩 Environment Variables (To Be Expanded)

Expected (subject to change):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`

A `.env.example` file will be added later.

---

## 🗺️ Vision

Alinnia aims to become a **decision-intelligence layer for SMEs**, combining:

- Internal organisational data  
- External market signals  
- AI-powered reasoning  

All focused on **practical, money-impacting decisions**, not just analytics.

---

## 📌 Notes

- No license defined yet  
- No public documentation yet  
- Internal use only  