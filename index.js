const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors')

const categoryRoutes = require("./routes/categoryRoute");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/category", categoryRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

mongoose
  .connect("mongodb://localhost:27017/category-api-1")
  .then(() => {
    console.log("Database connection established");
    app.listen(5000, (res) => console.log("Server Started"));
  })
  .catch((err) => {
    console.log(err);
  });
