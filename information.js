// information.js — 이메일별 로컬스토리지 + 서버 저장 (수정판)

// ===== 0) 초기: 로그인 이메일을 이메일 인풋에 주입 =====
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('qai_auth_email') || '';
  const emailInput = document.getElementById('email');
  if (emailInput) emailInput.value = saved;
});

// ===== 1) 상수/도움 함수 =====
const AUTH_EMAIL_KEY = 'qai_auth_email';

// 네임스페이스 유틸 (이메일마다 다른 키)
const NS = 'qai';
function currentEmail() {
  return (localStorage.getItem(AUTH_EMAIL_KEY) || '').trim().toLowerCase();
}
function keyFor(suffix) {
  const email = currentEmail() || '__noemail__';
  return `${NS}:${suffix}:${email}`;
}

// 키 접미사(이메일별 저장에 사용)
const PROFILE_KEY_SUFFIX = 'profile'; // 프로필 객체 {name, department, studentId, earned, total}
const EARNED_KEY_SUFFIX = 'earnedCredits'; // 수강 학점 합계
const TOTAL_KEY_SUFFIX = 'totalCredits'; // 총 필요 학점

// 백엔드 엔드포인트
const API_BASE = ''; // 예: 'https://majorapp.live'
const SAVE_PROFILE_URL = API_BASE + '/api/profile';

const $ = (sel) => document.querySelector(sel);
const emailEl = $('#email');
const nameEl = $('#name');
const departmentEl = $('#department'); // HTML에 id="department" 있어야 함
const sidEl = $('#studentId');
const earnedEl = $('#earned');
const totalEl = $('#total');
const donutEl = document.querySelector('.donut');

// 이메일별 프로필 불러오기/저장
function loadLocalProfile() {
  const raw = localStorage.getItem(keyFor(PROFILE_KEY_SUFFIX));
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveLocalProfile(partial) {
  const cur = loadLocalProfile();
  const next = { ...cur, ...partial };
  localStorage.setItem(keyFor(PROFILE_KEY_SUFFIX), JSON.stringify(next));
}

// 이메일별 earned/total 저장/로드
function loadEarned() {
  return Number(localStorage.getItem(keyFor(EARNED_KEY_SUFFIX)) || 0) || 0;
}
function loadTotal() {
  return Number(localStorage.getItem(keyFor(TOTAL_KEY_SUFFIX)) || 130) || 130;
}
function saveEarnedTotal(earned, total) {
  localStorage.setItem(keyFor(EARNED_KEY_SUFFIX), String(earned));
  localStorage.setItem(keyFor(TOTAL_KEY_SUFFIX), String(total));
}

// 도넛 업데이트
function updateDonut(earned = 0, total = 130) {
  if (!donutEl) return;
  earned = Math.max(0, Number(earned) || 0);
  total = Math.max(1, Number(total) || 130);
  const deg = Math.round(Math.min(1, earned / total) * 360);
  donutEl.style.background = `radial-gradient(#fff 48%, transparent 49%),
     conic-gradient(#143a74 0 ${deg}deg, #e6eefc ${deg}deg 360deg)`;
  if (earnedEl) earnedEl.textContent = String(earned);
  if (totalEl) totalEl.textContent = String(total);
}

function getCurrentCredits() {
  const earned = Number(earnedEl?.textContent || 0) || 0;
  const total = Number(totalEl?.textContent || 130) || 130;
  return { earned, total };
}

// 토스트
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

// ===== 2) 초기화 =====
async function init() {
  // 이메일 표시(읽기전용)
  const email = currentEmail();
  if (emailEl) {
    emailEl.value = email;
    emailEl.readOnly = true;
    emailEl.setAttribute('aria-readonly', 'true');
    ['beforeinput', 'paste', 'drop'].forEach((ev) =>
      emailEl.addEventListener(ev, (e) => e.preventDefault())
    );
  }

  // 이메일별 로컬 데이터 반영
  const prof = loadLocalProfile();
  if (nameEl) nameEl.value = prof.name ?? '';
  if (departmentEl) departmentEl.value = prof.department ?? '';
  if (sidEl) sidEl.value = prof.studentId ?? '';

  const earned = loadEarned() || prof.earned || 0;
  const total = loadTotal() || prof.total || 130;
  updateDonut(earned, total);

  // 입력 변경 → 이메일별 로컬 저장
  nameEl?.addEventListener('change', () =>
    saveLocalProfile({ name: (nameEl.value || '').trim() })
  );
  departmentEl?.addEventListener('change', () =>
    saveLocalProfile({ department: (departmentEl.value || '').trim() })
  );
  sidEl?.addEventListener('change', () =>
    saveLocalProfile({ studentId: (sidEl.value || '').trim() })
  );

  // 계산기 이동
  document.getElementById('openScore')?.addEventListener('click', () => {
    location.href = 'score.html';
  });

  // 저장하기 → 서버 전송 + 로컬 저장
  document
    .getElementById('saveProfile')
    ?.addEventListener('click', async () => {
      const payload = {
        email,
        name: (nameEl?.value || '').trim(),
        department: (departmentEl?.value || '').trim(),
        studentId: (sidEl?.value || '').trim(),
        ...getCurrentCredits(), // { earned, total }
      };

      if (!payload.email) return toast('로그인 이메일이 없습니다.');
      if (!payload.name) return toast('이름을 입력해 주세요.');
      if (!payload.department) return toast('학과/학부를 입력해 주세요.');
      if (!payload.studentId) return toast('학번을 입력해 주세요.');

      // 로컬 저장(이메일별)
      saveLocalProfile({
        name: payload.name,
        department: payload.department,
        studentId: payload.studentId,
        earned: payload.earned,
        total: payload.total,
      });
      saveEarnedTotal(payload.earned, payload.total);

      // 서버로 전송
      try {
        const res = await fetch(SAVE_PROFILE_URL || '/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: payload.email,
            name: payload.name,
            department: payload.department,
            studentId: payload.studentId,
            earnedCredits: payload.earned,
            totalCredits: payload.total,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast('저장 완료!');
      } catch (e) {
        console.error(e);
        toast('저장 실패. 잠시 후 다시 시도해 주세요.');
      }
      location.href = 'my.html';
    });
}

init();
