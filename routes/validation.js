const router = require('express').Router();
const ValidationSubmission = require('../models/ValidationSubmission');

// Practical 2: server-side validation demonstration.
router.post('/applications', async (req, res) => {
  try {
    const body = req.body || {};
    const values = {
      fullName: typeof body.fullName === 'string' ? body.fullName.trim() : '',
      email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
      phone: typeof body.phone === 'string' ? body.phone.trim() : '',
      jobRole: typeof body.jobRole === 'string' ? body.jobRole.trim() : '',
      experience: body.experience === '' || body.experience === undefined ? NaN : Number(body.experience),
      skills: typeof body.skills === 'string' ? body.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      coverLetter: typeof body.coverLetter === 'string' ? body.coverLetter.trim() : ''
    };

    const errors = {};
    if (values.fullName.length < 2 || values.fullName.length > 60) errors.fullName = 'Name must contain 2 to 60 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email) || values.email.length > 120) errors.email = 'Enter a valid email address.';
    if (!/^\d{10}$/.test(values.phone)) errors.phone = 'Phone number must contain exactly 10 digits.';
    if (!values.jobRole || values.jobRole.length > 80) errors.jobRole = 'Please enter a job role (maximum 80 characters).';
    if (!Number.isFinite(values.experience) || values.experience < 0 || values.experience > 50) errors.experience = 'Experience must be a number between 0 and 50.';
    if (values.skills.length === 0 || values.skills.some(s => s.length > 40)) errors.skills = 'Enter at least one skill; each skill must be 40 characters or fewer.';
    if (values.coverLetter.length < 20 || values.coverLetter.length > 1000) errors.coverLetter = 'Cover letter must contain 20 to 1000 characters.';

    if (Object.keys(errors).length) {
      return res.status(422).json({ success: false, message: 'Please correct the highlighted fields.', errors });
    }

    const saved = await ValidationSubmission.create(values);
    return res.status(201).json({
      success: true,
      message: 'Application details passed server-side validation and were saved in MongoDB.',
      application: { id: saved._id, fullName: saved.fullName, email: saved.email, jobRole: saved.jobRole, createdAt: saved.createdAt }
    });
  } catch (error) {
    console.error('Validation practical error:', error);
    return res.status(500).json({ success: false, message: 'Server error while saving the application.' });
  }
});

// Used to verify saved valid submissions during the practical demonstration.
router.get('/applications', async (req, res) => {
  try {
    const records = await ValidationSubmission.find().sort({ createdAt: -1 }).limit(20).select('-__v');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Could not retrieve validation submissions.' });
  }
});

module.exports = router;
