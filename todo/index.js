const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

require("dotenv").config();

const corsOptions = {
  origin: "https://tasker-frontend-roan.vercel.app", 
  methods: ["POST", "GET", "PATCH", "DELETE"],
  credentials: true
};

const app = express();
const PORT = process.env.PORT || 7070;

app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const taskSchema = new mongoose.Schema({
  userId: String,
  title: String,
  notes: String,
  image: String,
  links: [String],
  deadline: Date,
  isStarred: Boolean,
  isCompleted: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

app.post('/tasks', async (req, res) => {
  const { userId, title, notes, image, links, deadline, isStarred, isCompleted } = req.body;
  try {
    const newTask = new Task({ userId, title, notes, image, links, deadline, isStarred, isCompleted });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/tasks/:userId', async (req, res) => {
  const { userId } = req.params;
  const { search } = req.query;
  try {
    let query = { userId };
    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const updateFields = req.body; // Allow multiple fields to be updated
  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateFields, { new: true });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    await Task.findByIdAndDelete(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
