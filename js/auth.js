// Login form handling
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();
    if (!username || !password) {
      loginError.textContent = 'Please fill both username and password.';
      return;
    }
    try {
      const res = await fetch('php/auth_login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = 'dashboard.html';
      } else {
        loginError.textContent = data.message || 'Invalid username or password.';
      }
    } catch {
      loginError.textContent = 'Network error.';
    }
  });
}

// Registration form handling
const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');
if (registerForm) {
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = registerForm.username.value.trim();
    const password = registerForm.password.value.trim();
    const confirmPassword = registerForm.confirmPassword.value.trim();
    if (!username || !password || !confirmPassword) {
      registerError.textContent = 'Please fill all fields.';
      return;
    }
    if (password !== confirmPassword) {
      registerError.textContent = 'Passwords do not match.';
      return;
    }
    try {
      const res = await fetch('php/auth_register.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
      } else {
        registerError.textContent = data.message || 'Registration failed.';
      }
    } catch {
      registerError.textContent = 'Network error.';
    }
  });
}

// Logout
function logout() {
  fetch('php/auth_logout.php')
    .then(() => window.location.href = 'login.html')
    .catch(() => alert('Logout failed.'));
}
window.logout = logout;
