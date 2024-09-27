const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Importing models
const { lessonexp, userexp } = require('./schema');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret Key (replace this with your securely generated key)
const JWT_SECRET = process.env.JWT_SECRET ;

// Routes placeholder
app.get('/', (req, res) => {
  res.send('Big Bear Backend is Running');
});

// Start the server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await userexp.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password with bcrypt
    const salt = await bcrypt.genSalt(10); // 10 rounds of salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const newUser = new userexp({
      name,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: 'User already exists', error });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await userexp.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password matches hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return token and user data
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lessons: user.lessons
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
  }
});

// Get all users (Protected Route)
app.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await userexp.find(); // Fetch all users
    res.status(200).json(users); // Return users as JSON
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user to the request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}
// Update progress route
app.post('/update-progress', async (req, res) => {
  const { teacherId, level, book, lesson, type } = req.body;

  try {
    // Find teacher by ID
    const teacher = await userexp.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update lesson progress
    const updatedLessons = teacher.lessons.map(lessonItem => {
      if (lessonItem.level === level && lessonItem.book === book && lessonItem.lesson === lesson) {
        if (type === 'interactive') {
          return { ...lessonItem, completedInteractive: true };
        } else if (type === 'game') {
          return { ...lessonItem, completedGame: true };
        }
      }
      return lessonItem;
    });

    // Save updated lessons back to the database
    teacher.lessons = updatedLessons;
    await teacher.save();

    res.status(200).json({ message: 'Progress updated successfully', lessons: teacher.lessons });
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress', error });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
