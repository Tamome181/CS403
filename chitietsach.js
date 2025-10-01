// --- Xử lý modal chi tiết sách ---
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

  // Khi nhấn "Xem chi tiết" trong danh sách sách
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.book-card');
      if (!card) return;

      detailTitle.textContent = card.querySelector('h3')?.textContent || '';
      detailAuthor.textContent = card.querySelector('p')?.textContent || '';
      detailType.textContent = card.dataset.type || '';
      detailStatus.textContent = card.dataset.status || '';

      // Render danh sách tập
      detailVolumes.innerHTML = "";
      const volumesData = card.dataset.volumes;
      if (volumesData) {
        const items = volumesData.split(";").map(s => s.trim());
        detailVolumesCount.textContent = items.length;

        items.forEach(src => {
          const img = document.createElement("img");
          img.src = src;
          img.classList.add("volume-thumb");

          // Xem ảnh tập khi click
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

  // Đóng modal chi tiết
  function closeModal() {
    modal.classList.add('hidden');
    volumePreview.classList.add('hidden');
    volumePreview.classList.remove('show');
  }
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // Đóng overlay preview khi click
  volumePreview.addEventListener("click", () => {
    volumePreview.classList.remove("show");
    setTimeout(() => volumePreview.classList.add("hidden"), 200);
  });
});


// --- Xử lý modal mượn ---
(function(){
  function $id(id){ return document.getElementById(id); }

  // Tạo modal mượn nếu chưa có trong DOM
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

    // Style cơ bản
    if (!document.getElementById('borrowModalAutoStyle')) {
      const style = document.createElement('style');
      style.id = 'borrowModalAutoStyle';
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

  document.addEventListener('DOMContentLoaded', taoModalNeuThieu);

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

  function moModalMuon(title){
    const els = layPhanTuModal();
    currentBorrowTitle = title;
    els.borrowBookTitle.textContent = title;
    els.borrowerName.value = '';
    els.borrowerPhone.value = '';
    els.borrowModal.classList.remove('hidden');
  }

  function dongModal() {
    const els = layPhanTuModal();
    if(els.borrowModal) els.borrowModal.classList.add('hidden');
  }

  // Đóng modal khi nhấn hủy/overlay
  document.addEventListener('click', function(e){
    if (['closeBorrowModal','cancelBorrow','borrowOverlay'].includes(e.target.id)) {
      dongModal();
    }
  });

  // Lắng nghe sự kiện mở modal mượn
  document.addEventListener('openBorrowModal', (e) => {
    moModalMuon(e.detail && e.detail.title);
  });

  // Submit form mượn
  document.addEventListener('submit', function(ev){
    const form = ev.target;
    if(!form || form.id !== 'borrowForm') return;
    ev.preventDefault();

    // Kiểm tra đăng nhập
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      alert('⚠️ Bạn cần đăng nhập trước khi mượn sách!');
      const loginModal = document.getElementById('loginModal');
      if (loginModal) loginModal.classList.remove('hidden');
      return;
    }

    const els = layPhanTuModal();
    const name = (els.borrowerName.value || '').trim();
    const phone = (els.borrowerPhone.value || '').trim();
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
      localStorage.setItem('lastBorrowed', JSON.stringify({bookTitle: loan.bookTitle, at: new Date().toISOString()}));
      alert('✅ Mượn thành công!');
      dongModal();
    } catch(err) {
      console.error('Lưu bản ghi mượn thất bại', err);
      alert('Lỗi khi lưu bản ghi mượn.');
    }
  });

  // --- Chèn nút "Mượn" vào chi tiết sách ---
  document.addEventListener('DOMContentLoaded', function(){
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

    borrowBtn.addEventListener('click', function(e){
  e.preventDefault();

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    alert('⚠️ Bạn cần đăng nhập trước khi mượn sách!');
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.remove('hidden');
    return;
  }

  // Nếu đã đăng nhập thì mở modal mượn
  const titleElem = document.getElementById('detailTitle');
  const title = titleElem ? titleElem.innerText.trim() : '';
  const ev = new CustomEvent('openBorrowModal', {detail:{title}});
  document.dispatchEvent(ev);
});

  });
})();
