(() => {
  const API_BASE = 'https://majorapp.live';
  const PATHS = {
    start: '/api/chat/start', // POST -> { convId }
    send: (id) => `/api/chat/${id}/send`, // POST -> { id, role, text, createdAt }
    list: '/api/chat/conversations', // GET  -> [{ id, createdAt }, ...]
  };

  const form = document.getElementById('composer');
  const input = document.getElementById('composerInput');
  const messages = document.getElementById('messages');
  if (!form || !input || !messages) return;

  // ===== 인증 토큰 =====
  const token = localStorage.getItem('qai_token');
  if (!token) {
    // 토큰 없으면 로그인 화면으로
    location.href = 'index.html';
    return;
  }

  // ===== 현재 대화 ID (재방문 시 이어붙이려면 localStorage에 저장) =====
  let convId = localStorage.getItem('qai_conv_id') || null;

  // 공통 헤더
  const authHeaders = { Authorization: `Bearer ${token}` };

  // 대화 시작(없으면 생성)
  async function ensureConversation() {
    if (convId) return convId;

    const res = await fetch(API_BASE + PATHS.start, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({}), // 사양상 본문 불필요하면 빈 객체
    });

    if (res.status === 401) {
      localStorage.removeItem('qai_token');
      location.href = 'index.html';
      return;
    }

    if (!res.ok) {
      throw new Error('대화를 시작할 수 없습니다.');
    }

    const data = await res.json(); // { convId: "..." }
    convId = data.convId;
    localStorage.setItem('qai_conv_id', convId);
    return convId;
  }

  // 메세지 전송 -> 봇 답변 텍스트만 반환
  async function sendMessage(text) {
    const id = await ensureConversation();
    const res = await fetch(API_BASE + PATHS.send(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ text }), // 사진 예시와 동일 {"text":"안녕!"}
    });

    if (res.status === 401) {
      localStorage.removeItem('qai_token');
      location.href = 'index.html';
      return '';
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || '메세지 전송 실패');
    }

    // 응답 예시:
    // { "id": 6, "role":"BOT", "text":"안녕하세요! ...", "createdAt":"..." }
    const data = await res.json();
    return data.text ?? '';
  }

  // 말풍선 DOM 추가
  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  // textarea 자동 높이
  const autoGrow = () => {
    const style = window.getComputedStyle(input);
    const lineHeight = parseFloat(style.lineHeight) || 20;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const borderTop = parseFloat(style.borderTopWidth) || 0;
    const borderBottom = parseFloat(style.borderBottomWidth) || 0;
    const maxLines = 3;
    const maxHeight =
      lineHeight * maxLines +
      paddingTop +
      paddingBottom +
      borderTop +
      borderBottom;
    input.style.height = 'auto';
    const next = Math.min(input.scrollHeight, maxHeight);
    input.style.height = next + 'px';
    input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };
  input.addEventListener('input', autoGrow);
  autoGrow();

  // Enter 전송 (Shift+Enter는 줄바꿈)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  // 실제 API 호출 래퍼 (기존 callAI 대체)
  async function callAI(userText) {
    // 필요 시: 최초 진입 때 과거 conv 이어붙이고 싶으면 아래처럼 목록 조회 후 마지막 conv 선택
    // if (!convId) {
    //   const r = await fetch(API_BASE + PATHS.list, { headers: authHeaders });
    //   if (r.ok) {
    //     const arr = await r.json(); // [{id, createdAt}]
    //     if (Array.isArray(arr) && arr.length) {
    //       convId = arr[arr.length - 1].id;
    //       localStorage.setItem('qai_conv_id', convId);
    //     }
    //   }
    // }
    return await sendMessage(userText);
  }

  // 전송 핸들러
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = (input.value || '').trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';
    autoGrow();

    const thinkingEl = addMessage('ai', '…');
    form
      .querySelector('button[type="submit"]')
      ?.setAttribute('disabled', 'true');

    try {
      const reply = await callAI(text);
      thinkingEl.textContent = reply || '응답이 비어있어.';
    } catch (err) {
      console.error(err);
      thinkingEl.textContent = '오류가 발생했어. 잠시 후 다시 시도해줘.';
    } finally {
      form.querySelector('button[type="submit"]')?.removeAttribute('disabled');
    }
  });
})();
