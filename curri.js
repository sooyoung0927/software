// curri.js — 이메일별 프로필에서 학과 읽어서 커리큘럼 표시

// information.js / my.js와 동일한 네임스페이스 유틸
const AUTH_EMAIL_KEY = 'qai_auth_email';
const NS = 'qai';
const PROFILE_KEY_SUFFIX = 'profile';

function currentEmail() {
  return (localStorage.getItem(AUTH_EMAIL_KEY) || '').trim().toLowerCase();
}
function keyFor(suffix) {
  const email = currentEmail() || '__noemail__';
  return `${NS}:${suffix}:${email}`;
}

function loadLocalProfile() {
  const raw = localStorage.getItem(keyFor(PROFILE_KEY_SUFFIX));
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/*
 * 커리큘럼 데이터
 * - groups: 가로줄 단위 블록
 * - 각 group.rows 안에 과목 행(row)을 배열로 넣음
 * - 필요한 과목/학점은 편한대로 수정해도 됨
 */
const CURRI_DATA = {
  // 전공 기초
  'major-basic': {
    title: '전공 기초',
    groups: [
      {
        rows: [
          [
            { credit: 3, name: '데이터분석기초' },
            { credit: 3, name: '인공지능개론' },
          ],
        ],
      },
    ],
  },

  // 전공 필수 (1번째 이미지 구조 맞춰서 대략 채워둠)
  'major-required': {
    title: '전공 필수',
    groups: [
      {
        rows: [
          [
            { credit: 3, name: '객체지향프로그래밍' },
            { credit: 3, name: '파이썬프로그래밍' },
            { credit: 3, name: '인공지능개론' },
          ],
        ],
      },
      {
        rows: [
          [
            { credit: 2, name: '객체모델링' },
            { credit: 3, name: '자료구조' },
            { credit: 3, name: '데이터통신' },
          ],
          [
            { credit: 3, name: 'U-healthcare개론' },
            { credit: 3, name: '의료영상처리' },
            { credit: 2, name: 'IoT실무' },
            { credit: 3, name: '조사방법론' },
          ],
        ],
      },
      {
        rows: [
          [
            { credit: 3, name: '데이터베이스설계및구축' },
            { credit: 3, name: '운영체제' },
            { credit: 2, name: '데이터분석실무' },
          ],
          [
            { credit: 3, name: '소프트웨어공학' },
            { credit: 2, name: '딥러닝및강화학습' },
            { credit: 3, name: '의료전문가시스템' },
          ],
        ],
      },
      {
        rows: [
          [
            { credit: 2, name: '취창업실무' },
            { credit: 3, name: '컴퓨터알고리즘' },
          ],
          [
            { credit: 2, name: '의료클라우드컴퓨팅' },
            { credit: 1, name: '졸업논문' },
          ],
        ],
      },
    ],
  },

  // 전공 선택 (2번째 이미지)
  'major-elective': {
    title: '전공 선택',
    groups: [
      {
        rows: [
          [
            { credit: 3, name: 'IT기업과경영' },
            { credit: 2, name: '웹프로그래밍' },
            { credit: 2, name: '의학용어' },
            { credit: 3, name: '보건통계학' },
          ],
          [
            { credit: 3, name: '의료비즈니스' },
            { credit: 2, name: 'IT마케팅개론' },
          ],
        ],
      },
      {
        rows: [
          [
            { credit: 3, name: '디지털공학' },
            { credit: 3, name: '데이터과학' },
            { credit: 2, name: 'C/S시스템' },
            { credit: 3, name: 'C언어' },
          ],
          [
            { credit: 3, name: '데이터베이스기초' },
            { credit: 2, name: '아이디어설계와활용' },
          ],
        ],
      },
      {
        rows: [
          [
            { credit: 3, name: '기계학습' },
            { credit: 3, name: 'U-healthcare실무' },
            { credit: 2, name: '웹프로그래밍실무' },
          ],
          [
            { credit: 3, name: '임상데이터마이닝' },
            { credit: 3, name: '소셜인텔리전스' },
            { credit: 2, name: '창의적IT의료기기' },
          ],
        ],
      },
      {
        rows: [
          [
            { credit: 3, name: '의료IT융합프로젝트' },
            { credit: 3, name: '센서네트워크응용' },
            { credit: 3, name: '헬스디자인' },
          ],
          [
            { credit: 5, name: '현장실무(인턴십)' },
            { credit: 3, name: '전자의무기록' },
            { credit: 2, name: '휴먼인터페이스' },
          ],
        ],
      },
    ],
  },

  // 교양 필수 (3번째 이미지)
  'liberal-required': {
    title: '교양 필수',
    groups: [
      {
        rows: [
          [
            { credit: 0.5, name: '인성교대학생활Ⅰ' },
            { credit: 1, name: '심폐소생술' },
            { credit: 2, name: '영어읽기와쓰기' },
          ],
          [
            { credit: 0.5, name: '인성교대학생활Ⅱ' },
            { credit: 2, name: '작문과화법' },
            { credit: 2, name: '생명윤리' },
          ],
        ],
      },
      {
        rows: [
          [
            { credit: 0.5, name: '인성과미래설계Ⅰ' },
            { credit: 1, name: '심폐소생술' },
            { credit: 2, name: '글로벌커뮤니케이션1' },
          ],
          [
            { credit: 0.5, name: '인성과미래설계Ⅱ' },
            { credit: 2, name: '작문과화법' },
            { credit: 2, name: '글로벌커뮤니케이션2' },
          ],
        ],
      },
    ],
  },
};

// 과목 박스 HTML 생성
function subjectItemHtml(s) {
  return `
    <div class="subject-item">
      <span class="subject-credit">${s.credit}</span>
      <span class="subject-name">${s.name}</span>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const msgEl = document.getElementById('curri-message');
  const contentEl = document.getElementById('curri-content');
  if (!msgEl || !contentEl) return;

  // 프로필에서 학과 가져오기
  const prof = loadLocalProfile();
  const dept = (prof && (prof.department || prof.dept)) || '';

  const isMedicalIT = (text) => {
    if (!text) return false;
    const norm = String(text).toLowerCase().replace(/\s+/g, '');
    return norm.includes('의료it'); // "의료IT", "의료 it" 등
  };

  // 메인 메뉴(4개 버튼) 렌더링
  function renderMainMenu() {
    contentEl.innerHTML = `
      <div class="curri-btn-list">
        <button type="button" class="curri-btn" data-type="major-basic">
          전공 기초
        </button>
        <button type="button" class="curri-btn" data-type="major-required">
          전공 필수
        </button>
        <button type="button" class="curri-btn" data-type="major-elective">
          전공 선택
        </button>
        <button type="button" class="curri-btn" data-type="liberal-required">
          교양 필수
        </button>
      </div>
    `;

    // 버튼 클릭 이벤트
    contentEl.querySelectorAll('.curri-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        renderDetail(type);
      });
    });
  }

  // 상세 화면 렌더링
  function renderDetail(type) {
    const data = CURRI_DATA[type];

    if (!data) {
      alert('해당 커리큘럼은 준비 중입니다.');
      return;
    }

    const { title, groups } = data;

    const bodyHTML = `
  <div class="curri-detail-body">
    ${groups
      .map(
        (g) => `
          <div class="curri-block">
            <div class="curri-line"></div>
            ${g.rows
              .map(
                (row) => `
                  <div class="subject-row">
                    ${row.map(subjectItemHtml).join('')}
                  </div>
                `
              )
              .join('')}
          </div>
        `
      )
      .join('')}
    <div class="curri-line"></div>
  </div>
`;

    contentEl.innerHTML = `
  <div class="curri-detail">
    <div class="curri-head">
      <button type="button" class="curri-head-back" aria-label="뒤로가기">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M15 5 L8 12 L15 19"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="curri-head-title">${title}</div>
    </div>
    ${bodyHTML}
  </div>
    `;

    // 뒤로가기 → 4버튼 화면
    contentEl
      .querySelector('.curri-head-back')
      ?.addEventListener('click', renderMainMenu);
  }

  // 1) 학과/학부 정보가 없을 때
  if (!dept) {
    msgEl.style.display = 'block';
    msgEl.textContent =
      '학과/학부를 먼저 입력해주십시오.\n' +
      '마이페이지에서 [정보 입력하기]를 눌러 학과/학부를 저장하면\n' +
      '이곳에서 커리큘럼을 확인할 수 있습니다.';
    contentEl.hidden = true;
    return;
  }

  // 2) 의료IT일 때 → 커리큘럼 기능 활성화
  if (isMedicalIT(dept)) {
    msgEl.style.display = 'none';
    contentEl.hidden = false;
    renderMainMenu();
    return;
  }

  // 3) 그 외 학과일 때
  msgEl.style.display = 'block';
  msgEl.textContent = `${dept} 커리큘럼은 준비 중입니다.`;
  contentEl.hidden = true;
});
