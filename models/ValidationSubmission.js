const mongoose = require('mongoose');

const validationSubmissionSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
  phone: { type: String, required: true, trim: true },
  jobRole: { type: String, required: true, trim: true, maxlength: 80 },
  experience: { type: Number, required: true, min: 0, max: 50 },
  skills: { type: [String], required: true },
  coverLetter: { type: String, required: true, trim: true, minlength: 20, maxlength: 1000 }
}, { timestamps: true });

module.exports = mongoose.model('ValidationSubmission', validationSubmissionSchema);
