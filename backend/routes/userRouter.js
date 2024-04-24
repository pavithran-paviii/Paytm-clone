const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");

const User = require("../model/userModel");
const { JWT_SECRET } = require("../assets/data/constant");
const { authMiddleware } = require("../middlewares/authorization");

const router = express.Router();

//validation

const signupSchema = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});

router.post("/signup", async (req, res) => {
  const { success } = signupSchema.safeParse(req.body);

  if (!success) {
    return res
      .status(411)
      .json({ message: "Email already taken / Incorrect inputs" });
  }

  const existingUser = await User.findOne({ username: req.body.username });

  if (existingUser?.username) {
    return res.status(411).json({ message: "User already exist!" });
  }

  const user = await User.create(req.body);

  const token = jwt.sign({ userId: user._id }, JWT_SECRET);

  return res.status(200).json({ message: "User created successfully!", token });
});

module.exports = router;
