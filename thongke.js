document.addEventListener("DOMContentLoaded", () => {
  // Hàm lấy dữ liệu từ localStorage
  function loadBooks() {
    const raw = localStorage.getItem('books');
    return raw ? JSON.parse(raw) : [];
  }
  
  function loadLoans() {
    const raw = localStorage.getItem('loans');
    return raw ? JSON.parse(raw) : [];
  }

  const books = loadBooks();
  const loans = loadLoans();

  console.log('📚 Books loaded:', books.length);
  console.log('📖 Loans loaded:', loans.length);

  // 1. Thống kê theo loại sách (từ dữ liệu thực)
  const typeCount = {};
  books.forEach(book => {
    const type = book.type || 'Khác';
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  const typeLabels = Object.keys(typeCount);
  const typeData = Object.values(typeCount);
  const typeColors = ['#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#2ecc71', '#e74c3c', '#1abc9c'];

  const ctx1 = document.getElementById("chartByType");
  if (ctx1) {
    new Chart(ctx1, {
      type: "bar",
      data: {
        labels: typeLabels,
        datasets: [{
          label: "Số lượng sách",
          data: typeData,
          backgroundColor: typeColors.slice(0, typeLabels.length),
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                size: 12
              }
            },
            grid: {
              color: '#f1f1f1'
            }
          },
          x: {
            ticks: {
              font: {
                size: 13
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
    console.log('✅ Chart created');
  } else {
    console.error('❌ chartByType not found');
  }

  // 2. Top 5 sách mượn nhiều (từ dữ liệu thực)
  const borrowCount = {};
  
  loans.forEach(loan => {
    const title = loan.bookTitle;
    borrowCount[title] = (borrowCount[title] || 0) + 1;
  });

  // Tạo mảng và sắp xếp theo số lượt mượn
  const topBooks = Object.entries(borrowCount)
    .map(([title, count]) => {
      const book = books.find(b => b.title === title);
      return {
        title: title,
        author: book ? book.author : 'N/A',
        borrow: count
      };
    })
    .sort((a, b) => b.borrow - a.borrow)
    .slice(0, 5);

  const tbody = document.getElementById("topBooksTable");
  
  if (tbody) {
    if (topBooks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Chưa có dữ liệu mượn sách</td></tr>';
    } else {
      tbody.innerHTML = topBooks.map((b, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${b.title}</td>
          <td>${b.author}</td>
          <td>${b.borrow}</td>
        </tr>
      `).join('');
    }
    console.log('✅ Table updated with', topBooks.length, 'books');
  } else {
    console.error('❌ topBooksTable not found');
  }

  // 3. Cập nhật thống kê tổng quan
  updateOverviewStats(books, loans);

  // 4. Lắng nghe sự kiện storage để cập nhật real-time
  window.addEventListener('storage', (e) => {
    if (e.key === 'books' || e.key === 'loans') {
      console.log('🔄 Storage changed, reloading...');
      location.reload();
    }
  });
});

// Hàm cập nhật thống kê tổng quan
function updateOverviewStats(books, loans) {
  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.status === 'Có sẵn').length;
  const borrowedBooks = books.filter(b => b.status === 'Đang mượn').length;
  const activeLoanCount = loans.filter(l => !l.isReturned).length;

  console.log('📊 Stats:', { totalBooks, availableBooks, borrowedBooks, activeLoanCount });

  // Cập nhật các phần tử HTML nếu tồn tại
  const totalEl = document.getElementById('totalBooks');
  const availableEl = document.getElementById('availableBooks');
  const borrowedEl = document.getElementById('borrowedBooks');
  const activeLoansEl = document.getElementById('activeLoans');

  if (totalEl) totalEl.textContent = totalBooks;
  if (availableEl) availableEl.textContent = availableBooks;
  if (borrowedEl) borrowedEl.textContent = borrowedBooks;
  if (activeLoansEl) activeLoansEl.textContent = activeLoanCount;
  
  console.log('✅ Overview stats updated');
}