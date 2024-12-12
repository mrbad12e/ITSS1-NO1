require("dotenv").config();
const userModel = require("./models/user.model");
const mongoose = require("mongoose");
const { app } = require("./index");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log("MongoDB connect error: ", error.message));

const users = [
  {
    name: "test1",
    email: "test1@gmail.com",
    password: "123456",
  },
  {
    name: "test2",
    email: "test2@gmail.com",
    password: "123456",
  },
  {
    name: "test3",
    email: "test3@gmail.com",
    password: "123456",
  },
];

const importData = async () => {
  try {
    await userModel.deleteMany();
    const createdUser = await userModel.insertMany(users);
  } catch (error) {
    console.error(error);
  }
};

importData();
