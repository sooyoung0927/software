// ===== 요소 =====
const input = document.querySelector('.input-wrap input');
const app = document.querySelector('.app');

// ===== 에러 슬롯(레이아웃 고정) + 문구 =====
const err = document.createElement('p');
err.className = 'email-error';
err.style.cssText = `
  margin: 0;
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: #e74c3c;
  line-height: 1.4;
  opacity: 0;
  visibility: hidden;
  transition: opacity 160ms ease;
`;
err.setAttribute('role', 'alert');
err.setAttribute('aria-live', 'polite');

const slot = document.createElement('div');
slot.style.cssText = `
  height: 22px;
  margin: 6px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
slot.appendChild(err);

if (input && input.closest('.input-wrap')) {
  input.closest('.input-wrap').appendChild(slot);
}

// ===== 이메일 검증 (일반 이메일 형식 허용) =====
const EMAIL_RE_ANY = /^[^\s@]+@g\.eulji\.ac\.kr$/i;
const validateEmail = (v) => EMAIL_RE_ANY.test(v.trim());

// ===== 에러 표시/초기화 =====
function showError(msg) {
  if (!input) return;
  err.textContent = msg;
  err.style.visibility = 'visible';
  err.style.opacity = '1';
  input.setAttribute('aria-invalid', 'true');
  input.style.borderColor = '#e74c3c';
  input.style.boxShadow = '0 0 0 4px rgba(231,76,60,.03)';
}

function clearError() {
  if (!input) return;
  err.style.opacity = '0';
  setTimeout(() => {
    err.style.visibility = 'hidden';
    err.textContent = '';
  }, 160);
  input.removeAttribute('aria-invalid');
  input.style.borderColor = '#d6e3f6';
  input.style.boxShadow = 'none';
}

// ===== 가려짐 방지(모바일 키보드) =====
function ensureVisible(el) {
  const vv = window.visualViewport;
  const rect = el.getBoundingClientRect();
  const vh = vv ? vv.height : window.innerHeight;
  const topOffset = vv ? vv.offsetTop : 0;
  const bottomLimit = topOffset + vh - 12;
  const needsScroll = rect.bottom > bottomLimit || rect.top < topOffset + 12;
  if (needsScroll) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

if (input) {
  input.addEventListener('focus', () => {
    clearError();
    setTimeout(() => ensureVisible(input), 150);
  });

  input.addEventListener('input', clearError);
}

if (window.visualViewport && app) {
  window.visualViewport.addEventListener('resize', () => {
    const kbOverlap = Math.max(
      0,
      (window.innerHeight || document.documentElement.clientHeight) -
        window.visualViewport.height
    );
    app.style.paddingBottom = kbOverlap
      ? Math.min(kbOverlap, 120) + 'px'
      : '0px';

    if (input) ensureVisible(input);
  });
}

// ===== 제출 핸들러 (프론트 전용, 더미 토큰/프로필 저장) =====
function trySubmit() {
  if (!input) return;

  const email = input.value.trim();

  if (!validateEmail(email)) {
    showError('올바른 이메일 형식으로 입력해주십시오.(@g.eulji.ac.kr)');
    ensureVisible(input);
    return;
  }

  // 에러 초기화
  clearError();

  // ✅ 프론트 전용: 더미 토큰/유저/프로필 저장 → chat.html 가드 통과용
  try {
    localStorage.setItem('qai_auth_email', email);
    localStorage.setItem('qai_token', '__dev_token__'); // 보호용 더미 토큰
    localStorage.setItem('qai_user_id', '0');

    const dummyProfile = {
      id: 0,
      email,
      name: 'Guest',
      department: 'N/A',
      studentId: 'N/A',
    };
    localStorage.setItem('qai_profile', JSON.stringify(dummyProfile));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }

  // 다음 화면으로 이동
  location.href = 'chat.html';
}

// ===== 이벤트 바인딩 =====

// Enter로 제출
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    trySubmit();
  }
});

// 폼 기본 제출 막고 JS로 처리
const form = document.querySelector('form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    trySubmit();
  });
}

// 버튼 클릭으로도 제출 (버튼이 있을 때만)
const nextBtn = document.querySelector('.next-btn');
if (nextBtn) {
  nextBtn.addEventListener('click', trySubmit);
}
