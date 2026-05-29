const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// JWT Generate
app.post("/api/auth/jwt", (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const token = jwt.sign(
    { email, name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Token issued" });
});

// JWT Clear
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.json({ message: "Logged out" });
});

// Seed route — deploy এর আগে remove করবে
app.post("/api/seed", async (req, res) => {
  const { MongoClient } = require("mongodb");
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("drivefleet");

  const cars = [
    {
      name: "Toyota Camry",
      type: "Sedan",
      dailyPrice: 45,
      seats: 5,
      location: "Dhaka",
      fuel: "Petrol",
      description: "A reliable and comfortable sedan perfect for city drives.",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
      available: true,
      bookingCount: 0,
      userEmail: "admin@drivefleet.com",
      createdAt: new Date(),
    },
    {
      name: "Honda CR-V",
      type: "SUV",
      dailyPrice: 65,
      seats: 7,
      location: "Chittagong",
      fuel: "Hybrid",
      description: "Spacious and fuel-efficient SUV with hybrid technology.",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
      available: true,
      bookingCount: 0,
      userEmail: "admin@drivefleet.com",
      createdAt: new Date(),
    },
    {
      name: "BMW 3 Series",
      type: "Luxury",
      dailyPrice: 120,
      seats: 5,
      location: "Dhaka",
      fuel: "Petrol",
      description: "Experience ultimate luxury and performance with this iconic BMW.",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      available: true,
      bookingCount: 0,
      userEmail: "admin@drivefleet.com",
      createdAt: new Date(),
    },
    {
      name: "Toyota Hiace",
      type: "Van",
      dailyPrice: 80,
      seats: 12,
      location: "Sylhet",
      fuel: "Diesel",
      description: "Ideal for group travel with spacious seating for up to 12 passengers.",
      image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
      available: true,
      bookingCount: 0,
      userEmail: "admin@drivefleet.com",
      createdAt: new Date(),
    },
    {
      name: "Hyundai Tucson",
      type: "SUV",
      dailyPrice: 70,
      seats: 5,
      location: "Dhaka",
      fuel: "Petrol",
      description: "Modern SUV with stylish design and advanced features.",
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      available: false,
      bookingCount: 0,
      userEmail: "admin@drivefleet.com",
      createdAt: new Date(),
    },
    {
      name: "Mercedes C-Class",
      type: "Luxury",
      dailyPrice: 150,
      seats: 5,
      location: "Dhaka",
      fuel: "Petrol",
      description: "The pinnacle of luxury motoring with superior performance.",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      available: true,
      bookingCount: 0,
      userEmail: "admin@drivefleet.com",
      createdAt: new Date(),
    },
    {
      name: "Toyota Corolla",
      type: "Sedan",
      dailyPrice: 40,
      seats: 5,
      location: "Rajshahi",
      fuel: "Petrol",
      description: "The world's best-selling car. Reliable, economical, and comfortable.",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
      available: true,
      bookingCount: 0,
      userEmail: "admin@drivefleet.com",
      createdAt: new Date(),
    },
    {
      name: "Ford Ranger",
      type: "Pickup",
      dailyPrice: 90,
      seats: 5,
      location: "Chittagong",
      fuel: "Diesel",
      description: "Tough and capable pickup truck perfect for work and adventure.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      available: true,
      bookingCount: 0,
      userEmail: "admin@drivefleet.com",
      createdAt: new Date(),
    },
  ];

  await db.collection("cars").insertMany(cars);
  await client.close();
  res.json({ message: "Seeded successfully", count: cars.length });
});

app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "DriveFleet Server is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});