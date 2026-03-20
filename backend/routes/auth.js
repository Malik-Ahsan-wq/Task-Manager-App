const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  if (await User.findOne({ email }))
    return res.status(409).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 8);
  const user = await User.create({ name, email, password: hashed });

  res.status(201).json({ message: "User registered successfully", userId: user._id });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

router.get("/profile", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
 res.json(user);
});

module.exports = router;
