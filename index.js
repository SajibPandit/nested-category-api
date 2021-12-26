const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const categoryRoutes = require("./routes/categoryRoute");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/category", categoryRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

mongoose
  .connect(
    "mongodb+srv://sajib:pandit@category.os1bl.mongodb.net/category-api?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Database connection established");
    app.listen(5000, (res) => console.log("Server Started"));
  })
  .catch((err) => {
    console.log(err);
  });
