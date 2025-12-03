(() => {
  const ONE_HOUR_MS = 60 * 60 * 1000; // 1시간 기준

  // 🔐 로그인 이메일 기반 키 만들기
  const AUTH_EMAIL_KEY = 'qai_auth_email';
  const currentEmail = () =>
    (localStorage.getItem(AUTH_EMAIL_KEY) || '').trim().toLowerCase();

  const email = currentEmail();

  // 👉 이메일별로 서로 다른 key를 사용
  const MSG_STORE_KEY = email
    ? `qai_chat_messages_${email}`
    : 'qai_chat_messages_guest';

  // (선택) 대화기록 보기용 로그도 이메일별로 분리하고 싶으면 이렇게:
  const LOG_KEY = email ? `qai_chat_log_${email}` : 'qai_chat_log_guest';
  // 만약 대화기록 페이지에서 여전히 'qai_chat_log'만 읽고 있다면,
  // 그 페이지 JS에서도 LOG_KEY를 위 규칙으로 맞춰줘야 한다는 점만 기억해줘.

  const form = document.getElementById('composer');
  const input = document.getElementById('composerInput');
  const messages = document.getElementById('messages');
  if (!form || !input || !messages) return;

  function stripTags(str) {
    return String(str || '').replace(/<[^>]*>/g, '');
  }

  // ===== 대화 로그 localStorage 저장 (대화기록 보기용) =====
  function saveLog(role, text) {
    const trimmed = stripTags(text).trim();
    if (!trimmed) return;
    const now = new Date().toISOString();

    const arr = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    arr.push({
      role, // 'USER' 또는 'BOT'
      text: trimmed,
      createdAt: now,
    });
    localStorage.setItem(LOG_KEY, JSON.stringify(arr));
  }

  // ===== 대화 내용 저장용(프론트 전용, 이메일별 key) =====
  let msgStoreKey = MSG_STORE_KEY;
  // { role, text, createdAt, html } 구조
  let history = [];

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

      const now = Date.now();

      stored.forEach((m) => {
        if (!m || !m.text) return;
        if (!m.createdAt) return;

        const createdTime = new Date(m.createdAt).getTime();
        if (Number.isNaN(createdTime)) return;

        // 1시간 이내의 메시지만 화면에 렌더링
        if (now - createdTime <= ONE_HOUR_MS) {
          addMessage(m.role, m.text, {
            save: false,
            createdAt: m.createdAt,
            html: !!m.html,
          });
        }
      });

      messages.scrollTop = messages.scrollHeight;
    } catch (e) {
      console.error('채팅 불러오기 실패:', e);
    }
  }

  // 말풍선 DOM 추가 (opts: { save, createdAt, html })
  function addMessage(role, text, opts = {}) {
    const {
      save = true,
      createdAt = new Date().toISOString(),
      html = false,
    } = opts;

    const el = document.createElement('div');
    el.className = `msg ${role}`;
    if (html) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
    el.dataset.createdAt = createdAt;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;

    if (save) {
      history.push({ role, text, createdAt, html });
      saveHistory();
    }

    // 1시간 지나면 화면에서만 제거
    const createdTime = new Date(createdAt).getTime();
    if (!Number.isNaN(createdTime)) {
      const delay = Math.max(0, createdTime + ONE_HOUR_MS - Date.now());
      setTimeout(() => {
        if (el.isConnected) {
          el.remove();
        }
      }, delay);
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

  // ===== 프론트 전용 "AI" 응답 (간단 Q&A 룰) =====
  // 반환값: { text, html }  (html=true면 innerHTML로 렌더링)
  async function callAI(userText) {
    const q = (userText || '').trim();
    const norm = q.replace(/\s+/g, '').toLowerCase();
    const normUpper = q.replace(/\s+/g, '').toUpperCase();

    // 살짝 딜레이 (타이핑 효과 보이게)
    await new Promise((res) => setTimeout(res, 600));

    if (
      norm === '안녕' ||
      norm === '안녕하세요' ||
      norm.startsWith('안녕하') ||
      norm.includes('안녕?')
    ) {
      return {
        text: '안녕하세요. 무엇을 도와드릴까요?',
        html: false,
      };
    }

    if (
      norm.includes('수강신청') &&
      (norm.includes('내년') || norm.includes('2026'))
    ) {
      const html =
        '2026학년도 1학기 신·편입생 수강신청 및 재학생 수강신청은 2월 25(수)~27(금)입니다. ' +
        '<a href="https://eis.eu.ac.kr/nxui/index.html" target="_blank" rel="noopener noreferrer">(학사일정 바로가기)</a>';
      return {
        text: html,
        html: true,
      };
    }

    if (
      normUpper.includes('EIS') &&
      (norm.includes('비번') ||
        norm.includes('비밀번호') ||
        norm.includes('비번까먹') ||
        norm.includes('비밀번호까먹'))
    ) {
      const text =
        '대전 캠퍼스는 042-259-1581,\n' +
        '성남 · 의정부 캠퍼스는 031-740-7190 로 연결 후 “비밀번호 분실했습니다” 라고 말씀하시면\n' +
        '안내받을 수 있습니다.\n' +
        '해당 내용은 [FAQ] 에서도 확인하실 수 있습니다.';
      return { text, html: false };
    }

    // 그 외: 데모용 기본 응답
    const fallback =
      '지금은 백엔드 서버 없이 동작하는 데모 모드야.\n' +
      '그래서 아직 등록되지 않은 질문에는 실제 AI 답변 대신, 네가 보낸 내용을 그대로 보여줄게.\n\n' +
      `• 너의 메시지: "${userText}"`;
    return { text: fallback, html: false };
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
  loadHistory();

  // 전송 핸들러
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = (input.value || '').trim();
    if (!text) return;

    const nowIso = new Date().toISOString();

    // 1) 화면에 사용자 말풍선 추가
    addMessage('user', text, { createdAt: nowIso, html: false });

    // 2) 대화기록 보기용 로그
    saveLog('USER', text);

    input.value = '';
    autoGrow();

    // 3) AI 생각 중 말풍선
    const typingEl = addTypingMessage();
    form
      .querySelector('button[type="submit"]')
      ?.setAttribute('disabled', 'true');

    try {
      const replyObj = await callAI(text);
      const finalText = replyObj?.text || '응답이 비어있어.';
      const isHtml = !!replyObj?.html;

      typingEl.remove();

      const botCreatedAt = new Date().toISOString();
      addMessage('ai', finalText, { createdAt: botCreatedAt, html: isHtml });
      saveLog('BOT', finalText);
    } catch (err) {
      console.error(err);
      const errMsg = '오류가 발생했어.\n잠시 후 다시 시도해줘.';

      typingEl.remove();
      const errCreatedAt = new Date().toISOString();
      addMessage('ai', errMsg, { createdAt: errCreatedAt, html: false });
      saveLog('BOT', errMsg);
    } finally {
      form.querySelector('button[type="submit"]')?.removeAttribute('disabled');
    }
  });
})();
