require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000'
})); // Apply CORS middleware

// Parse JSON bodies
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/MY-REACTAPP')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String // Changed password field to string
});

const User = mongoose.model('User', userSchema);

// Sign-up endpoint
app.post('/signup', async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password // Save password as plain text
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while signing up' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Check if passwords match (no hashing)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});