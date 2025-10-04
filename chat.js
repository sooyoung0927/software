(() => {
  const form = document.getElementById('composer');
  const input = document.getElementById('composerInput');
  const messages = document.getElementById('messages');

  if (!form || !input || !messages) return;

  // 말풍선 DOM 추가
  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    el.textContent = text;
    messages.appendChild(el);
    // 스크롤 맨 아래로
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  // textarea 자동 높이
  const autoGrow = () => {
    const style = window.getComputedStyle(input);
    const lineHeight = parseFloat(style.lineHeight) || 20; // fallback
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

    input.style.height = 'auto'; // 내용에 맞춰 먼저 줄였다가
    const next = Math.min(input.scrollHeight, maxHeight);
    input.style.height = next + 'px';

    // 3줄 넘으면 내부 스크롤 활성(바는 위 CSS로 숨김)
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

  // 실제 API 연동 (나중에 이 함수만 바꿔 연결)
  async function callAI(userText) {
    // TODO: 여기에 백엔드 엔드포인트 붙여줘
    // 예시:
    // const res = await fetch('/api/chat', {
    //   method: 'POST',
    //   headers: {'Content-Type':'application/json'},
    //   body: JSON.stringify({ message: userText }),
    //   credentials: 'include',
    // });
    // const data = await res.json();
    // return data.reply;

    // 데모용 딜레이 응답
    await new Promise((r) => setTimeout(r, 600));
    return `(${userText}) 에 대한 답변 예시`;
  }

  // 전송 핸들러
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = (input.value || '').trim();
    if (!text) return;

    // 1) 사용자 말풍선
    addMessage('user', text);

    // 초기화
    input.value = '';
    autoGrow();

    // 2) 로딩 플레이스홀더(점 세 개)
    const thinkingEl = addMessage('ai', '…');

    try {
      const reply = await callAI(text);
      thinkingEl.textContent = reply;
    } catch (err) {
      thinkingEl.textContent = '오류가 발생했어. 잠시 후 다시 시도해줘.';
      console.error(err);
    }
  });
})();
