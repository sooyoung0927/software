(() => {
  // const API_BASE = 'https://majorapp.live';
  // const PATHS = {
  //   byDate: (convId, ymd) =>
  //     `/api/chat/${convId}/messages/by-date?date=${encodeURIComponent(ymd)}`,
  // };

  // const appBody = document.querySelector('.app-body');
  // if (!appBody) return;

  // // ===== 인증/대화 ID =====
  // // const token = localStorage.getItem('qai_token');
  // // const convId = localStorage.getItem('qai_conv_id');

  // // if (!token || !convId) {
  // //   location.href = 'index.html';
  // //   return;
  // // }

  // const headers = { Authorization: `Bearer ${token}` };

  // ==== DEMO MODE (백엔드 없이 동작) ====
  const MOCK = true; // <- 배포되면 false로 바꾸기

  // 샘플/저장 유틸
  const LSK = {
    token: 'qai_token',
    conv: 'qai_conv_id',
    store: 'qai_mock_messages', // [{convId, role, text, createdAt}]
  };

  function mockInit() {
    // 토큰/convId 없으면 가짜로 심어둠
    if (!localStorage.getItem(LSK.token))
      localStorage.setItem(LSK.token, 'DEMO_TOKEN');
    if (!localStorage.getItem(LSK.conv))
      localStorage.setItem(LSK.conv, 'DEMO_CONV');

    // 메시지 없으면 샘플 시드
    if (!localStorage.getItem(LSK.store)) {
      const now = new Date();
      const iso = (d) => d.toISOString();
      const msgs = [
        {
          convId: 'DEMO_CONV',
          role: 'USER',
          text: '안녕!',
          createdAt: iso(new Date(now.getTime() - 60_000)),
        },
        {
          convId: 'DEMO_CONV',
          role: 'BOT',
          text: '안녕하세요! 어떻게 도와드릴까요?',
          createdAt: iso(now),
        },
      ];
      localStorage.setItem(LSK.store, JSON.stringify(msgs));
    }
  }

  function mockByDate(convId, ymd) {
    const all = JSON.parse(localStorage.getItem(LSK.store) || '[]');
    return all.filter(
      (m) => m.convId === convId && (m.createdAt || '').slice(0, 10) === ymd
    );
  }

  const API_BASE = 'https://majorapp.live';
  const PATHS = {
    byDate: (convId, ymd) =>
      `/api/chat/${convId}/messages/by-date?date=${encodeURIComponent(ymd)}`,
  };

  const appBody = document.querySelector('.app-body');
  if (!appBody) return;

  if (MOCK) mockInit();

  const token = localStorage.getItem('qai_token');
  const convId = localStorage.getItem('qai_conv_id');

  // 백엔드 없는 데모에선 리다이렉트 하지 않음
  if (!MOCK && (!token || !convId)) {
    location.href = 'index.html';
    return;
  }
  const headers = { Authorization: `Bearer ${token}` };

  // 여기까지 데모코드

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

  // ===== 상단 날짜 바 + 리스트 컨테이너 생성 =====
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

  // ===== 데이터 로드 =====
  // async function loadDay(ymd) {
  //   currentYMD = ymd;
  //   datePick.value = ymd;
  //   recList.innerHTML = `<div style="padding:12px;color:#6b7a90;">불러오는 중…</div>`;

  //   try {
  //     const res = await fetch(API_BASE + PATHS.byDate(convId, ymd), {
  //       headers,
  //     });
  //     if (res.status === 401) {
  //       localStorage.removeItem('qai_token');
  //       location.href = 'index.html';
  //       return;
  //     }
  //     if (!res.ok) throw new Error('조회 실패');

  //     // 응답 예시: [{ id, role: "USER"|"BOT", text, createdAt }]
  //     const arr = await res.json();
  //     renderList(arr);
  //   } catch (e) {
  //     console.error(e);
  //     recList.innerHTML = `<div style="padding:12px;color:#e74c3c;">오류가 발생했어. 잠시 후 다시 시도해줘.</div>`;
  //     countBadge.textContent = '';
  //   }
  // }

  async function loadDay(ymd) {
    currentYMD = ymd;
    datePick.value = ymd;
    recList.innerHTML = `<div style="padding:12px;color:#6b7a90;">불러오는 중…</div>`;

    try {
      let arr;
      if (MOCK) {
        // 로컬스토리지에서 날짜별 메시지 조회
        arr = mockByDate(convId || 'DEMO_CONV', ymd);
      } else {
        const res = await fetch(API_BASE + PATHS.byDate(convId, ymd), {
          headers,
        });
        if (res.status === 401) {
          localStorage.removeItem('qai_token');
          location.href = 'index.html';
          return;
        }
        if (!res.ok) throw new Error('조회 실패');
        arr = await res.json();
      }
      renderList(arr);
    } catch (e) {
      console.error(e);
      recList.innerHTML = `<div style="padding:12px;color:#e74c3c;">오류가 발생했어. 잠시 후 다시 시도해줘.</div>`;
      countBadge.textContent = '';
    }
  }
  // 여기까지 데모

  // ===== 렌더링 =====
  function renderList(items) {
    if (!Array.isArray(items) || items.length === 0) {
      recList.innerHTML = `<div style="padding:12px;color:#6b7a90;">기록이 없습니다.</div>`;
      countBadge.textContent = '0개';
      return;
    }

    const fr = document.createDocumentFragment();
    items.forEach((m) => {
      const wrap = document.createElement('div');
      wrap.className = 'rec-item';

      const role = document.createElement('div');
      role.className = 'rec-role';
      role.textContent = m.role === 'USER' ? '사용자' : 'BOT';

      const body = document.createElement('div');
      const text = document.createElement('div');
      text.className = 'rec-text';
      text.textContent = m.text ?? '';

      const time = document.createElement('div');
      time.className = 'rec-time';
      // createdAt(UTC ISO)을 로컬 시간으로 표시
      const dt = m.createdAt ? new Date(m.createdAt) : null;
      time.textContent = dt
        ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      body.appendChild(text);
      body.appendChild(time);

      wrap.appendChild(role);
      wrap.appendChild(body);
      fr.appendChild(wrap);
    });

    recList.innerHTML = '';
    recList.appendChild(fr);
    countBadge.textContent = `${items.length}개`;
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

  // ===== 초기 로드 =====
  loadDay(currentYMD);
})();
