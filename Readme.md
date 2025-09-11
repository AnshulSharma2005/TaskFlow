# TaskFlow - Task Management Application

## Overview  
TaskFlow is a modern task management application built with **React**, **TypeScript**, and **Express.js**.  
It provides users with a dashboard to create, manage, and track tasks, featuring categorization, priority levels, due dates, completion tracking, and real-time task statistics.  
Authentication is handled via Firebase, and the app is fully responsive for both desktop and mobile users.  

---

## ✨ Features  
- User authentication with Firebase (Google OAuth & Email/Password)  
- Create, update, delete, and track tasks  
- Categorization (Work, Personal, Shopping, Health)  
- Priority levels: Low, Medium, High  
- Due dates & completion tracking  
- Real-time statistics dashboard  
- Responsive UI with smooth navigation  

---

## 🏗️ System Architecture  

### Frontend  
- **Framework:** React 18 + TypeScript (Vite for tooling)  
- **UI Components:** Radix UI + shadcn/ui  
- **Styling:** Tailwind CSS with CSS variables  
- **State Management:** React Context (auth), React Query (server state)  
- **Routing:** Wouter (lightweight client-side routing)  
- **Forms & Validation:** React Hook Form + Zod  

### Backend  
- **Runtime:** Node.js + Express.js  
- **Language:** TypeScript (ES modules)  
- **Database:** PostgreSQL with Drizzle ORM (via Neon DB)  
- **API Design:** RESTful `/api/*` routes  
- **Authentication:** Firebase Auth with Firestore integration  

---

## 🗂️ Data Models  

### Task  
- `title` (string)  
- `description` (string)  
- `category` (Work, Personal, Shopping, Health)  
- `priority` (Low, Medium, High)  
- `dueDate` (date)  
- `completed` (boolean)  

### User  
- `email`  
- `displayName`  
- `photoURL`  
- `createdAt`  

Validation handled with **Zod** schemas.  

---

## ⚙️ Development Environment  
- **Bundler:** Vite (frontend), ESBuild (backend)  
- **ORM & Migrations:** Drizzle ORM + Drizzle Kit  
- **Error Handling:** Centralized error boundaries, runtime overlays  
- **Code Quality:** Strict TypeScript checking  

---

## 📦 External Dependencies  
- **Database:** Neon (PostgreSQL)  
- **Authentication:** Firebase Auth + Firestore  
- **UI Libraries:** Radix UI, shadcn/ui, Lucide React, FontAwesome  
- **Utilities:** date-fns, clsx, Class Variance Authority  
- **Fonts:** Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter  

---

## 🚀 Deployment  
- Backend deployable to any Node.js hosting provider  
- Frontend bundled with Vite for optimized builds  
- Designed for serverless-friendly platforms  

---

## 📌 Getting Started  

```bash
# Clone the repo
git clone https://github.com/AnshulSharma2005/TaskFlow.git

cd TaskFlow

# Install dependencies
npm install

# Run development server
npm run dev
