document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'writingChecklistState';

  // 저장된 상태 불러오기
  let state = {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('체크리스트 상태 불러오기 실패:', e);
  }

  const checkboxes = document.querySelectorAll('.check-item');

  // 초기 상태 반영
  checkboxes.forEach((cb) => {
    const id = cb.dataset.checkId;
    if (!id) return;

    if (state[id] === true) {
      cb.checked = true;
    }

    // 변경되면 바로 저장
    cb.addEventListener('change', () => {
      state[id] = cb.checked;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('체크리스트 상태 저장 실패:', e);
      }
    });
  });
});
