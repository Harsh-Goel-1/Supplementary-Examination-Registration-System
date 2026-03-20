const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// ── POST /api/auth/signup ───────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, roll_no, email, password } = req.body;

    if (!name || !roll_no || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate @nith.ac.in email
    if (!email.endsWith('@nith.ac.in')) {
      return res.status(400).json({ error: 'Only @nith.ac.in email addresses are allowed.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const db = req.app.get('db');

    // Check if email or roll_no already exists
    const [existing] = await db.query(
      'SELECT student_id FROM student WHERE email = ? OR roll_no = ?',
      [email, roll_no]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email or roll number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO student (name, roll_no, email, password) VALUES (?, ?, ?, ?)',
      [name, roll_no, email, hashedPassword]
    );

    req.session.studentId = result.insertId;
    req.session.studentName = name;

    res.status(201).json({ message: 'Account created successfully.', name });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = req.app.get('db');
    const [rows] = await db.query('SELECT * FROM student WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const student = rows[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.studentId = student.student_id;
    req.session.studentName = student.name;

    res.json({ message: 'Logged in successfully.', name: student.name });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/logout ───────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
});

// ── GET /api/auth/me ────────────────────────────────────────
router.get('/me', (req, res) => {
  if (!req.session.studentId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  res.json({
    studentId: req.session.studentId,
    name: req.session.studentName,
  });
});

module.exports = router;
