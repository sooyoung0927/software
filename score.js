// score.js — 입력 자동 저장/복원 + 합계→도넛(earned) 동기화

const rowsEl = document.getElementById('rows');
const addBtn =
  document.getElementById('addRowBtn') || document.getElementById('addRow'); // 새/구버전 호환
const submitBtn = document.getElementById('submitBtn');
const scrollBox = document.querySelector('.app-body');

const PROFILE_KEY = 'qai_profile'; // information.js와 동일 키
const SCORE_ROWS_KEY = 'qai_score_rows'; // 과목/학점 배열 저장 키
// ===== LS key helpers: email namespace =====
const AUTH_EMAIL_KEY = 'qai_auth_email'; // 이미 쓰던 키

const NS = 'qai';
function currentEmail() {
  return (localStorage.getItem('qai_auth_email') || '').trim().toLowerCase();
}
function keyFor(suffix) {
  const e = currentEmail() || '__noemail__';
  return `${NS}:${suffix}:${e}`;
}

const ROWS_KEY_SUFFIX = 'rows';
const EARNED_KEY_SUFFIX = 'earnedCredits';
const TOTAL_KEY_SUFFIX = 'totalCredits'; // 필요하면 사용 (보통 130 고정)

// 숫자 제한
function onlyDigitsFilter(e) {
  const allowed = /[0-9.]/;
  if (e.key.length === 1 && !allowed.test(e.key) && !e.ctrlKey && !e.metaKey)
    e.preventDefault();
}
function sanitizeOnInput(el) {
  let v = el.value.replace(/[^\d.]/g, '');
  const parts = v.split('.');
  if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
  el.value = v;
}

// 합계 계산 + 저장(이메일별)
function calcAndSave() {
  const credits = [...rowsEl.querySelectorAll('.credit')].map(
    (c) => Number(c.value || 0) || 0
  );
  const sum = credits.reduce((a, b) => a + b, 0);
  localStorage.setItem(keyFor(EARNED_KEY_SUFFIX), String(sum));

  // 행 데이터도 같이 저장
  const rowsData = [...rowsEl.querySelectorAll('.row')].map((r) => ({
    subject: r.querySelector('.subject')?.value || '',
    credit: r.querySelector('.credit')?.value || '',
  }));
  localStorage.setItem(keyFor(ROWS_KEY_SUFFIX), JSON.stringify(rowsData));
}

// 행 만들기
function createRow(subject = '', credit = '') {
  const row = document.createElement('div');
  row.className = 'row';

  const subj = document.createElement('input');
  subj.className = 'subject';
  subj.type = 'text';
  subj.setAttribute('aria-label', '과목명');
  subj.value = subject;

  const cred = document.createElement('input');
  cred.className = 'credit';
  cred.type = 'text';
  cred.inputMode = 'numeric';
  cred.setAttribute('aria-label', '학점');
  cred.value = credit;

  cred.addEventListener('keydown', onlyDigitsFilter);
  cred.addEventListener('input', () => {
    sanitizeOnInput(cred);
    calcAndSave();
  });
  subj.addEventListener('input', calcAndSave);

  row.append(subj, cred);
  return row;
}

// 초기 행에 리스너 부착
function enhanceInitialRows() {
  rowsEl?.querySelectorAll('.row').forEach((r) => {
    const subj = r.querySelector('.subject');
    const cred = r.querySelector('.credit');
    cred?.addEventListener('keydown', onlyDigitsFilter);
    cred?.addEventListener('input', () => {
      sanitizeOnInput(cred);
      calcAndSave();
    });
    subj?.addEventListener('input', calcAndSave);
  });
}

// 저장된 행 복원(이메일별)
function restoreRows() {
  const raw = localStorage.getItem(keyFor(ROWS_KEY_SUFFIX));
  if (!raw) return;
  let list = [];
  try {
    list = JSON.parse(raw) || [];
  } catch {}
  if (!Array.isArray(list)) return;

  // 기존 행 비우고 저장된 것으로 채우기
  rowsEl.innerHTML = '';
  list.forEach(({ subject, credit }) =>
    rowsEl.appendChild(createRow(subject, credit))
  );
}

// 행 추가
function addRow() {
  const row = createRow('', '');
  rowsEl.appendChild(row);
  scrollBox?.scrollTo({ top: scrollBox.scrollHeight, behavior: 'smooth' });
  // 포커스 주지 않으면 파란 테두리 문제 없음
  calcAndSave();
}

addBtn?.addEventListener('click', addRow);

// "입력 완료" → 합계 계산해서 로컬스토리지 저장
submitBtn?.addEventListener('click', (e) => {
  e.preventDefault(); // ← 이벤트 객체 제대로 받기
  calcAndSave(); // 저장
  submitBtn.disabled = true; // 중복클릭 방지
  window.location.href = 'information.html'; // 이동
});

// 초기화
restoreRows(); // 이메일별 저장값 복원
enhanceInitialRows();
calcAndSave(); // 합계 최신화
