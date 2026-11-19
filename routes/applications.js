const router = require('express').Router(), multer = require('multer'), path = require('path');
const App = require('../models/Application'), Job = require('../models/Job'), { protect, allow } = require('../middleware/auth');
const upload = multer({
  storage: multer.diskStorage({ destination: 'uploads/', filename: (r, f, cb) => cb(null, Date.now() + path.extname(f.originalname)) }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (r, f, cb) => ['.pdf', '.doc', '.docx'].includes(path.extname(f.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Only PDF/DOC/DOCX resumes allowed'))
});
router.get('/mine', protect, allow('seeker'), async (req, res) => res.json(await App.find({ seeker: req.user.id }).populate('job', 'title company location').sort('-createdAt')));
router.get('/employer', protect, allow('employer'), async (req, res) => {
  const ids = (await Job.find({ employer: req.user.id }).select('_id')).map(j => j._id);
  res.json(await App.find({ job: { $in: ids } }).populate('job', 'title').populate('seeker', 'name email').sort('-createdAt'));
});
router.post('/:jobId', protect, allow('seeker'), (req, res, next) => upload.single('resume')(req, res, e => e ? res.status(400).json({ message: e.message }) : next()), async (req, res) => {
  try {
    if (!(await Job.findById(req.params.jobId))) return res.status(404).json({ message: 'Job not found' });
    res.status(201).json(await App.create({ job: req.params.jobId, seeker: req.user.id, coverLetter: req.body.coverLetter, resume: req.file && '/uploads/' + req.file.filename }));
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? 'You already applied for this job' : e.message }); }
});
router.put('/:id/status', protect, allow('employer'), async (req, res) => {
  const a = await App.findById(req.params.id).populate('job'); if (!a) return res.status(404).json({ message: 'Not found' });
  if (String(a.job.employer) !== req.user.id) return res.status(403).json({ message: 'Not your job' });
  if (!['Pending', 'Shortlisted', 'Accepted', 'Rejected'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
  a.status = req.body.status; await a.save(); res.json(a);
});
module.exports = router;
