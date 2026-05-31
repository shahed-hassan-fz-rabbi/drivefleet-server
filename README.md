# DriveFleet Server

Express.js + MongoDB backend for the DriveFleet car rental platform.

## 🌐 Live Server

**https://drivefleet-server-iy4v.onrender.com**

## ✨ Features

- JWT authentication with HTTPOnly cookies and Bearer token support
- Cars CRUD API with search and filter using $regex operator
- Booking system with $inc for booking count tracking
- Protected routes with JWT middleware
- CORS configured for Vercel deployment
- Ping endpoint for Render keep-alive via cron-job.org

## 🛠️ Tech Stack

- Node.js, Express.js
- MongoDB Native Driver
- JWT, Cookie Parser, CORS, dotenv

## 🚀 Getting Started

```bash
npm install
npm run dev
```

## 🔑 Environment Variables

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://drivefleet-nine.vercel.app
NODE_ENV=production
PORT=5000
```

## 📡 API Routes

**Auth**

```
POST /api/auth/jwt
POST /api/auth/logout
```

**Cars**

```
GET    /api/cars
GET    /api/cars/my
GET    /api/cars/:id
POST   /api/cars
PUT    /api/cars/:id
DELETE /api/cars/:id
```

**Bookings**

```
GET    /api/bookings/my
POST   /api/bookings
DELETE /api/bookings/:id
```

## 👨‍💻 Developer

**Shahed Hassan FZ Rabbi**
GitHub: https://github.com/shahed-hassan-fz-rabbi