// ── Auth page scripts (signup.html & login.html) ────────────

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm  = document.getElementById('login-form');
  const alert      = document.getElementById('alert');

  function showAlert(msg, type = 'error') {
    alert.textContent = msg;
    alert.className = 'alert alert-' + type;
    alert.style.display = 'block';
  }

  // ── Signup ──────────────────────────────────────────
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('signup-btn');
      btn.disabled = true;
      btn.textContent = 'Creating Account…';

      const email = document.getElementById('email').value.trim();
      if (!email.endsWith('@nith.ac.in')) {
        showAlert('Only @nith.ac.in email addresses are allowed.');
        btn.disabled = false;
        btn.textContent = 'Create Account';
        return;
      }

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: document.getElementById('name').value.trim(),
            roll_no: document.getElementById('roll_no').value.trim(),
            email,
            password: document.getElementById('password').value,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        showAlert('Account created! Redirecting…', 'success');
        setTimeout(() => (window.location.href = '/dashboard.html'), 800);
      } catch (err) {
        showAlert(err.message);
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  }

  // ── Login ───────────────────────────────────────────
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      btn.disabled = true;
      btn.textContent = 'Logging In…';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        showAlert('Welcome back! Redirecting…', 'success');
        setTimeout(() => (window.location.href = '/dashboard.html'), 800);
      } catch (err) {
        showAlert(err.message);
        btn.disabled = false;
        btn.textContent = 'Log In';
      }
    });
  }
});
