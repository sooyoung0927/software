// call.js — 전화번호부 데이터 + 검색 + 렌더
// ⚠️ 스크린샷 숫자는 내가 임의로 확정할 수 없으니 샘플만 두고 형식을 맞춰 넣도록 했어.

const DATA = [
  // ==== 대학본부 ====
  {
    building: '범석관',
    dept: '교무지원팀',
    floor: '1층',
    room: '110호',
    tel: '042-259-1523,1524',
  },
  {
    building: '범석관',
    dept: '학생지원팀',
    floor: '1층',
    room: '110호',
    tel: '042-259-1530',
  },
  {
    building: '범석관',
    dept: '총무관리팀',
    floor: '3층',
    room: '302호',
    tel: '042-259-1546',
  },
  {
    building: '범석관',
    dept: '입학관리팀',
    floor: '1층',
    room: '110호',
    tel: '042-259-1530',
  },

  // ==== 대학 ====
  {
    building: '일현의학관',
    dept: '의예과',
    floor: '3층',
    room: '302호',
    tel: '042-259-1618',
  },
  {
    building: '일현의학관',
    dept: '의학과',
    floor: '3층',
    room: '302호',
    tel: '042-259-1601',
  },
  {
    building: '일현의학관',
    dept: '의학교육실',
    floor: '3층',
    room: '302호',
    tel: '042-259-1518',
  },
  {
    building: '범석관',
    dept: '해부학·신경과학교실',
    floor: '5층',
    room: '506호',
    tel: '042-259-1628,1625',
  },
  {
    building: '일현연구동',
    dept: '생리학교실',
    floor: '5층',
    room: '512호',
    tel: '042-259-1638',
  },
  {
    building: '일현연구동',
    dept: '생화학·분자생물학교실',
    floor: '3층',
    room: '314호',
    tel: '042-259-1647,1646',
  },
  {
    building: '일현연구동',
    dept: '병리학교실',
    floor: '1층',
    room: '101호',
    tel: '042-259-1657',
  },
  {
    building: '일현연구동',
    dept: '미생물학교실',
    floor: '2층',
    room: '201호',
    tel: '042-259-1667',
  },
  {
    building: '일현연구동',
    dept: '약리학교실',
    floor: '4층',
    room: '409호',
    tel: '042-259-1677',
  },
  {
    building: '일현연구동',
    dept: '예방의학교실',
    floor: '6층',
    room: '602호',
    tel: '042-259-1688,1685',
  },
  {
    building: '일현의학관',
    dept: '의학교육학교실',
    floor: '3층',
    room: '303호',
    tel: '042-259-1518',
  },
  {
    building: '일현의학관',
    dept: '인문사회의학교실',
    floor: '3층',
    room: '302호',
    tel: '042-259-1618',
  },

  // ==== 부속 및 부설기관 ====
  {
    building: '일현의학관',
    dept: '학술정보원 학술정보팀',
    floor: '1층',
    room: '103호',
    tel: '042-259-1576',
  },
  {
    building: '범석관',
    dept: '학술정보원 전산정보팀',
    floor: '1층',
    room: '110호',
    tel: '042-259-1581',
  },
  {
    building: '신생활관',
    dept: '생활관(사감실)',
    floor: '--',
    room: '--',
    tel: '042-259-1571',
  },
  {
    building: '범석관',
    dept: '평생교육원',
    floor: '1층',
    room: '110호',
    tel: '042-259-1515',
  },
  {
    building: '일현의학관',
    dept: '교육개발연구센터',
    floor: '3층',
    room: '302호',
    tel: '042-259-1518',
  },
  {
    building: '일현연구동',
    dept: 'EMBRI',
    floor: '1층',
    room: '107호',
    tel: '042-259-1691',
  },

  // ==== 기타지원 및 편의시설 ====
  {
    building: '범석관',
    dept: '시설팀',
    floor: '지하1층',
    room: '--',
    tel: '042-259-1553,1555',
  },
  {
    building: '범석관',
    dept: '경비실',
    floor: '1층',
    room: '110호',
    tel: '042-259-1550,1551',
  },
  {
    building: '일현의학관',
    dept: '당직실',
    floor: '1층',
    room: '108호',
    tel: '042-259-1548',
  },
  {
    building: '을지관',
    dept: '식당',
    floor: '1층',
    room: '--',
    tel: '070-4030-0891',
  },
  {
    building: '을지관',
    dept: '구내편의점 CU',
    floor: '1층',
    room: '--',
    tel: '042-223-1701',
  },

  // ==== 학생회 ====
  {
    building: '범석관',
    dept: '총학생회',
    floor: '2층',
    room: '232호',
    tel: '042-259-1790',
  },
  {
    building: '범석관',
    dept: '학보사',
    floor: '2층',
    room: '220호',
    tel: '042-259-1794',
  },
  {
    building: '범석관',
    dept: '인터넷홍보단',
    floor: '8층',
    room: '808호',
    tel: '042-259-1793',
  },
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
