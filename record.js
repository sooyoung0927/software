(() => {
  // ===== 로그인 이메일별로 다른 로그 키 사용 =====
  const AUTH_EMAIL_KEY = 'qai_auth_email';
  const currentEmail = () =>
    (localStorage.getItem(AUTH_EMAIL_KEY) || '').trim().toLowerCase();

  const email = currentEmail();

  // ✅ 이메일별로 다른 로그 키
  //   -> chat.js에서도 saveLog 할 때 이 규칙(qai_chat_log_이메일)으로 저장해야 함
  const LOG_KEY = email ? `qai_chat_log_${email}` : 'qai_chat_log_guest'; // 이메일 없으면 guest

  const appBody = document.querySelector('.app-body');
  if (!appBody) return;

  // ===== 날짜 유틸 =====
  const toYMD = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    const yy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yy}-${mm}-${dd}`;
  };
  const fromYMD = (ymd) => {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  let currentYMD = toYMD(new Date()); // 기본: 오늘

  // ===== 상단 날짜 바 + 리스트 컨테이너 만들기 =====
  appBody.innerHTML = `
    <div class="day-bar">
      <button class="btn" id="prevDay" aria-label="이전 날">◀</button>
      <input type="date" id="datePick" />
      <button class="btn" id="nextDay" aria-label="다음 날">▶</button>
      <button class="btn" id="todayBtn">오늘</button>
      <span id="countBadge" style="margin-left:auto;color:#6b7a90;font-size:13px;"></span>
    </div>
    <div class="rec-list" id="recList"></div>
  `;

  const datePick = appBody.querySelector('#datePick');
  const prevDay = appBody.querySelector('#prevDay');
  const nextDay = appBody.querySelector('#nextDay');
  const todayBtn = appBody.querySelector('#todayBtn');
  const recList = appBody.querySelector('#recList');
  const countBadge = appBody.querySelector('#countBadge');

  datePick.value = currentYMD;

  // ===== localStorage에서 전체 로그 로드 =====
  function loadAllLogs() {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch (e) {
      console.error('로그 파싱 오류', e);
      return [];
    }
  }

  // 특정 날짜(YYYY-MM-DD)에 해당하는 로그만 필터
  function getLogsByDate(ymd) {
    const all = loadAllLogs();
    return all.filter((m) => {
      if (!m.createdAt) return false;
      const day = String(m.createdAt).slice(0, 10); // "2025-12-02"
      return day === ymd;
    });
  }

  // ===== 날짜 변경 시 데이터 로드 =====
  function loadDay(ymd) {
    currentYMD = ymd;
    datePick.value = ymd;

    const items = getLogsByDate(ymd);
    renderList(items);
  }

  // ===== 화면 렌더링용: USER + BOT 묶기 =====
  function groupByUserBot(items) {
    // 시간 순 정렬
    const sorted = [...items].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const groups = [];
    for (let i = 0; i < sorted.length; i++) {
      const msg = sorted[i];

      // USER 메시지 기준으로 카드 하나 만들기
      if (msg.role === 'USER') {
        const user = msg;
        let bot = null;

        const next = sorted[i + 1];
        if (next && next.role === 'BOT') {
          bot = next;
          i++; // BOT까지 같이 소비
        }

        groups.push({ user, bot });
      }
    }
    // 최근 것이 위로 오게 역순
    return groups.reverse();
  }

  // ===== 렌더링 =====
  function renderList(items) {
    const groups = groupByUserBot(items);

    if (!Array.isArray(groups) || groups.length === 0) {
      recList.innerHTML = `<div style="padding:12px;color:#6b7a90;">기록이 없습니다.</div>`;
      countBadge.textContent = '0개';
      return;
    }

    const fr = document.createDocumentFragment();

    groups.forEach(({ user, bot }) => {
      const wrap = document.createElement('div');
      wrap.className = 'rec-item';

      // 왼쪽: "사용자"
      const role = document.createElement('div');
      role.className = 'rec-role';
      role.textContent = '사용자';

      // 오른쪽 전체
      const main = document.createElement('div');
      main.className = 'rec-main';

      // 사용자 텍스트
      const userText = document.createElement('div');
      userText.className = 'rec-text rec-user-text';
      userText.textContent = user.text ?? '';

      // 사용자 시간
      const userTime = document.createElement('div');
      userTime.className = 'rec-time';
      const userDt = user.createdAt ? new Date(user.createdAt) : null;
      userTime.textContent = userDt
        ? userDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      main.appendChild(userText);
      main.appendChild(userTime);

      // ===== BOT 답변 영역 =====
      const botWrap = document.createElement('div');
      botWrap.className = 'rec-bot';

      if (bot) {
        const botLabel = document.createElement('div');
        botLabel.className = 'rec-bot-label';
        botLabel.textContent = '을지Q&AI';

        const botText = document.createElement('div');
        botText.className = 'rec-text rec-bot-text';
        botText.textContent = bot.text ?? '';

        const botTime = document.createElement('div');
        botTime.className = 'rec-time rec-bot-time';
        const botDt = bot.createdAt ? new Date(bot.createdAt) : null;
        botTime.textContent = botDt
          ? botDt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        botWrap.appendChild(botLabel);
        botWrap.appendChild(botText);
        botWrap.appendChild(botTime);
      } else {
        botWrap.appendChild(document.createTextNode('BOT 응답이 없습니다.'));
      }

      main.appendChild(botWrap);

      // 그리드 구조에 맞게 추가
      wrap.appendChild(role);
      wrap.appendChild(main);
      fr.appendChild(wrap);

      // 카드 클릭 시 BOT 영역 토글
      wrap.addEventListener('click', () => {
        wrap.classList.toggle('open');
      });
    });

    recList.innerHTML = '';
    recList.appendChild(fr);
    countBadge.textContent = `${groups.length}개`;
  }

  // ===== 이벤트 =====
  datePick.addEventListener('change', () => {
    const v = datePick.value;
    if (v) loadDay(v);
  });

  prevDay.addEventListener('click', () => {
    const d = fromYMD(currentYMD);
    d.setDate(d.getDate() - 1);
    loadDay(toYMD(d));
  });

  nextDay.addEventListener('click', () => {
    const d = fromYMD(currentYMD);
    d.setDate(d.getDate() + 1);
    loadDay(toYMD(d));
  });

  todayBtn.addEventListener('click', () => loadDay(toYMD(new Date())));

  // ===== 초기 로드 (오늘 날짜) =====
  loadDay(currentYMD);
})();
