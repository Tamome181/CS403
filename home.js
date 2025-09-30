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
