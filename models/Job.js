const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract', 'Full Time', 'Part Time'],
      message: '{VALUE} is not a valid job type'
    },
    default: 'Full-time'
  },
  salary: {
    type: String,
    default: 'Not disclosed',
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Alias jobType to type so requests/responses using either jobType or type work seamlessly
jobSchema.virtual('jobType')
  .get(function() {
    return this.type;
  })
  .set(function(v) {
    this.type = v;
  });

module.exports = mongoose.model('Job', jobSchema);
