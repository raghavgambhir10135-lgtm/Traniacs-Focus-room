const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Outlet = require("./models/Outlet");
const Order = require("./models/Order");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://raghavgambhir10135:14DEC2006@ac-zfe5pim-shard-00-00.tu8fqrh.mongodb.net:27017,ac-zfe5pim-shard-00-01.tu8fqrh.mongodb.net:27017,ac-zfe5pim-shard-00-02.tu8fqrh.mongodb.net:27017/cufoodoutlets?ssl=true&replicaSet=atlas-m2zgje-shard-0&authSource=admin&retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/outlets", async (req, res) => res.json(await Outlet.find()));
app.post("/outlets", async (req, res) => res.json(await new Outlet(req.body).save()));
app.get("/orders", async (req, res) => res.json(await Order.find()));
app.post("/orders", async (req, res) => res.json(await new Order(req.body).save()));

// Update order status
app.put("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const Review = require("./models/Review");

// Get reviews for an outlet
app.get("/outlets/:id/reviews", async (req, res) => {
  const reviews = await Review.find({ outletId: req.params.id });
  res.json(reviews);
});

// Post a new review
app.post("/outlets/:id/reviews", async (req, res) => {
  const review = new Review({ outletId: req.params.id, ...req.body });
  await review.save();
  res.json(review);
});

// Update payment status
app.put("/orders/:id/payment", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "Paid", transactionId: req.body.transactionId },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



app.listen(5000, () => console.log("Server running on port 5000"));
