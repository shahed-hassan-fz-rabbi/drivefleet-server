const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

let db;

const getDB = async () => {
  if (db) return db;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db("drivefleet");
  return db;
};

// POST create booking (private)
router.post("/", verifyToken, async (req, res) => {
  try {
    const db = await getDB();
    const { carId, driverNeeded, specialNote, totalPrice } = req.body;

    const car = await db
      .collection("cars")
      .findOne({ _id: new ObjectId(carId) });

    if (!car) return res.status(404).json({ message: "Car not found" });
    if (!car.available) {
      return res.status(400).json({ message: "Car is not available" });
    }

    const booking = {
      carId: new ObjectId(carId),
      carName: car.name,
      carImage: car.image,
      carType: car.type,
      dailyPrice: car.dailyPrice,
      totalPrice,
      location: car.location,
      driverNeeded,
      specialNote,
      userEmail: req.user.email,
      bookingDate: new Date(),
      status: "confirmed",
    };

    await db.collection("bookings").insertOne(booking);

    // booking count বাড়াও ($inc)
    await db.collection("cars").updateOne(
      { _id: new ObjectId(carId) },
      { $inc: { bookingCount: 1 } }
    );

    res.status(201).json({ message: "Booking confirmed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET my bookings (private)
router.get("/my", verifyToken, async (req, res) => {
  try {
    const db = await getDB();
    const bookings = await db
      .collection("bookings")
      .find({ userEmail: req.user.email })
      .sort({ bookingDate: -1 })
      .toArray();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE cancel booking (private)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const db = await getDB();
    const result = await db.collection("bookings").deleteOne({
      _id: new ObjectId(req.params.id),
      userEmail: req.user.email,
    });

    if (result.deletedCount === 0) {
      return res.status(403).json({ message: "Forbidden or booking not found" });
    }

    res.json({ message: "Booking cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;