const express = require("express");
const app = express();
require("dotenv").config();

//middlewares
app.use(express.json());

const mainRouter = require("./routes/index");
const mongoDBConnect = require("./config/mongoConnect");

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Server is up & running!" });
});

app.use("/api/v1", mainRouter);

app.listen(5000, () => {
  console.log("listening on port 5000!");
  mongoDBConnect();
});
