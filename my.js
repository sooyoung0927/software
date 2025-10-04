// my.js — information.js(이메일별 저장)에서 프로필 읽어와 표시 + 버튼 텍스트 전환

// ===== email-scoped key 유틸 (information.js와 동일 네임스페이스) =====
const AUTH_EMAIL_KEY = 'qai_auth_email';
const NS = 'qai';
const PROFILE_KEY_SUFFIX = 'profile';
const EARNED_KEY_SUFFIX = 'earnedCredits';
const TOTAL_KEY_SUFFIX = 'totalCredits';

function currentEmail() {
  return (localStorage.getItem(AUTH_EMAIL_KEY) || '').trim().toLowerCase();
}
function keyFor(suffix) {
  const email = currentEmail() || '__noemail__';
  return `${NS}:${suffix}:${email}`;
}

function loadLocalProfile() {
  const raw = localStorage.getItem(keyFor(PROFILE_KEY_SUFFIX));
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function loadEarned() {
  return Number(localStorage.getItem(keyFor(EARNED_KEY_SUFFIX)) || 0) || 0;
}
function loadTotal() {
  return Number(localStorage.getItem(keyFor(TOTAL_KEY_SUFFIX)) || 130) || 130;
}

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s) => document.querySelector(s);

  // 읽기전용 인풋
  const nameEl = $('#name');
  const deptEl = $('#dept');
  const gradeEl = $('#grade');
  const remainEl = $('#remain');

  // 정보 입력하기/수정하기 버튼
  const infoBtn = $('#openInfoBtn') || document.querySelector('.primary-btn');

  // placeholder 고정 + readonly 유지
  [nameEl, deptEl, gradeEl, remainEl].forEach((el) => {
    if (!el) return;
    el.readOnly = true;
    el.setAttribute('aria-readonly', 'true');
    if (!el.placeholder) el.placeholder = '정보를 입력하면 입력됩니다';
  });

  // 저장된 프로필 불러오기
  const prof = loadLocalProfile();
  const earned = loadEarned();
  const total = loadTotal();

  // 값 주입
  if (prof) {
    if (nameEl) nameEl.value = prof.name || '';
    if (deptEl) deptEl.value = prof.department || '';
    if (gradeEl) gradeEl.value = prof.studentId || '';
  }

  // 잔여학점 계산(정보 없으면 공백)
  if (remainEl) {
    if (
      Number.isFinite(total) &&
      Number.isFinite(earned) &&
      (earned || prof?.earned || prof?.total)
    ) {
      const left = Math.max(
        0,
        (prof?.total ?? total) - (prof?.earned ?? earned)
      );
      remainEl.value = String(left);
    } else {
      remainEl.value = '';
    }
  }

  // 프로필이 한 번이라도 입력되어 있으면 버튼 텍스트 → "수정하기"
  const hasAny =
    (prof && (prof.name || prof.department || prof.studentId)) ||
    earned > 0 ||
    total !== 130;

  if (infoBtn) {
    infoBtn.textContent = hasAny ? '수정하기' : '정보 입력하기';
    // 링크는 그대로 information.html (href 이미 있음)
  }
});
