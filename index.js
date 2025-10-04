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
  opacity: 0;            /* 처음엔 안 보이게 */
  visibility: hidden;    /* 공간은 따로 확보한 슬롯이 유지 */
  transition: opacity 160ms ease;
`;
err.setAttribute('role', 'alert');
err.setAttribute('aria-live', 'polite');

// 고정 높이 슬롯(문구가 없어도 공간 유지 → 레이아웃 안 흔들림)
const slot = document.createElement('div');
slot.style.cssText = `
  height: 22px;          /* 문구 한 줄 높이 */
  margin: 6px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
slot.appendChild(err);
input.closest('.input-wrap').appendChild(slot);

// ===== 검증 =====
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@g\.eulji\.ac\.kr$/i;

function validateEmail(v) {
  return EMAIL_RE.test(v.trim());
}

function showError(msg) {
  err.textContent = msg;
  err.style.visibility = 'visible';
  err.style.opacity = '1'; // 페이드 인
  input.setAttribute('aria-invalid', 'true');
  input.style.borderColor = '#e74c3c';
  input.style.boxShadow = '0 0 0 4px rgba(231,76,60,.03)';
}

function clearError() {
  err.style.opacity = '0'; // 페이드 아웃
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
  if (needsScroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

// 포커스 시: 보이게 + 에러 즉시 숨김
input.addEventListener('focus', () => {
  clearError();
  setTimeout(() => ensureVisible(input), 150);
});

// 입력을 시작하면: 실시간 검증 없이 에러만 즉시 숨김
input.addEventListener('input', clearError);

// 키보드로 뷰포트가 줄어들 때도 보이게
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const kbOverlap = Math.max(
      0,
      (window.innerHeight || document.documentElement.clientHeight) -
        window.visualViewport.height
    );
    app.style.paddingBottom = kbOverlap
      ? Math.min(kbOverlap, 120) + 'px'
      : '0px';
    ensureVisible(input);
  });
}

// 엔터로 제출
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') trySubmit();
});

// ===== 제출(백엔드 연동 지점) =====
async function trySubmit() {
  const value = input.value.trim();

  if (!validateEmail(value)) {
    showError('올바른 형식의 이메일을 입력하십시오');
    ensureVisible(input);
    return;
  }

  clearError();
  input.disabled = true;

  try {
    // 실제 API 호출로 교체
    await new Promise((r) => setTimeout(r, 300)); // 데모용 지연

    // 로그인 이메일 저장 (localStorage)
    localStorage.setItem('qai_auth_email', input.value.trim());

    // TODO(백엔드 연동 후):
    // - 서버가 토큰/세션을 내려주면 그걸 저장
    // - 이메일은 서버 프로필 조회로 채우도록 전환

    location.href = 'chat.html';
  } catch (e) {
    console.error(e);
    showError('잠시 후 다시 시도해 주세요.');
  } finally {
    input.disabled = false;
  }
}
