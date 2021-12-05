const express = require("express");
const mongoose = require("mongoose");

const categoryRoutes = require("./routes/categoryRoute");

const app = express();

app.use(express.json());

app.use("/category", categoryRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

mongoose
  .connect("mongodb://localhost:27017/category-api-1")
  .then(() => {
    console.log("Database connection established");
    app.listen(5000, () => console.log("Server Started"));
  })
  .catch((err) => {
    console.log(err);
  });
