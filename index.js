// // ===== 설정 =====
// const API_BASE = 'https://majorapp.live'; // 백엔드 베이스 URL (필요에 맞게 수정)
// const PATHS = {
//   signup: '/auth/signup', // ① 회원가입 (응답: { userId, token })
//   login: '/auth/login', // ② 로그인   (응답: { userId, token })
//   me: '/users/me', // ③ 개인정보 확인 (GET, Authorization: Bearer <token>)
// };

// // ===== 요소 =====
// const input = document.querySelector('.input-wrap input');
// const app = document.querySelector('.app');

// // ===== 에러 슬롯(레이아웃 고정) + 문구 =====
// const err = document.createElement('p');
// err.className = 'email-error';
// err.style.cssText = `
//   margin: 0; width: 100%; text-align: center; font-size: 14px; color: #e74c3c;
//   line-height: 1.4; opacity: 0; visibility: hidden; transition: opacity 160ms ease;
// `;
// err.setAttribute('role', 'alert');
// err.setAttribute('aria-live', 'polite');

// const slot = document.createElement('div');
// slot.style.cssText = `height:22px; margin:6px 0 0; display:flex; align-items:center; justify-content:center;`;
// slot.appendChild(err);
// input.closest('.input-wrap').appendChild(slot);

// // ===== 검증 =====
// const EMAIL_RE = /^[A-Za-z0-9._%+-]+@g\.eulji\.ac\.kr$/i;
// const validateEmail = (v) => EMAIL_RE.test(v.trim());

// function showError(msg) {
//   err.textContent = msg;
//   err.style.visibility = 'visible';
//   err.style.opacity = '1';
//   input.setAttribute('aria-invalid', 'true');
//   input.style.borderColor = '#e74c3c';
//   input.style.boxShadow = '0 0 0 4px rgba(231,76,60,.03)';
// }

// function clearError() {
//   err.style.opacity = '0';
//   setTimeout(() => {
//     err.style.visibility = 'hidden';
//     err.textContent = '';
//   }, 160);
//   input.removeAttribute('aria-invalid');
//   input.style.borderColor = '#d6e3f6';
//   input.style.boxShadow = 'none';
// }

// // ===== 가려짐 방지(모바일 키보드) =====
// function ensureVisible(el) {
//   const vv = window.visualViewport;
//   const rect = el.getBoundingClientRect();
//   const vh = vv ? vv.height : window.innerHeight;
//   const topOffset = vv ? vv.offsetTop : 0;
//   const bottomLimit = topOffset + vh - 12;
//   const needsScroll = rect.bottom > bottomLimit || rect.top < topOffset + 12;
//   if (needsScroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
// }

// input.addEventListener('focus', () => {
//   clearError();
//   setTimeout(() => ensureVisible(input), 150);
// });
// input.addEventListener('input', clearError);
// if (window.visualViewport) {
//   window.visualViewport.addEventListener('resize', () => {
//     const kbOverlap = Math.max(
//       0,
//       (window.innerHeight || document.documentElement.clientHeight) -
//         window.visualViewport.height
//     );
//     app.style.paddingBottom = kbOverlap
//       ? Math.min(kbOverlap, 120) + 'px'
//       : '0px';
//     ensureVisible(input);
//   });
// }

// document.addEventListener('keydown', (e) => {
//   if (e.key === 'Enter') trySubmit();
// });

// // ===== 공통 fetch 래퍼 =====
// async function postJSON(path, body) {
//   const res = await fetch(API_BASE + path, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(body),
//   });
//   const data = await res.json().catch(() => ({}));
//   return { ok: res.ok, status: res.status, data };
// }

// async function getJSON(path, token) {
//   const res = await fetch(API_BASE + path, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   const data = await res.json().catch(() => ({}));
//   return { ok: res.ok, status: res.status, data };
// }

// // ===== 토큰/프로필 보관 유틸 =====
// function saveAuth({ email, userId, token, profile }) {
//   localStorage.setItem('qai_auth_email', email);
//   localStorage.setItem('qai_user_id', String(userId));
//   localStorage.setItem('qai_token', token); // 백엔드 문서에 "로그인 토큰 발급(기억해야 함)" 명시됨
//   if (profile) localStorage.setItem('qai_profile', JSON.stringify(profile));
// }

// // ===== 제출 흐름 =====
// async function trySubmit() {
//   const email = input.value.trim();

//   if (!validateEmail(email)) {
//     showError('학교 이메일(@g.eulji.ac.kr) 형식으로 입력하세요.');
//     ensureVisible(input);
//     return;
//   }

//   clearError();
//   input.disabled = true;

//   try {
//     // 1) 로그인 먼저 시도
//     let { ok, status, data } = await postJSON(PATHS.login, { email });

//     // 2) 미등록 등으로 실패(예: 404/401/400) 시 회원가입 → 다시 로그인
//     if (!ok && [400, 401, 404].includes(status)) {
//       const reg = await postJSON(PATHS.signup, { email });
//       if (!reg.ok) {
//         // 이미 존재하면 409가 올 수도 있음 → 그냥 로그인 재시도
//         if (reg.status !== 409)
//           return showError(reg.data?.message || '회원가입에 실패했습니다.');
//       } else if (reg.data?.token) {
//         // 토큰 줬다면 여기서 바로 저장/프로필 조회 후 진행
//         const { userId, token } = reg.data;
//         const me = await getJSON(PATHS.me, token);
//         saveAuth({
//           email,
//           userId,
//           token,
//           profile: me.ok ? me.data : undefined,
//         });
//         return (location.href = 'chat.html');
//       }
//       // 회원가입 성공 but 토큰 없음 → 로그인 재시도
//       ({ ok, status, data } = await postJSON(PATHS.login, { email }));
//       if (!ok) return showError(data?.message || '로그인에 실패했습니다.');
//     }

//     // 여기 도달하면 로그인 성공: { userId, token }
//     const { userId, token } = data || {};
//     if (!token) {
//       showError('토큰이 응답에 없습니다.');
//       return;
//     }

//     // 3) /me로 개인정보 확인
//     const me = await getJSON(PATHS.me, token); // { id, email, name, department, studentId }
//     if (!me.ok) {
//       // 프로필 조회 실패해도 치명적이진 않으니 토큰만 저장하고 진행
//       console.warn('profile fetch failed', me);
//       saveAuth({ email, userId, token });
//     } else {
//       saveAuth({ email, userId, token, profile: me.data });
//     }

//     // 4) 다음 화면 이동
//     location.href = 'chat.html';
//   } catch (e) {
//     console.error(e);
//     showError('잠시 후 다시 시도해 주세요.');
//   } finally {
//     input.disabled = false;
//   }
// }
// ===== 요소 =====
// ===== 요소 =====
const input = document.querySelector('.input-wrap input');
const app = document.querySelector('.app');

// ===== 에러 슬롯(레이아웃 고정) + 문구 =====
const err = document.createElement('p');
err.className = 'email-error';
err.style.cssText = `
  margin: 0; width: 100%; text-align: center; font-size: 14px; color: #e74c3c;
  line-height: 1.4; opacity: 0; visibility: hidden; transition: opacity 160ms ease;
`;
err.setAttribute('role', 'alert');
err.setAttribute('aria-live', 'polite');

const slot = document.createElement('div');
slot.style.cssText = `height:22px; margin:6px 0 0; display:flex; align-items:center; justify-content:center;`;
slot.appendChild(err);
input.closest('.input-wrap').appendChild(slot);

// ===== 이메일 검증 (일반 이메일 형식 허용) =====
const EMAIL_RE_ANY = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateEmail = (v) => EMAIL_RE_ANY.test(v.trim());

function showError(msg) {
  err.textContent = msg;
  err.style.visibility = 'visible';
  err.style.opacity = '1';
  input.setAttribute('aria-invalid', 'true');
  input.style.borderColor = '#e74c3c';
  input.style.boxShadow = '0 0 0 4px rgba(231,76,60,.03)';
}

function clearError() {
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
  if (needsScroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

input.addEventListener('focus', () => {
  clearError();
  setTimeout(() => ensureVisible(input), 150);
});
input.addEventListener('input', clearError);

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

// ===== 제출 핸들러 =====
function trySubmit() {
  const email = input.value.trim();

  if (!validateEmail(email)) {
    showError('올바른 이메일 형식으로 입력해줘.');
    ensureVisible(input);
    return;
  }

  // ✅ 개발용: 토큰/유저/프로필 더미 저장 → chat.html 가드 통과
  try {
    localStorage.setItem('qai_auth_email', email);
    localStorage.setItem('qai_token', '__dev_token__'); // chat.html에서 이 키를 검사할 확률이 높음
    localStorage.setItem('qai_user_id', '0');
    // 혹시 프로필을 참조하면 대비
    const dummyProfile = {
      id: 0,
      email,
      name: 'Guest',
      department: 'N/A',
      studentId: 'N/A',
    };
    localStorage.setItem('qai_profile', JSON.stringify(dummyProfile));
  } catch (_) {}

  location.href = 'chat.html';
}

// Enter로 제출
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') trySubmit();
});

// 폼 기본 제출 막고 JS로 처리
document.querySelector('form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  trySubmit();
});

// 버튼 클릭으로도 제출 (버튼이 있을 때만)
document.querySelector('.next-btn')?.addEventListener('click', trySubmit);
