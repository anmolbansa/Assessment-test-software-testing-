const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'your_jwt_secret_key_here';

// In-Memory Database (Demo ke liye, real app me MongoDB use karein)
const users = [];
const tasks = [];

// Middleware: Authentication Verify Karne Ke Liye
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// ================= USER ROUTES =================

// 1. User Registration
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), email, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully' });
});

// 2. User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token, user: { id: user.id, email: user.email } });
});

// ================= TASK CRUD ROUTES =================

// 3. Create Task
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Task title is required' });
  }

  const newTask = {
    id: Date.now().toString(),
    userId: req.user.userId,
    title,
    description: description || '',
    createdAt: new Date(),
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 4. View Task List (Read)
app.get('/api/tasks', authenticateToken, (req, res) => {
  const userTasks = tasks.filter((t) => t.userId === req.user.userId);
  res.json(userTasks);
});

// 5. Edit/Update Task
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const task = tasks.find((t) => t.id === id && t.userId === req.user.userId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;

  res.json(task);
});

// 6. Delete Task
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id && t.userId === req.user.userId);

  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.json({ message: 'Task deleted successfully' });
});

// Server Start
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));