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

  // ===== 대화 로그 localStorage 저장 =====
  const LOG_KEY = 'qai_chat_log';

  function saveLog(role, text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    const now = new Date().toISOString();

    const arr = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    arr.push({
      role, // 'USER' 또는 'BOT'
      text: trimmed, // 내용
      createdAt: now, // ISO 문자열
    });
    localStorage.setItem(LOG_KEY, JSON.stringify(arr));
  }

  // ===== 인증 토큰 =====
  const token = localStorage.getItem('qai_token');
  if (!token) {
    // 토큰 없으면 로그인 화면으로
    location.href = 'index.html';
    return;
  }

  // ===== 현재 대화 ID / 메시지 저장 키 =====
  let convId = localStorage.getItem('qai_conv_id') || null;
  let msgStoreKey = convId ? `qai_chat_messages_${convId}` : null;
  let history = [];

  const authHeaders = { Authorization: `Bearer ${token}` };

  function updateMsgStoreKey() {
    if (convId) {
      msgStoreKey = `qai_chat_messages_${convId}`;
    }
  }

  function saveHistory() {
    if (!msgStoreKey) return;
    try {
      localStorage.setItem(msgStoreKey, JSON.stringify(history));
    } catch (e) {
      console.error('채팅 저장 실패:', e);
    }
  }

  function loadHistory() {
    if (!msgStoreKey) return;
    try {
      const raw = localStorage.getItem(msgStoreKey);
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (!Array.isArray(stored)) return;
      history = stored;
      stored.forEach((m) => {
        addMessage(m.role, m.text, { save: false });
      });
      messages.scrollTop = messages.scrollHeight;
    } catch (e) {
      console.error('채팅 불러오기 실패:', e);
    }
  }

  // 말풍선 DOM 추가 (옵션: 저장 여부)
  function addMessage(role, text, opts = {}) {
    const { save = true } = opts;
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;

    if (save) {
      history.push({ role, text });
      saveHistory();
    }
    return el;
  }

  function addTypingMessage() {
    const el = document.createElement('div');
    el.className = 'msg ai typing';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'typing-dot';
      el.appendChild(dot);
    }

    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  // 대화 시작(없으면 생성)
  async function ensureConversation() {
    if (convId) return convId;

    const res = await fetch(API_BASE + PATHS.start, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({}),
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
    updateMsgStoreKey();
    // 새 대화는 비어 있으니 loadHistory()는 큰 의미 없지만, 안전상 한 번 호출
    loadHistory();
    return convId;
  }

  // 메세지 전송 -> 봇 답변 텍스트만 반환
  async function sendMessage(text) {
    const id = await ensureConversation();
    const res = await fetch(API_BASE + PATHS.send(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ text }),
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

    const data = await res.json();
    return data.text ?? '';
  }

  // 실제 API 호출 래퍼
  async function callAI(userText) {
    return await sendMessage(userText);
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

  // ===== 페이지 로드 시 기존 대화 복원 =====
  updateMsgStoreKey();
  loadHistory();

  // 전송 핸들러
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = (input.value || '').trim();
    if (!text) return;

    // 1) 화면에 사용자 말풍선 추가
    addMessage('user', text);
    // 2) localStorage에 USER 로그 저장
    saveLog('USER', text);

    input.value = '';
    autoGrow();

    // 3) AI 생각 중 말풍선 (...)
    // 3) AI 생각 중 말풍선 (점 세 개 파도 애니메이션)
    const typingEl = addTypingMessage();
    form
      .querySelector('button[type="submit"]')
      ?.setAttribute('disabled', 'true');

    try {
      const reply = await callAI(text);
      const finalText = reply || '응답이 비어있어.';

      // 타이핑 말풍선 제거
      typingEl.remove();

      // 실제 BOT 말풍선 추가 + history 저장
      addMessage('ai', finalText);
      saveLog('BOT', finalText);
    } catch (err) {
      console.error(err);
      const errMsg = '오류가 발생했어.\n잠시 후 다시 시도해줘.';

      typingEl.remove();
      addMessage('ai', errMsg);
      saveLog('BOT', errMsg);
    } finally {
      form.querySelector('button[type="submit"]')?.removeAttribute('disabled');
    }
  });
})();
