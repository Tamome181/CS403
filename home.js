
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById("searchInput");
  const books = document.querySelectorAll(".book-card");

  // Nút Trang chủ (Home) trong sidebar
  const homeBtn = document.querySelector(".sidebar ul li:first-child");

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      // Reset thanh tìm kiếm
      if (searchInput) {
        searchInput.value = "";
      }

      // Hiện lại tất cả sách
      books.forEach(book => {
        book.style.display = "block";
      });
    });
  }
});

borrowBtn.addEventListener('click', function(){
  const title = document.getElementById('detailTitle')?.innerText?.trim() || '';

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    alert('Vui lòng đăng nhập trước khi mượn sách!');
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.remove('hidden');
    return;
  }

  const ev = new CustomEvent('openBorrowModal', {detail:{title}});
  document.dispatchEvent(ev);
});

