# 🚀 EntreSkillHub - Skill to Startup Enablement Platform

<div align="center">

**Transform Your Skills Into Successful Micro-Businesses**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://mongodb.com/)

</div>

---

## 📖 About

**EntreSkillHub** is a comprehensive full-stack MERN application designed to help aspiring entrepreneurs transform their skills into sustainable micro-businesses. The platform provides personalized business ideas, step-by-step roadmaps, expert mentorship, and learning resources.

### 🎯 Problem It Solves

- Lack of awareness of business opportunities aligned with personal skills
- No structured roadmap for starting a small business
- Limited access to training and mentorship
- Confusion around legal, financial, and operational steps

---

## ✨ Features

### 👥 For Users
- 🎯 **Skill Assessment** - Interactive multi-step quiz
- 💡 **Personalized Business Ideas** - AI-powered matching engine
- 🗺️ **Step-by-Step Roadmaps** - Detailed guides from idea to launch
- 📚 **Learning Resources** - Videos, articles, checklists, templates
- 👨‍🏫 **Expert Mentorship** - Book sessions with verified mentors
- 📊 **Progress Tracking** - Visual dashboard with achievements
- 📌 **Bookmarks** - Save favorite ideas and resources
- 🔥 **Streak System** - Gamification with daily activity tracking

### 🎓 For Mentors
- 📝 **5-step Registration** - Complete mentor onboarding
- 📅 **Availability Management** - Set your schedule
- 💰 **Pricing Control** - Set your own rates
- 📊 **Mentor Dashboard** - Track earnings, sessions, ratings
- 💬 **Q&A System** - Answer mentee questions
- ⭐ **Review System** - Build reputation

### 🛡️ For Admins
- 📊 **Full Admin Dashboard** - Platform overview & analytics
- 👥 **User Management** - Ban, verify, manage roles
- ✅ **Content Moderation** - Approve business ideas, resources, mentors
- 📧 **Bulk Notifications** - Send emails to targeted users
- 📈 **Analytics** - Track platform performance

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with refresh tokens
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer
- **Security:** Helmet, CORS, Rate Limiting, XSS protection, MongoDB sanitization

### Frontend
- **Library:** React 18
- **Routing:** React Router v6
- **Styling:** Tailwind CSS with custom design system
- **HTTP Client:** Axios
- **Icons:** React Icons
- **Notifications:** React Hot Toast
- **SEO:** React Helmet Async
- **Animations:** Framer Motion + CSS

---

## 📁 Project Structure
EntreSkillHub/
├── server/ # Backend
│ ├── config/ # DB, Cloudinary, App configs
│ ├── controllers/ # 13 controllers
│ ├── middleware/ # Auth, error, upload, rate limit
│ ├── models/ # 10 Mongoose models
│ ├── routes/ # 13 route files
│ ├── seeds/ # Database seeder
│ ├── utils/ # Email, tokens, matching engine
│ ├── validators/ # Input validation
│ └── server.js # Main server file
│
├── client/ # Frontend
│ ├── public/
│ ├── src/
│ │ ├── components/ # Reusable components
│ │ ├── context/ # Auth, Theme contexts
│ │ ├── pages/ # 20+ pages
│ │ ├── services/ # API services
│ │ ├── styles/ # Global CSS
│ │ ├── utils/ # Helpers, constants
│ │ ├── App.jsx # Router setup
│ │ └── index.js # Entry point
│ └── package.json
│
└── README.md