require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Health Check Endpoint (useful for Render deployment and monitoring)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'JobConnect API is running successfully',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/validation', require('./routes/validation'));
app.use('/api/admin', require('./routes/admin'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Port and MongoDB Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobconnect';

// Connect to MongoDB and Start Server
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');

    // Seed default admin account if not already present
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@jobconnect.com',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10),
        role: 'admin'
      });
      console.log('Default admin account initialized (admin@jobconnect.com)');
    }

    app.listen(PORT, () => {
      console.log(`JobConnect server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
