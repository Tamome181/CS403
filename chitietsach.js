
// Add a "Mượn" button into the detail modal and handle clicks
(function(){
  // Wait until DOM elements exist
  document.addEventListener('DOMContentLoaded', function(){
    const modalContent = document.querySelector('.modal-content');
    if(!modalContent) return;
    // create borrow button area
    const borrowArea = document.createElement('div');
    borrowArea.style.marginTop = '10px';
    const borrowBtn = document.createElement('button');
    borrowBtn.textContent = 'Mượn';
    borrowBtn.id = 'detailBorrowBtn';
    borrowBtn.style.marginRight = '8px';
    borrowArea.appendChild(borrowBtn);
    modalContent.appendChild(borrowArea);

    borrowBtn.addEventListener('click', function(){
      // read title and status from modal
      const title = document.getElementById('detailTitle')?.innerText?.trim();
      const status = document.getElementById('detailStatus')?.innerText?.trim();
      if(!title) { alert('Không xác định được sách để mượn.'); return; }
      if(status && status.toLowerCase().includes('đã mượn')) {
        alert('Sách hiện đang không có sẵn để mượn.');
        return;
      }
      // open borrow modal via custom event
      const ev = new CustomEvent('openBorrowModal', {detail:{title}});
      document.dispatchEvent(ev);
    });
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('detailModal');
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('closeModal');

  const detailTitle = document.getElementById('detailTitle');
  const detailAuthor = document.getElementById('detailAuthor');
  const detailType = document.getElementById('detailType');
  const detailStatus = document.getElementById('detailStatus');
  const detailVolumesCount = document.getElementById('detailVolumesCount');
  const detailVolumes = document.getElementById('detailVolumes');

  const volumePreview = document.getElementById('volumePreview');
  const previewImg = document.getElementById('previewImg');

  // Xử lý nút "Xem chi tiết"
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.book-card');
      if (!card) return;

      detailTitle.textContent = card.querySelector('h3')?.textContent || '';
      detailAuthor.textContent = card.querySelector('p')?.textContent || '';
      detailType.textContent = card.dataset.type || '';
      detailStatus.textContent = card.dataset.status || '';

      // Xử lý số tập và ảnh
      detailVolumes.innerHTML = "";
      const volumesData = card.dataset.volumes;
      if (volumesData) {
        const items = volumesData.split(";").map(s => s.trim());
        detailVolumesCount.textContent = items.length;

        items.forEach(src => {
          const img = document.createElement("img");
          img.src = src;
          img.classList.add("volume-thumb");

          // 👉 Chuyển từ hover sang click để mở overlay
          img.addEventListener("click", () => {
            previewImg.src = src;
            volumePreview.classList.remove("hidden");
            volumePreview.classList.add("show");
          });

          detailVolumes.appendChild(img);
        });
      } else {
        detailVolumesCount.textContent = "Không có";
      }

      modal.classList.remove('hidden');
    });
  });

  // Đóng modal
  function closeModal() {
    modal.classList.add('hidden');
    volumePreview.classList.add('hidden'); // tắt luôn preview nếu đang mở
    volumePreview.classList.remove('show');
  }
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // Đóng overlay preview khi click vào
  volumePreview.addEventListener("click", () => {
    volumePreview.classList.remove("show");
    setTimeout(() => volumePreview.classList.add("hidden"), 200);
  });
});





// --- Xử lý modal mượn (phiên bản chắc chắn, tạo modal nếu thiếu) ---
(function(){
  function $id(id){ return document.getElementById(id); }

  // Tạo modal mượn động nếu trong DOM chưa có
  function taoModalNeuThieu() {
    if ($id('borrowModal')) return;
    const modalHtml = `
      <div id="borrowModal" class="modal hidden">
        <div class="modal-overlay" id="borrowOverlay"></div>
        <div class="modal-content">
          <button class="close-btn" id="closeBorrowModal">&times;</button>
          <h2>Mượn sách: <span id="borrowBookTitle"></span></h2>
          <form id="borrowForm">
            <label>Họ tên:<br/><input type="text" id="borrowerName" required></label><br/>
            <label>Số điện thoại:<br/><input type="text" id="borrowerPhone" required></label><br/>
            <div class="modal-actions">
              <button type="submit">Xác nhận mượn</button>
              <button type="button" id="cancelBorrow">Hủy</button>
            </div>
          </form>
        </div>
      </div>`;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHtml;
    document.body.appendChild(wrapper.firstElementChild);
    // Thêm style cơ bản nếu chưa có để modal hiển thị đẹp
    const styleId = 'borrowModalAutoStyle';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .modal { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; z-index:9999; }
        .modal.hidden { display:none; }
        .modal-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.4); }
        .modal-content { background:#fff; padding:20px; border-radius:8px; z-index:10000; max-width:90%; width:420px; box-shadow:0 6px 24px rgba(0,0,0,0.2); position:relative; }
        .close-btn { position:absolute; right:12px; top:8px; font-size:22px; background:none; border:none; cursor:pointer; }
      `;
      document.head.appendChild(style);
    }
  }

  // Khi DOM sẵn sàng, đảm bảo modal tồn tại
  document.addEventListener('DOMContentLoaded', function(){
    try { taoModalNeuThieu(); } catch(e) { console.error('taoModalNeuThieu thất bại', e); }
  });

  // Lấy các phần tử modal (và tạo nếu cần)
  function layPhanTuModal() {
    taoModalNeuThieu();
    return {
      borrowModal: $id('borrowModal'),
      borrowOverlay: $id('borrowOverlay'),
      closeBorrowModal: $id('closeBorrowModal'),
      cancelBorrow: $id('cancelBorrow'),
      borrowForm: $id('borrowForm'),
      borrowBookTitle: $id('borrowBookTitle'),
      borrowerName: $id('borrowerName'),
      borrowerPhone: $id('borrowerPhone')
    };
  }

  let currentBorrowTitle = null;

  // Mở modal mượn với tiêu đề sách
  function moModalMuon(title){
    if(!title) {
      console.error('moModalMuon được gọi nhưng không có title');
      alert('Không xác định được sách để mượn.');
      return;
    }
    const els = layPhanTuModal();
    if(!els.borrowModal || !els.borrowBookTitle || !els.borrowForm) {
      console.error('Các phần tử modal thiếu sau khi tạo, els=', els);
      alert('Gặp lỗi khi mở modal mượn (thiếu giao diện). Vui lòng tải lại trang.');
      return;
    }
    currentBorrowTitle = title;
    try {
      els.borrowBookTitle.textContent = title;
      els.borrowerName.value = '';
      els.borrowerPhone.value = '';
      els.borrowModal.classList.remove('hidden');
    } catch (err) {
      console.error('Lỗi khi mở modal mượn', err);
      alert('Gặp lỗi khi mở modal mượn. Kiểm tra console để biết chi tiết.');
    }
  }

  function dongModal() {
    const els = layPhanTuModal();
    if(els.borrowModal) els.borrowModal.classList.add('hidden');
  }

  // Xử lý click global để đóng modal khi nhấn nút đóng/hủy/overlay
  document.addEventListener('click', function(e){
    const target = e.target;
    if(!target) return;
    if(target.id === 'closeBorrowModal') { dongModal(); }
    if(target.id === 'cancelBorrow') { dongModal(); }
    if(target.id === 'borrowOverlay') { dongModal(); }
  });

  // Lắng nghe sự kiện tùy chỉnh để mở modal
  document.addEventListener('openBorrowModal', (e) => {
    const title = e.detail && e.detail.title;
    moModalMuon(title);
  });

  // Xử lý submit form mượn
  document.addEventListener('submit', function(ev){
    const form = ev.target;
    if(!form || form.id !== 'borrowForm') return;
    ev.preventDefault();
    const els = layPhanTuModal();
    const name = (els.borrowerName && els.borrowerName.value || '').trim();
    const phone = (els.borrowerPhone && els.borrowerPhone.value || '').trim();
    if(!name || !phone) { alert('Vui lòng nhập tên và số điện thoại.'); return; }

    try {
      const raw = localStorage.getItem('loans');
      const loans = raw ? JSON.parse(raw) : [];
      const loan = {
        id: 'loan_' + Date.now(),
        bookTitle: currentBorrowTitle,
        borrowerName: name,
        borrowerPhone: phone,
        borrowedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14*24*3600*1000).toISOString(),
        isReturned: false,
        renewCount: 0
      };
      loans.push(loan);
      localStorage.setItem('loans', JSON.stringify(loans));
      // Đặt flag để các tab khác có thể cập nhật
      localStorage.setItem('lastBorrowed', JSON.stringify({bookTitle: loan.bookTitle, at: new Date().toISOString()}));
      alert('Mượn thành công!');
      dongModal();
    } catch(err) {
      console.error('Lưu bản ghi mượn thất bại', err);
      alert('Lỗi khi lưu bản ghi mượn. Kiểm tra console.');
    }
  });

  // Nếu modal nội dung chi tiết có sẵn, tự chèn nút "Mượn" (không chèn nhiều lần)
  document.addEventListener('DOMContentLoaded', function(){
    try {
      const modalContent = document.querySelector('.modal-content');
      if(!modalContent) return;
      if(document.getElementById('detailBorrowBtn')) return;
      const borrowArea = document.createElement('div');
      borrowArea.style.marginTop = '10px';
      const borrowBtn = document.createElement('button');
      borrowBtn.textContent = 'Mượn';
      borrowBtn.id = 'detailBorrowBtn';
      borrowBtn.style.marginRight = '8px';
      borrowArea.appendChild(borrowBtn);
      modalContent.appendChild(borrowArea);

      borrowBtn.addEventListener('click', function(){
        const titleElem = document.getElementById('detailTitle') || document.querySelector('.book-card h3');
        const title = titleElem && titleElem.innerText && titleElem.innerText.trim();
        const statusElem = document.getElementById('detailStatus');
        const status = statusElem && statusElem.innerText ? statusElem.innerText : '';
        if(!title) { alert('Không xác định được sách để mượn.'); return; }
        if(status.toLowerCase().includes('đã mượn')) { alert('Sách hiện đang không có sẵn để mượn.'); return; }
        const ev = new CustomEvent('openBorrowModal', {detail:{title}});
        document.dispatchEvent(ev);
      });
    } catch(e) { console.error('Chèn nút mượn thất bại', e); }
  });

})();
