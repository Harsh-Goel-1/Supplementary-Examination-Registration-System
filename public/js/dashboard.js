// ── Dashboard page script ───────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // ── Auth guard ────────────────────────────────────────
  let student;
  try {
    const meRes = await fetch('/api/auth/me');
    if (!meRes.ok) throw new Error();
    student = await meRes.json();
    document.getElementById('nav-welcome').textContent = 'Hi, ' + student.name;
  } catch {
    window.location.href = '/login.html';
    return;
  }

  // ── Logout ────────────────────────────────────────────
  document.getElementById('nav-logout').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  });

  // ── Load courses ──────────────────────────────────────
  const courseSelect = document.getElementById('course');
  try {
    const res = await fetch('/api/courses');
    const courses = await res.json();
    courses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.course_id;
      opt.textContent = `${c.course_code} — ${c.course_name}`;
      courseSelect.appendChild(opt);
    });
  } catch {
    showRegAlert('Failed to load courses.', 'error');
  }

  // ── Register form ─────────────────────────────────────
  const regForm    = document.getElementById('register-form');
  const regAlert   = document.getElementById('reg-alert');

  function showRegAlert(msg, type = 'error') {
    regAlert.textContent = msg;
    regAlert.className = 'alert alert-' + type;
    regAlert.style.display = 'block';
  }

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    regAlert.style.display = 'none';

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseSelect.value,
          transaction_id: document.getElementById('transaction_id').value.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showRegAlert('Registration submitted successfully!', 'success');
      regForm.reset();
      loadRegistrations(); // refresh the table
    } catch (err) {
      showRegAlert(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Registration';
    }
  });

  // ── Load past registrations ───────────────────────────
  async function loadRegistrations() {
    const container = document.getElementById('registrations-list');
    try {
      const res = await fetch('/api/my-registrations');
      const regs = await res.json();

      if (regs.length === 0) {
        container.innerHTML = '<p class="empty-state">You have not registered for any supplementary exams yet.</p>';
        return;
      }

      let html = `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>`;

      regs.forEach(r => {
        const date = new Date(r.applied_at).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
        const statusClass = r.status === 'Approved' ? 'status-approved'
                          : r.status === 'Rejected' ? 'status-rejected'
                          : 'status-pending';
        html += `
              <tr>
                <td><strong>${r.course_code}</strong> — ${r.course_name}</td>
                <td class="mono">${r.transaction_id || '—'}</td>
                <td>₹${parseFloat(r.amount).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${r.status}</span></td>
                <td>${date}</td>
              </tr>`;
      });

      html += '</tbody></table></div>';
      container.innerHTML = html;
    } catch {
      container.innerHTML = '<p class="empty-state">Failed to load registrations.</p>';
    }
  }

  loadRegistrations();
});
