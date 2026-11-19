const mongoose = require('mongoose');
const s = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: String, resume: String,
  status: { type: String, enum: ['Pending', 'Shortlisted', 'Accepted', 'Rejected'], default: 'Pending' }
}, { timestamps: true });
s.index({ job: 1, seeker: 1 }, { unique: true });   // one application per job
module.exports = mongoose.model('Application', s);
