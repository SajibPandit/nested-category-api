const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const categoryRoutes = require("./routes/categoryRoute");
const {allCategories} = require('./controllers/category')

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/category", categoryRoutes);
app.get("/api/all-category", allCategories);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connection established");
    app.listen(process.env.PORT, (res) => console.log("Server Started"));
  })
  .catch((err) => {
    console.log(err);
  });
