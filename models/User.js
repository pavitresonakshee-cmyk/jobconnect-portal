const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'employer', 'admin'], default: 'seeker' },
  company: String
}, { timestamps: true }));
