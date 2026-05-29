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



// GET all cars (public) — search + filter support
router.get("/", async (req, res) => {
  try {
    const db = await getDB();

    const { search, type } = req.query;

    let query = {};

    // Search by name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by type
    if (type && type !== "All") {
      query.type = type;
    }

    const cars = await db
      .collection("cars")
      .find(query)
      .toArray();

    res.json(cars);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});



// GET my cars (private)
router.get("/my", verifyToken, async (req, res) => {
  try {
    const db = await getDB();

    const cars = await db
      .collection("cars")
      .find({
        userEmail: req.user.email,
      })
      .toArray();

    res.json(cars);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});



// GET single car (public)
router.get("/:id", async (req, res) => {
  try {
    const db = await getDB();

    const car = await db
      .collection("cars")
      .findOne({
        _id: new ObjectId(req.params.id),
      });

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    res.json(car);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});



// POST add car (private)
router.post("/", verifyToken, async (req, res) => {
  try {
    const db = await getDB();

    const car = {
      ...req.body,
      userEmail: req.user.email,
      bookingCount: 0,
      createdAt: new Date(),
    };

    const result = await db
      .collection("cars")
      .insertOne(car);

    res.status(201).json({
      message: "Car added",
      id: result.insertedId,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});



// PUT update car (private)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const db = await getDB();

    const {
      name,
      dailyPrice,
      type,
      image,
      seats,
      location,
      description,
      available,
      fuel,
    } = req.body;

    const result = await db
      .collection("cars")
      .updateOne(
        {
          _id: new ObjectId(req.params.id),
          userEmail: req.user.email,
        },
        {
          $set: {
            name,
            dailyPrice: Number(dailyPrice),
            type,
            image,
            seats: Number(seats),
            location,
            description,
            available,
            fuel,
            updatedAt: new Date(),
          },
        }
      );

    if (result.matchedCount === 0) {
      return res.status(403).json({
        message: "Forbidden or car not found",
      });
    }

    res.json({
      message: "Car updated",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});



// DELETE car (private)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const db = await getDB();

    const result = await db
      .collection("cars")
      .deleteOne({
        _id: new ObjectId(req.params.id),
        userEmail: req.user.email,
      });

    if (result.deletedCount === 0) {
      return res.status(403).json({
        message: "Forbidden or car not found",
      });
    }

    res.json({
      message: "Car deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});



module.exports = router;