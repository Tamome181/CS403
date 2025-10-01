// login.js
document.addEventListener('DOMContentLoaded', () => {
  const loginIcon = document.getElementById('loginIcon');
  const loginModal = document.getElementById('loginModal');
  const loginOverlay = document.getElementById('loginOverlay');
  const closeLogin = document.getElementById('closeLogin');
  const cancelLogin = document.getElementById('cancelLogin');
  const loginForm = document.getElementById('loginForm');

  if (!loginIcon || !loginModal || !loginForm) {
    console.warn('login.js: Thiếu phần tử DOM (loginIcon/loginModal/loginForm).');
    return;
  }

  const openLogin = () => loginModal.classList.remove('hidden');
  const close = () => loginModal.classList.add('hidden');

  loginIcon.addEventListener('click', openLogin);
  closeLogin.addEventListener('click', close);
  cancelLogin.addEventListener('click', close);
  loginOverlay.addEventListener('click', close);

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    // Demo tài khoản: admin / 123
    if (user === 'admin' && pass === '123') {
      localStorage.setItem('isLoggedIn', 'true');
      alert('Đăng nhập thành công!');
      close();
    } else {
      alert('Sai tài khoản hoặc mật khẩu!');
    }
  });
});
// Xử lý form đăng nhập
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "admin" && password === "123") {
    // ✅ Lưu trạng thái đăng nhập
    localStorage.setItem("isLoggedIn", "true");
    alert("Đăng nhập thành công!");

    document.getElementById("loginModal").classList.add("hidden");
  } else {
    alert("Sai tên đăng nhập hoặc mật khẩu!");
  }
});





