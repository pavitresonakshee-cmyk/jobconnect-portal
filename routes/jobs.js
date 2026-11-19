const router = require('express').Router();
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, allow } = require('../middleware/auth');

// Helper to escape regex special characters for safe search
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ==========================================
// 1. READ ALL JOBS – GET /api/jobs
// ==========================================
// Retrieve all available job records from MongoDB (with optional keyword/location filters)
router.get('/', async (req, res) => {
  try {
    const { q, location, type } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: regex }, { company: regex }, { description: regex }];
    }
    if (location) {
      filter.location = new RegExp(escapeRegex(location), 'i');
    }
    if (type) {
      filter.type = type;
    }

    const jobs = await Job.find(filter).sort('-createdAt');
    return res.status(200).json(jobs);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve jobs',
      error: error.message
    });
  }
});

// ==========================================
// READ EMPLOYER'S JOBS – GET /api/jobs/mine
// ==========================================
// Keep existing functionality for employer dashboard
router.get('/mine', protect, allow('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort('-createdAt');
    return res.status(200).json(jobs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 2. READ SINGLE JOB BY ID – GET /api/jobs/:id
// ==========================================
// Retrieve a particular job using its MongoDB ID
router.get('/:id', async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid MongoDB Job ID format' });
    }

    const job = await Job.findById(req.params.id).populate('employer', 'name email company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json(job);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve job details',
      error: error.message
    });
  }
});

// ==========================================
// 3. CREATE JOB – POST /api/jobs
// ==========================================
// Add a new job record to MongoDB
router.post('/', protect, allow('employer', 'admin'), async (req, res) => {
  try {
    const { title, company, location, salary, description } = req.body;
    // Support both 'jobType' (from Practical 5 specification) and 'type' (from existing schema)
    const type = req.body.jobType || req.body.type || 'Full-time';

    // Validate required fields
    if (!title || !company || !location || !description) {
      return res.status(400).json({
        message: 'Missing required fields. Please provide title, company, location, and description.'
      });
    }

    const newJob = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      salary: salary ? salary.trim() : 'Not disclosed',
      description: description.trim(),
      employer: req.user.id
    });

    return res.status(201).json(newJob);
  } catch (error) {
    return res.status(400).json({
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// ==========================================
// 4. UPDATE JOB – PUT /api/jobs/:id
// ==========================================
// Update the details of an existing job
router.put('/:id', protect, allow('employer', 'admin'), async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid MongoDB Job ID format' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Role check: Only the job creator or an admin can update
    if (req.user.role !== 'admin' && String(job.employer) !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied: You can only update jobs posted by your account'
      });
    }

    // Safely update only fields provided in the request body
    if (req.body.title !== undefined) job.title = req.body.title.trim();
    if (req.body.company !== undefined) job.company = req.body.company.trim();
    if (req.body.location !== undefined) job.location = req.body.location.trim();
    if (req.body.salary !== undefined) job.salary = req.body.salary.trim();
    if (req.body.description !== undefined) job.description = req.body.description.trim();

    if (req.body.jobType !== undefined) {
      job.type = req.body.jobType;
    } else if (req.body.type !== undefined) {
      job.type = req.body.type;
    }

    const updatedJob = await job.save();
    return res.status(200).json(updatedJob);
  } catch (error) {
    return res.status(400).json({
      message: 'Failed to update job',
      error: error.message
    });
  }
});

// ==========================================
// 5. DELETE JOB – DELETE /api/jobs/:id
// ==========================================
// Remove an existing job from MongoDB
router.delete('/:id', protect, allow('employer', 'admin'), async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid MongoDB Job ID format' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Role check: Only the job creator or an admin can delete
    if (req.user.role !== 'admin' && String(job.employer) !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied: You can only delete jobs posted by your account'
      });
    }

    const deletedId = job._id;
    await job.deleteOne();
    // Cascade delete any applications associated with this job
    await Application.deleteMany({ job: deletedId });

    return res.status(200).json({
      message: 'Job deleted successfully',
      deletedJobId: deletedId
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete job',
      error: error.message
    });
  }
});

module.exports = router;
