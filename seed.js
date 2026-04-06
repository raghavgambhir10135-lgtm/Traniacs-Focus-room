const mongoose = require("mongoose");
const Outlet = require("./models/Outlet");

mongoose.connect("mongodb://raghavgambhir10135:14DEC2006@ac-zfe5pim-shard-00-00.tu8fqrh.mongodb.net:27017,ac-zfe5pim-shard-00-01.tu8fqrh.mongodb.net:27017,ac-zfe5pim-shard-00-02.tu8fqrh.mongodb.net:27017/cufoodoutlets?ssl=true&replicaSet=atlas-m2zgje-shard-0&authSource=admin&retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));

async function seed() {
  try {
    await Outlet.deleteMany();

    await Outlet.insertMany([
      {
        name: "Food Point",
        campus: "North",
        menu: [
          { item: "Paneer Roll", price: 80 },
          { item: "Cold Coffee", price: 50 }
        ]
      },
      {
        name: "Café Delight",
        campus: "South",
        menu: [
          { item: "Veg Burger", price: 70 },
          { item: "Iced Tea", price: 40 }
        ]
      },
      {
        name: "Campus Dhaba",
        campus: "South",
        menu: [
          { item: "Rajma Chawal", price: 100 },
          { item: "Lassi", price: 60 }
        ]
      }
    ]);

    console.log("✅ Sample outlets seeded!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
