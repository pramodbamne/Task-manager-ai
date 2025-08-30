# AI-Powered Full-Stack Task Manager

This is a complete Next.js application featuring user authentication, task management, a password reset flow with OTP, and an AI-powered chatbot for managing tasks via natural language.

## Features

- **Full-Stack with Next.js App Router:** Frontend and backend in one place.
- **Secure User Authentication:** Using NextAuth.js for credentials-based login.
- **Complete Task Management:** CRUD (Create, Read, Update, Delete) operations for user-specific tasks.
- **Password Reset:** Secure OTP generation with Redis and email delivery via Resend.
- **AI Chatbot:** Integrated OpenAI's GPT model to manage tasks using commands like "Add a task to do laundry tomorrow at 5pm".
- **Modern UI:** Built with the beautiful and accessible `shadcn/ui` components.
- **ORM & Database:** Prisma with a PostgreSQL database hosted on Neon.
- **Deployment Ready:** Configured for easy, free deployment on Vercel.

---

## ⚙️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React, Tailwind CSS, shadcn/ui
- **Authentication:** NextAuth.js
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **In-memory Store:** Redis (Upstash) for OTPs
- **Email Service:** Resend
- **AI:** OpenAI (ChatGPT)
