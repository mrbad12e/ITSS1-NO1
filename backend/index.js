require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes/index");
const app = express();

// middleware
app.use(express.json());
// cors policy
app.use(cors());
app.options("*", cors());

//route
app.use("/v1/api", routes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log("MongoDB connect error: ", error.message));

module.exports = app;
