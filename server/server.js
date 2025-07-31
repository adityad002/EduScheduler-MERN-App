const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables BEFORE anything else
dotenv.config();

// Import routes after dotenv has been configured
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const timetableRoutes = require('./routes/timetableRoutes');

const app = express();

// CRITICAL: Middleware for parsing JSON must come before API routes
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/timetable', timetableRoutes);

// DB Connection
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB!");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Connection error", err);
    process.exit(1);
  });

