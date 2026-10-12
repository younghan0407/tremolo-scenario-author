const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vis = (e) => !!(e && e.getClientRects().length) && getComputedStyle(e).visibility !== 'hidden';
const tx = (e, n = 80) => ((e && (e.innerText || e.textContent)) || '').replace(/\s+/g, ' ').trim().slice(0, n);
const cls = (e) => (typeof e.className === 'string' ? e.className : (e.getAttribute && e.getAttribute('class')) || '');
const $$ = (s, r = document) => [...r.querySelectorAll(s)].filter(vis);
async function idle(max = 8000) { const t0 = Date.now(); await sleep(700); while (Date.now() - t0 < max) { if (!$$('.ant-spin-spinning,.ant-skeleton-active').length) break; await sleep(300); } await sleep(500); }
function dump(tag) {
  const tids = [], seen = new Set();
  for (const e of $$('[data-testid]')) { const k = e.getAttribute('data-testid'); if (seen.has(k)) continue; seen.add(k); tids.push([k, e.tagName.toLowerCase(), tx(e, 70), (e.disabled ? 'D' : '')]); }
  return { tag, url: location.href, bc: tx(document.querySelector('[data-testid="adm-breadcrumb"]'), 200), pt: tx(document.querySelector('[data-testid="adm-page-title"]'), 200),
    h: $$('h1,h2,h3,h4,.ant-modal-title,.ant-drawer-title,.ant-collapse-header').map((e) => e.tagName.toLowerCase() + ':' + tx(e, 60)).slice(0, 80),
    tabs: $$('[role=tab]').map((e) => tx(e, 40) + (e.getAttribute('aria-selected') === 'true' ? '*' : '')),
    btn: [...new Set($$('button,a.ant-btn,[role=button]').map((e) => tx(e, 40) + (e.disabled ? '(D)' : '')).filter(Boolean))].slice(0, 150),
    ph: [...new Set($$('input,textarea').map((e) => `${e.type}|${e.id}|${e.placeholder}|${e.getAttribute('data-testid') || ''}|${e.disabled ? 'D' : ''}${e.readOnly ? 'R' : ''}${e.checked ? 'C' : ''}`))].slice(0, 100),
    lab: [...new Set($$('.ant-form-item-label,label,.key-area,.item-label').map((e) => tx(e, 60)).filter(Boolean))].slice(0, 150),
    sel: $$('.ant-select').map((e) => (e.id || e.querySelector('input')?.id || '') + '=' + tx(e, 50) + (cls(e).includes('disabled') ? '(D)' : '')).slice(0, 50),
    chk: $$('.ant-segmented-item,.ant-radio-wrapper,.ant-checkbox-wrapper,.ant-switch,.ant-radio-button-wrapper').map((e) => tx(e, 50) + (/(checked|selected)/.test(cls(e)) ? '*' : '') + (/disabled/.test(cls(e)) ? '(D)' : '')).slice(0, 80),
    tables: $$('table').map((t) => ({ tid: t.closest('[data-testid]')?.getAttribute('data-testid'), th: [...t.querySelectorAll('thead th')].map((th) => tx(th, 40) + (th.querySelector('.ant-table-column-sorter') ? '↕' : '')), rows: t.querySelectorAll('tbody tr.ant-table-row').length, row1: [...(t.querySelector('tbody tr.ant-table-row')?.children || [])].map((td) => tx(td, 50)) })),
    tids, modal: $$('.ant-modal-wrap .ant-modal,.ant-drawer-content,.ant-popover,.ant-dropdown:not(.ant-dropdown-hidden),[role=tooltip],.ant-message,.ant-notification').map((e) => cls(e).slice(0, 40) + ' :: ' + tx(e, 1200)),
    text: tx(document.querySelector('main') || document.body, 3500) };
}
const byText = (t, sel = 'button,a,span,div,li,label,p') => $$(sel).filter((e) => tx(e, 200) === t).sort((a, b) => a.children.length - b.children.length)[0];
async function click(e) { if (!e) return false; e.scrollIntoView({ block: 'center' }); e.click(); await idle(); return true; }
async function tab(name) { return click($$('[role=tab]').find((x) => tx(x, 40) === name)); }
async function rowMenu(i = 0, scope = document) { const b = $$('tbody tr.ant-table-row button', scope).filter((x) => tx(x) === 'more_horiz')[i]; if (!b) return null; b.click(); await sleep(800); return $$('.ant-dropdown:not(.ant-dropdown-hidden) [role=menuitem]').map((e) => tx(e, 40)); }
async function menuItem(name) { const m = $$('.ant-dropdown:not(.ant-dropdown-hidden) [role=menuitem]').find((e) => tx(e, 40) === name); return click(m); }
async function closeMenus() { document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); document.body.click(); await sleep(400); }
async function cancelModal() { const c = $$('.ant-modal-wrap button,.ant-drawer button').filter((b) => /^(취소|닫기|close|확인)$/.test(tx(b))).pop(); if (c) { c.click(); await idle(); } }
async function nameCell(i = 0, scope = document) { const c = $$('tbody tr.ant-table-row [data-testid="adm-name-cell"], tbody tr.ant-table-row a', scope)[i]; return click(c); }
const OPENED = []; window.open = (u) => { OPENED.push(String(u)); return null; };
