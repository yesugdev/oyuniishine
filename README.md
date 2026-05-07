# KidsShine — Children Showcase Platform

Хүүхэд бүрийн гайхамшгийг харуулах орчин үеийн full-stack платформ.

## 🚀 Quick Start

### Frontend (Next.js)
```bash
cd frontend
cp .env.example .env.local
npm run dev
# → http://localhost:3000
```

### Backend (Express.js)
```bash
cd backend
cp .env.example .env
# .env дотор MongoDB URI болон бусад утгыг тохируулна
npm run dev
# → http://localhost:5000
```

### Seed demo data
```bash
cd backend
npx ts-node src/services/seedData.ts
```

**Demo accounts:**
- Багш: `teacher@demo.mn` / `demo1234`
- Эцэг эх: `parent@demo.mn` / `demo1234`

---

## 📁 Project Structure

```
children-showcase/
├── frontend/          # Next.js 15 + TypeScript + TailwindCSS
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── showcase/page.tsx     # Student grid
│   │   ├── students/[id]/page.tsx # Student detail
│   │   ├── gallery/page.tsx      # Photo gallery
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── dashboard/
│   │       ├── teacher/page.tsx  # Teacher dashboard
│   │       └── parent/page.tsx   # Parent portal
│   ├── components/
│   │   ├── ui/                   # Shared UI components
│   │   ├── student/              # Student-specific components
│   │   └── landing/              # Landing page sections
│   ├── lib/                      # API client, auth store, utils
│   └── types/                    # TypeScript interfaces
│
└── backend/           # Express.js + TypeScript + MongoDB
    └── src/
        ├── models/               # User, Student schemas
        ├── controllers/          # Business logic
        ├── routes/               # API routes
        ├── middleware/           # JWT auth, role guard
        └── services/             # Cloudinary, seed data
```

---

## 🌐 Pages

| URL | Description |
|-----|-------------|
| `/` | Landing page — hero, stats, featured students |
| `/showcase` | Student showcase grid with search & filter |
| `/students/[id]` | Full student profile with tabs |
| `/gallery` | Photo gallery with lightbox |
| `/login` | Login page |
| `/register` | Register page |
| `/dashboard/teacher` | Teacher dashboard — manage students |
| `/dashboard/parent` | Parent portal — child's profile & growth |

---

## 🔌 API Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET    /api/students          # Public student list
GET    /api/students/my       # Teacher's students (auth)
GET    /api/students/:id      # Student detail
POST   /api/students          # Create (teacher)
PUT    /api/students/:id      # Update (teacher)
DELETE /api/students/:id      # Delete (teacher/admin)

POST   /api/students/:id/photos      # Upload photo
DELETE /api/students/:id/photos/:pid # Delete photo
POST   /api/students/:id/react       # React (heart/star/smile/clap)

GET  /api/health
```

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
vercel --prod
# Environment variables:
# NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render
Environment variables needed:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super-secret-key
FRONTEND_URL=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Database → MongoDB Atlas
- Free M0 cluster эхлэх
- IP whitelist: Render server IP нэмэх
- Connection string: `MONGODB_URI` дотор нэмэх

---

## 🎨 Design System

- **Primary**: Warm orange (`#FF7A3D`)
- **Secondary**: Sky blue (`#0EA5E9`)
- **Accent**: Lavender (`#8B5CF6`)
- **Font**: Nunito (rounded, child-friendly)
- **Animations**: Framer Motion
- **Icons/Emojis**: Native Unicode

---

## ✨ Key Features

- 🌟 Beautiful student profile pages with animations
- 📸 Photo gallery with lightbox
- 🏆 Achievement tracking system
- 📅 Growth timeline
- 💬 Teacher & parent messages
- 🤖 AI-generated strengths section
- ❤️ Reaction system (heart, star, smile, clap)
- 🔐 JWT auth with role-based access
- 📱 Fully responsive design
- 🎨 Floating particle animations
