document.addEventListener('DOMContentLoaded', () => {
  const msgEl = document.getElementById('curri-message');
  const contentEl = document.getElementById('curri-content');

  let dept = '';

  // 👉 마이페이지/정보입력 페이지에서 저장한 localStorage 구조에 맞게 수정하면 됨
  try {
    // 예시: { name, dept, grade, remain } 이런 식으로 저장돼 있다고 가정
    const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
    dept = stored.dept || stored.department || '';
  } catch (e) {
    dept = '';
  }

  // 학과/학부 정보가 없을 때
  if (!dept) {
    msgEl.textContent =
      '학과/학부를 먼저 입력해주십시오.\n' +
      '마이페이지에서 [정보 입력하기]를 눌러 학과/학부를 저장하면\n' +
      '이곳에서 커리큘럼을 확인할 수 있습니다.';
    contentEl.hidden = true;
    return;
  }

  // 학과/학부 정보가 있을 때 (나중에 실제 커리큘럼 채우는 영역)
  msgEl.textContent = `${dept} 커리큘럼은 준비 중입니다.`;
  // 나중에는 msgEl 숨기고, contentEl에 표/리스트 넣어도 됨
  // msgEl.style.display = "none";
  // contentEl.hidden = false;
});
