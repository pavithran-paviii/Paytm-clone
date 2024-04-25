const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//middleware
const authMiddleware = require("../middlewares/authorization");

const User = require("../model/userModel");
const { JWT_SECRET } = require("../assets/data/constant");

const router = express.Router();

//validation

const signupSchema = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});

const signinSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

const userUpdateSchema = zod
  .object({
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    password: zod.string().optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Object cannot be empty",
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

  const user = await User.create({
    ...req.body,
    password: await bcrypt.hash(req.body.password, 8),
  });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET);

  return res.status(200).json({ message: "User created successfully!", token });
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  //schema validation
  const { success } = signinSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ message: "Invalid username/password!" });
  }

  //check if user exist
  const user = await User.findOne({ username });
  if (!user?.username) {
    return res.status(400).json({ message: "Invalid username/password!" });
  }

  //compare hashed password
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    return res.status(400).json({ message: "Invalid username/password!" });
  }

  //token
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);

  return res.status(200).json({
    message: "Login successful!",
    data: {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    },
  });
});

router.put("/", authMiddleware, async (req, res) => {
  const { success } = userUpdateSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ message: "Cannot update the user data!" });
  }
  // find user & update

  if (req.body?.password) {
    await User.findByIdAndUpdate(req.userId, {
      ...req?.body,
      password: await bcrypt.hash(req.body?.password,8),
    });
  } else {
    await User.findByIdAndUpdate(req.userId, req.body);
  }

  return res.status(200).json({ message: "User updated successfully!" });
});

module.exports = router;
