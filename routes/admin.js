const router = require('express').Router(), User = require('../models/User'), Job = require('../models/Job'), App = require('../models/Application');
const { protect, allow } = require('../middleware/auth'); router.use(protect, allow('admin'));
router.get('/stats', async (req, res) => res.json({
  users: await User.countDocuments({ role: 'seeker' }), employers: await User.countDocuments({ role: 'employer' }),
  jobs: await Job.countDocuments(), applications: await App.countDocuments(),
  recentJobs: await Job.find().sort('-createdAt').limit(5).select('title company createdAt'),
  recentUsers: await User.find().sort('-createdAt').limit(5).select('name role createdAt')
}));
router.get('/users', async (req, res) => res.json(await User.find().select('-password').sort('-createdAt')));
router.delete('/users/:id', async (req, res) => {
  const u = await User.findById(req.params.id); if (!u || u.role === 'admin') return res.status(400).json({ message: 'Cannot delete this user' });
  await Job.deleteMany({ employer: u._id }); await App.deleteMany({ seeker: u._id }); await u.deleteOne(); res.json({ message: 'User deleted' });
});
module.exports = router;
