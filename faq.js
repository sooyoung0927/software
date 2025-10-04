// faq.js
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.q');
  if (!btn) return;

  const panel = btn.parentElement.querySelector('.a');
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  // 현재 항목 토글
  btn.setAttribute('aria-expanded', String(!isOpen));
  if (panel.hasAttribute('hidden')) panel.removeAttribute('hidden');
  else panel.setAttribute('hidden', '');

  // 나머지 항목 닫기
  document.querySelectorAll('.q').forEach((other) => {
    if (other !== btn) other.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.a').forEach((other) => {
    if (other !== panel) other.setAttribute('hidden', '');
  });
});
