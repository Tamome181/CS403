
// borrowReturn.js - Xử lý trang Mượn/Trả
document.addEventListener('DOMContentLoaded', function(){ // khi DOM sẵn sàng
  function fmt(d){ return new Date(d).toLocaleString(); } // format ngày giờ theo locale trình duyệt
  function loadLoans(){ // tải dữ liệu mượn từ localStorage
    const raw = localStorage.getItem('loans');
    const loans = raw ? JSON.parse(raw) : [];
    return loans;
  }
  function saveLoans(loans){ localStorage.setItem('loans', JSON.stringify(loans)); } // lưu mảng loans vào localStorage

  const container = document.getElementById('loanListContainer');
  function render(){
    const loans = loadLoans();
    const active = loans.filter(l => !l.isReturned);
    if(active.length === 0){
      container.innerHTML = '<p>Không có sách đang mượn.</p>'; return;
    }
    let html = '<table class="loan-table"><thead><tr><th>Tiêu đề</th><th>Người mượn</th><th>SDT</th><th>Ngày mượn</th><th>Hạn trả</th><th>Gia hạn</th><th>Hành động</th></tr></thead><tbody>';
    for(const l of active){
      html += `<tr data-id="${l.id}"><td>${l.bookTitle}</td><td>${l.borrowerName}</td><td>${l.borrowerPhone}</td><td>${fmt(l.borrowedAt)}</td><td>${fmt(l.dueDate)}</td><td>${l.renewCount}</td><td>
        <button class="return-btn">Trả</button>
        <button class="renew-btn">Gia hạn</button>
      </td></tr>`;
    }
    html += '</tbody></table>';
    container.innerHTML = html;
    // gắn sự kiện cho nút
    container.querySelectorAll('.return-btn').forEach(b => b.addEventListener('click', onReturn));
    container.querySelectorAll('.renew-btn').forEach(b => b.addEventListener('click', onRenew));
  }

  function onReturn(ev){ // xử lý trả sách
    const tr = ev.target.closest('tr');
    const id = tr.getAttribute('data-id');
    const loans = loadLoans();
    const loan = loans.find(x=>x.id===id);
    if(!loan) return alert('Không tìm thấy bản ghi.');
    // confirm and optional verify
    if(!confirm(`Xác nhận trả sách "${loan.bookTitle}" mượn bởi ${loan.borrowerName}?`)) return;
    loan.isReturned = true;
    loan.returnedAt = new Date().toISOString();
    saveLoans(loans);
    // update book-card on Trangchu.html if open: use localStorage event by setting a flag
    localStorage.setItem('lastReturned', JSON.stringify({bookTitle: loan.bookTitle, at:new Date().toISOString()}));
    alert('Đã trả sách.');
    render();
  }

  function onRenew(ev){ // xử lý gia hạn
    const tr = ev.target.closest('tr');
    const id = tr.getAttribute('data-id');
    const loans = loadLoans();
    const loan = loans.find(x=>x.id===id);
    if(!loan) return alert('Không tìm thấy bản ghi.');
    const maxRenew = 2;
    if(loan.renewCount >= maxRenew) return alert('Đã đạt giới hạn gia hạn.');
    loan.renewCount += 1;
    // extend by 7 days
    loan.dueDate = new Date(new Date(loan.dueDate).getTime() + 7*24*3600*1000).toISOString();
    saveLoans(loans);
    alert('Gia hạn thành công. Hạn trả mới: ' + new Date(loan.dueDate).toLocaleString());
    render();
  }

  // listen to storage events to update UI in other tabs/pages
  window.addEventListener('storage', function(e){
    if(e.key === 'loans' || e.key === 'lastReturned'){
      render();
    }
  });

  render();
});
