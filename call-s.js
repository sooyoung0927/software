// call.js — 전화번호부 데이터 + 검색 + 렌더
// ⚠️ 스크린샷 숫자는 내가 임의로 확정할 수 없으니 샘플만 두고 형식을 맞춰 넣도록 했어.

const DATA = [
  // 건물, 부서및학과, 층, 호수, 전화(하이픈 포함), 비고(optional)
  // === 본관 ===
  {
    building: '본관',
    dept: '총장실',
    floor: '7층',
    room: '702호',
    tel: '031-740-7102',
  },
  {
    building: '본관',
    dept: '부속실',
    floor: '7층',
    room: '703호',
    tel: '031-740-7103',
  },
  {
    building: '본관',
    dept: '기획조정팀',
    floor: '7층',
    room: '707호',
    tel: '031-740-7430',
  },
  {
    building: '본관',
    dept: '예산팀',
    floor: '7층',
    room: '707호',
    tel: '031-740-7430',
  }, // 확인필요(예산팀 번호 동일 표기인지)
  {
    building: '본관',
    dept: '대외동문협력팀',
    floor: '6층',
    room: '618호',
    tel: '031-740-7467',
  },
  {
    building: '본관',
    dept: '학생지원팀',
    floor: '2층',
    room: '202호',
    tel: '031-740-7111',
  },
  {
    building: '본관',
    dept: '입학관리팀',
    floor: '5층',
    room: '505호',
    tel: '031-740-7374,7325',
  },
  {
    building: '본관',
    dept: '홍보팀',
    floor: '6층',
    room: '618호',
    tel: '031-740-7330',
  },
  {
    building: '본관',
    dept: '데이터성과분석팀',
    floor: '5층',
    room: '506호',
    tel: '031-740-7432',
  }, // 확인필요(끝자리 2로 보임)
  {
    building: '본관',
    dept: '전산정보팀',
    floor: '4층',
    room: '405호',
    tel: '031-740-7190,7263',
  }, // 확인필요
  {
    building: '본관',
    dept: '웹센터',
    floor: '4층',
    room: '403호',
    tel: '031-740-7261',
  },
  {
    building: '본관',
    dept: '전자현미경실',
    floor: '4층',
    room: '407호',
    tel: '031-740-7285',
  },
  {
    building: '본관',
    dept: '총무관리팀',
    floor: '2층',
    room: '207호',
    tel: '031-740-7115',
  },
  {
    building: '본관',
    dept: '경리팀',
    floor: '2층',
    room: '207호',
    tel: '031-740-7249',
  },
  {
    building: '본관',
    dept: '시설관리팀',
    floor: '2층',
    room: '201호',
    tel: '031-740-7113',
  },
  {
    building: '본관',
    dept: '국제보건의료센터',
    floor: '2층',
    room: '203호',
    tel: '031-740-7533',
  },

  // 교무지원팀 묶음(본관 1층 106호) — 표에 하위업무가 나뉘어 있어도 전화는 개별 번호로 표기되어 있음
  {
    building: '본관',
    dept: '교무지원팀)',
    floor: '1층',
    room: '106호',
    tel: '031-740-7372',
  },

  {
    building: '본관',
    dept: '교수학습지원센터',
    floor: '1층',
    room: '102호',
    tel: '031-740-7392',
  },
  {
    building: '본관',
    dept: '종합서비스센터',
    floor: '1층',
    room: '106호',
    tel: '031-740-7300',
  },
  {
    building: '본관',
    dept: '범석의학박물관',
    floor: '8층',
    room: '--',
    tel: '031-740-7339',
  },

  // === 범석관 ===
  {
    building: '범석관',
    dept: '임상병리학과',
    floor: 'B1층',
    room: 'B144호',
    tel: '031-740-7268',
  },
  {
    building: '범석관',
    dept: '방사선학과',
    floor: 'B1층',
    room: 'B158호',
    tel: '031-740-7245',
  },
  {
    building: '범석관',
    dept: '예비군대대',
    floor: '3층',
    room: 'B133호',
    tel: '031-740-7222',
  },
  {
    building: '범석관',
    dept: '치위생학과',
    floor: '2층',
    room: '201호',
    tel: '031-740-7247',
  },
  {
    building: '범석관',
    dept: '물리치료학과',
    floor: '3층',
    room: '301호',
    tel: '031-740-7244',
  },
  {
    building: '범석관',
    dept: '안경광학과',
    floor: '1층',
    room: '102호',
    tel: '031-740-7242',
  },
  {
    building: '범석관',
    dept: '응급구조학과',
    floor: '1층',
    room: 'B169호',
    tel: '031-740-7236',
  },
  {
    building: '범석관',
    dept: '학술정보원',
    floor: '6층',
    room: '603호',
    tel: '031-740-7123,7402',
  }, // 확인필요(끝자리 7402로 보임)

  // === 지천관(체육관) ===
  {
    building: '지천관(체육관)',
    dept: '안전공학전공',
    floor: 'B1층',
    room: 'B134호',
    tel: '031-740-7230,7269',
  },

  // === 뉴밀레니엄센터 ===
  {
    building: '뉴밀레니엄센터',
    dept: '평생교육팀',
    floor: '6층',
    room: '601-1호',
    tel: '031-740-7283',
  },
  {
    building: '뉴밀레니엄센터',
    dept: '간호학과',
    floor: '4층',
    room: '403-2호',
    tel: '031-740-7237',
  },

  // === 창의관 ===
  {
    building: '창의관',
    dept: '취창업지원센터',
    floor: '3층',
    room: '303호',
    tel: '031-740-7279',
  },
  {
    building: '창의관',
    dept: '학보사',
    floor: '5층',
    room: '503호',
    tel: '031-740-7126',
  },
  {
    building: '창의관',
    dept: '학생생활상담실',
    floor: '3층',
    room: '304호',
    tel: '031-740-7463,7540',
  },
  {
    building: '창의관',
    dept: '양성평등상담실',
    floor: '3층',
    room: '302호',
    tel: '031-740-7541',
  },
  {
    building: '창의관',
    dept: '을지아동발달지원센터',
    floor: '2층',
    room: '203호',
    tel: '031-740-7175',
  },
  {
    building: '창의관',
    dept: '유아교육학과',
    floor: '6층',
    room: '605호',
    tel: '031-740-7344',
  },
  {
    building: '창의관',
    dept: '아동학과',
    floor: '6층',
    room: '605호',
    tel: '031-740-7335',
  },

  // === 박애관 ===
  {
    building: '박애관',
    dept: '의료공학전공',
    floor: '4층',
    room: '410호',
    tel: '031-740-7239',
  },
  {
    building: '박애관',
    dept: '화장품과학전공',
    floor: '2층',
    room: '222호',
    tel: '031-740-7243',
  },
  {
    building: '박애관',
    dept: '뷰티아트전공',
    floor: '2층',
    room: '222호',
    tel: '031-740-7243',
  },
  {
    building: '박애관',
    dept: '의료경영전공',
    floor: '2층',
    room: '211호',
    tel: '031-740-7235',
  },
  {
    building: '박애관',
    dept: '중독상담전공',
    floor: '3층',
    room: '318호',
    tel: '031-740-7387',
  },
  {
    building: '박애관',
    dept: '장례산업전공',
    floor: '6층',
    room: '616호',
    tel: '031-740-7133',
  },
  {
    building: '박애관',
    dept: '의료IT',
    floor: '5층',
    room: '505호',
    tel: '031-740-7435,7198',
  },
  {
    building: '박애관',
    dept: '빅데이터융합',
    floor: '5층',
    room: '502호',
    tel: '031-740-7567',
  },
  {
    building: '박애관',
    dept: '레저산업전공',
    floor: '5층',
    room: '508호',
    tel: '031-740-7240',
  },
  {
    building: '박애관',
    dept: '식품영양전공',
    floor: '2층',
    room: '208호',
    tel: '031-740-7197,7266',
  },
  {
    building: '박애관',
    dept: '식품생명공학전공',
    floor: '2층',
    room: '209호',
    tel: '031-740-7267,7271',
  }, // 확인필요(두 번째 번호)
  {
    building: '박애관',
    dept: '시각디자인전공',
    floor: '5층',
    room: '506호',
    tel: '031-740-7238',
  },
  {
    building: '박애관',
    dept: '사회복지전공',
    floor: '3층',
    room: '318호',
    tel: '031-740-7387',
  },

  // === 을지관 ===
  {
    building: '을지관',
    dept: '국제교류팀',
    floor: '5층',
    room: '506호',
    tel: '031-740-7419',
  },
  {
    building: '을지관',
    dept: '국제언어교육팀',
    floor: '5층',
    room: '511호',
    tel: '031-740-7297',
  },
  {
    building: '을지관',
    dept: '교양학부',
    floor: '2층',
    room: '201호',
    tel: '031-740-7515',
  },
  {
    building: '을지관',
    dept: '기자재준비실',
    floor: '4층',
    room: '404호',
    tel: '031-740-7299',
  },

  // === 기숙사(인애학사) ===
  {
    building: '기숙사(인애학사)',
    dept: '생활관',
    floor: '1층',
    room: '103호',
    tel: '031-740-7700,7702',
  },

  // === 교내시설 ===
  {
    building: '교내시설',
    dept: '과학생회',
    floor: '--',
    room: '--',
    tel: '031-740-7174',
  },
  {
    building: '교내시설',
    dept: '보건실',
    floor: '--',
    room: '--',
    tel: '031-740-7112',
  },
  {
    building: '교내시설',
    dept: '외래교수실',
    floor: '--',
    room: '--',
    tel: '031-740-7166',
  },
  {
    building: '교내시설',
    dept: '당직실',
    floor: '--',
    room: '--',
    tel: '031-740-7117',
  },
  {
    building: '교내시설',
    dept: '구내식당 및 매점',
    floor: '--',
    room: '--',
    tel: '031-740-7727',
  },
  {
    building: '교내시설',
    dept: '구내서점',
    floor: '--',
    room: '--',
    tel: '031-740-7716',
  },
  {
    building: '교내시설',
    dept: '방송실',
    floor: '--',
    room: '--',
    tel: '031-740-7207',
  },
  {
    building: '교내시설',
    dept: '회의실',
    floor: '--',
    room: '--',
    tel: '031-740-7116',
  },
  {
    building: '교내시설',
    dept: '관리실',
    floor: '--',
    room: '--',
    tel: '031-740-7118',
  },
  {
    building: '교내시설',
    dept: '전기실',
    floor: '--',
    room: '--',
    tel: '031-740-7119',
  },
  {
    building: '교내시설',
    dept: '경비실',
    floor: '--',
    room: '--',
    tel: '031-740-7120,7121',
  },
  {
    building: '교내시설',
    dept: '미화실',
    floor: '--',
    room: '--',
    tel: '031-740-7265',
  },
  {
    building: '교내시설',
    dept: '조정실',
    floor: '--',
    room: '--',
    tel: '031-735-7724',
  },
  {
    building: '교내시설',
    dept: '방재실',
    floor: '--',
    room: '--',
    tel: '031-735-7728,7400',
  },

  // // === 창업지원단 ===
  // {
  //   building: '창업지원단',
  //   dept: '창업지원단',
  //   floor: '을지관',
  //   room: '601호',
  //   tel: '031-740-7321',
  // },
  // {
  //   building: '창업지원단',
  //   dept: '창업보육센터',
  //   floor: '을지관',
  //   room: '601호',
  //   tel: '031-740-7321',
  // },

  // // === 산학협력단 ===
  // {
  //   building: '산학협력단',
  //   dept: '산학협력단',
  //   floor: '을지관',
  //   room: '210호',
  //   tel: '031-740-7298',
  // },
  // {
  //   building: '산학협력단',
  //   dept: '산학기획센터',
  //   floor: '을지관',
  //   room: '210호',
  //   tel: '031-740-7477',
  // },
  // {
  //   building: '산학협력단',
  //   dept: '연구지원센터',
  //   floor: '을지관',
  //   room: '210호',
  //   tel: '031-740-7341',
  // },
  // {
  //   building: '산학협력단',
  //   dept: '지역혁신센터',
  //   floor: '을지관',
  //   room: '304호',
  //   tel: '031-740-7454',
  // },
];

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const resultsEl = $('#dirResults');
const searchEl = $('#dirSearch');

// 유틸: 한글/숫자 검색 정규화(자모 분해, 공백/하이픈 제거)
function normalize(str) {
  return (
    (str || '')
      .toString()
      .trim()
      .toLowerCase()
      // 라틴 문자만 악센트 제거, 한글은 보존
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      // 한글(가-힣), 한글 자모(1100-11FF, 3130-318F)까지 허용
      .replace(/[^\w\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/g, ' ')
      .replace(/\s+/g, ' ')
  );
}

function digits(str) {
  return (str || '').replace(/\D+/g, '');
}

function groupByBuilding(rows) {
  const map = new Map();
  rows.forEach((r) => {
    if (!map.has(r.building)) map.set(r.building, []);
    map.get(r.building).push(r);
  });
  // 건물 내부는 dept 가나다 정렬
  for (const [k, arr] of map) {
    arr.sort((a, b) => a.dept.localeCompare(b.dept, 'ko'));
  }
  return map;
}

// 텍스트 내 검색어 하이라이트
function highlight(text, q) {
  if (!q) return text;
  const nq = normalize(q).split(' ').filter(Boolean);
  if (!nq.length) return text;

  // 간단한 다중어 토큰 하이라이트
  let out = text;
  nq.forEach((tok) => {
    if (!tok) return;
    const re = new RegExp(
      `(${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );
    out = out.replace(re, "<mark class='hit'>$1</mark>");
  });
  return out;
}

function render(rows, query = '') {
  resultsEl.innerHTML = '';
  if (!rows.length) {
    resultsEl.innerHTML = `<div class="dir-section"><div class="dir-head">검색 결과 없음</div></div>`;
    return;
  }
  const grouped = groupByBuilding(rows);
  [...grouped.keys()]
    .sort((a, b) => a.localeCompare(b, 'ko'))
    .forEach((building) => {
      const items = grouped.get(building);
      const section = document.createElement('section');
      section.className = 'dir-section';
      section.innerHTML = `
      <div class="dir-head">
        <span>${building}</span>
        <span class="badge">${items.length}건</span>
      </div>
      <div class="dir-body">
        <table class="dir-table" role="table">
          <thead>
            <tr><th>부서·학과</th><th class="room">호수</th><th class="tel">전화</th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;
      if (building === '교내시설') {
        section.classList.add('hide-floor-room');
      }
      const tbody = $('tbody', section);
      items.forEach((it) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td class="dept">${highlight(it.dept, query)}</td>
        <td class="room">${highlight(it.room, query)}</td>
        <td class="tel"><a href="tel:${digits(
          it.tel
        )}" title="전화 걸기">${highlight(it.tel, query)}</a></td>
      `;
        tbody.appendChild(tr);
      });
      resultsEl.appendChild(section);
    });
}

// 검색: 모든 필드 매칭(부서/학과, 건물, 층, 호수, 전화 전체/내선)
function doSearch(q) {
  const nq = normalize(q);
  const nd = digits(q);
  if (!q.trim()) return render(DATA);

  const tokens = nq.split(' ').filter(Boolean); // 공백으로 쪼갠 토큰들

  const filtered = DATA.filter((it) => {
    const blob = [it.building, it.dept, it.floor, it.room, it.tel].join(' ');
    const nblob = normalize(blob);
    const dblob = digits(blob);

    // 숫자 검색(그대로) OR 토큰 중 하나라도 포함되면 매치
    const textHit = tokens.length
      ? tokens.some((t) => nblob.includes(t))
      : nblob.includes(nq);

    return (nd && dblob.includes(nd)) || textHit;
  });

  render(filtered, q);
}

// 디바운스
let t;
searchEl.addEventListener('input', (e) => {
  clearTimeout(t);
  t = setTimeout(() => doSearch(e.target.value), 120);
});

// (선택) 붙여넣기 임포트: "건물,부서및학과,층,호수,전화"
const pasteBtn = $('#pasteBtn');
if (pasteBtn) {
  pasteBtn.addEventListener('click', () => {
    const txt = $('#pasteBox').value.trim();
    if (!txt) return;
    const rows = txt
      .split(/\r?\n/)
      .map((line) => {
        const [building, dept, floor, room, tel] = line.split(/\s*,\s*/);
        return { building, dept, floor, room, tel };
      })
      .filter((r) => r.building && r.dept && r.tel);
    DATA.push(...rows);
    $('#pasteBox').value = '';
    doSearch(searchEl.value || '');
  });
}

// 최초 렌더
render(DATA);
