/**
 * Hàm searchBooks
 * --------------------
 * Mục đích:
 *   - Lọc danh sách sách trong giao diện dựa trên từ khóa tìm kiếm.
 *   - Người dùng nhập từ khóa vào ô search, hàm sẽ ẩn những sách không khớp.
 *
 * Cách hoạt động:
 *   1. Lấy giá trị trong ô input #searchInput.
 *   2. Duyệt qua tất cả các thẻ .book-card.
 *   3. So sánh từ khóa với tên sách (h3) và tác giả (p).
 *   4. Nếu khớp thì hiện, không khớp thì ẩn.
 */
function searchBooks() {
  // Lấy giá trị người dùng nhập (chuyển về chữ thường để so sánh không phân biệt hoa/thường)
  let input = document.getElementById("searchInput").value.toLowerCase();

  // Lấy tất cả các thẻ sách
  let books = document.querySelectorAll(".book-card");

  // Duyệt qua từng thẻ sách
  books.forEach(book => {
    // Lấy tiêu đề sách
    let title = book.querySelector("h3").innerText.toLowerCase();
    // Lấy tên tác giả
    let author = book.querySelector("p").innerText.toLowerCase();

    // Kiểm tra từ khóa có trong tiêu đề hoặc tên tác giả hay không
    if (title.includes(input) || author.includes(input)) {
      book.style.display = "block"; // Nếu khớp thì hiện sách
    } else {
      book.style.display = "none"; // Nếu không khớp thì ẩn sách
    }
  });
}
