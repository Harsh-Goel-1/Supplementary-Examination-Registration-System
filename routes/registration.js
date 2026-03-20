const express = require('express');
const router = express.Router();

// ── Auth middleware ─────────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session.studentId) {
    return res.status(401).json({ error: 'Please log in first.' });
  }
  next();
}

// ── GET /api/courses ────────────────────────────────────────
router.get('/courses', requireAuth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const [courses] = await db.query('SELECT course_id, course_code, course_name FROM course ORDER BY course_code');
    res.json(courses);
  } catch (err) {
    console.error('Courses error:', err);
    res.status(500).json({ error: 'Failed to load courses.' });
  }
});

// ── POST /api/register ─────────────────────────────────────
router.post('/register', requireAuth, async (req, res) => {
  const db = req.app.get('db');
  const studentId = req.session.studentId;
  const { course_id, transaction_id } = req.body;

  if (!course_id || !transaction_id) {
    return res.status(400).json({ error: 'Course and SBI Collect Transaction ID are required.' });
  }

  const trimmedTxn = transaction_id.trim();
  if (trimmedTxn.length < 5) {
    return res.status(400).json({ error: 'Please enter a valid transaction ID.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check for duplicate registration for same course
    const [dup] = await connection.query(
      'SELECT reg_id FROM registration WHERE student_id = ? AND course_id = ?',
      [studentId, course_id]
    );
    if (dup.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ error: 'You have already registered for this course.' });
    }

    // Check for duplicate transaction ID
    const [txnDup] = await connection.query(
      'SELECT payment_id FROM payment WHERE transaction_id = ?',
      [trimmedTxn]
    );
    if (txnDup.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ error: 'This transaction ID has already been used.' });
    }

    // Insert registration
    const [regResult] = await connection.query(
      'INSERT INTO registration (student_id, course_id) VALUES (?, ?)',
      [studentId, course_id]
    );
    const regId = regResult.insertId;

    // Insert payment
    await connection.query(
      'INSERT INTO payment (reg_id, transaction_id, amount) VALUES (?, ?, 500.00)',
      [regId, trimmedTxn]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'Registration submitted successfully!' });
  } catch (err) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── GET /api/my-registrations ───────────────────────────────
router.get('/my-registrations', requireAuth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const [rows] = await db.query(
      `SELECT r.reg_id, c.course_code, c.course_name, r.status, 
              p.transaction_id, p.amount, r.applied_at
       FROM registration r
       JOIN course c ON r.course_id = c.course_id
       LEFT JOIN payment p ON r.reg_id = p.reg_id
       WHERE r.student_id = ?
       ORDER BY r.applied_at DESC`,
      [req.session.studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('My-registrations error:', err);
    res.status(500).json({ error: 'Failed to load registrations.' });
  }
});

module.exports = router;
