const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://" +
      process.env.DB_USER_PASS +
      "@cluster0.lrtcfua.mongodb.net/easytour"
  )
  .then(() => console.log("connected to mongoDB"))
  .catch((err) => console.log("Failed to connect to mongoDB", err));
