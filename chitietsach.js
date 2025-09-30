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
