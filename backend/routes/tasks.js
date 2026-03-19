const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

router.use(auth);

// List all tasks for logged-in user — with filtering, sorting & pagination
router.get("/", async (req, res) => {
  const { status, priority, search, sortByDue, page = 1, limit = 10 } = req.query;

  const filter = { createdBy: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: search, $options: "i" };

  const sort = sortByDue === "asc" ? { dueDate: 1 } : sortByDue === "desc" ? { dueDate: -1 } : { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Task.countDocuments(filter),
  ]);

  res.json({ tasks, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

// Create task
router.post("/", async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });
  const task = await Task.create({ title, description, status, priority, dueDate, createdBy: req.user.id });
  res.status(201).json(task);
});

// Edit task
router.put("/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// Mark as completed
router.patch("/:id/complete", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    { status: "Completed" },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// Delete task
router.delete("/:id", async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task deleted" });
});

module.exports = router;
