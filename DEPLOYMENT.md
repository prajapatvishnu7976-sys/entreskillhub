# 🚀 EntreSkillHub - Deployment Guide

Complete guide to deploy EntreSkillHub to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables ready
- [ ] MongoDB Atlas cluster created
- [ ] Cloudinary account (optional)
- [ ] Gmail App Password (for emails)
- [ ] Domain name (optional)
- [ ] SSL certificate (auto with Vercel/Netlify)

---

## 🗄️ Database Setup (MongoDB Atlas)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **FREE** cluster (M0)
3. Create database user:
   - Username: `entreskillhub`
   - Password: (strong password)
4. Add IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string: