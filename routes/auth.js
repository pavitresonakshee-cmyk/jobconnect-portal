const router = require('express').Router(), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const User = require('../models/User');
const sign = u => jwt.sign({ id: u._id, role: u.role, name: u.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and password (min 6 chars) required' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'Email already registered' });
    const u = await User.create({ name, email, company, role: role === 'employer' ? 'employer' : 'seeker', password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(u), user: { id: u._id, name: u.name, role: u.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
router.post('/login', async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(400).json({ message: 'Invalid email or password' });
  res.json({ token: sign(u), user: { id: u._id, name: u.name, role: u.role } });
});
module.exports = router;
