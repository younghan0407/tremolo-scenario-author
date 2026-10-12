(async (GROUP, OPTS) => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const vis = (e) => !!(e && e.getClientRects().length) && getComputedStyle(e).visibility !== 'hidden';
  const tx = (e, n = 80) => ((e && (e.innerText || e.textContent)) || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const cls = (e) => (typeof e.className === 'string' ? e.className : (e.getAttribute && e.getAttribute('class')) || '');
  async function idle(max = 8000) {
    const t0 = Date.now(); await sleep(600);
    while (Date.now() - t0 < max) { const sp = [...document.querySelectorAll('.ant-spin-spinning,.ant-skeleton-active')].filter(vis); if (!sp.length) break; await sleep(300); }
    await sleep(400);
  }
  function dump(tag) {
    const q = (s) => [...document.querySelectorAll(s)].filter(vis);
    const tids = []; const seen = new Set();
    for (const e of q('[data-testid]')) { const k = e.getAttribute('data-testid'); if (seen.has(k)) continue; seen.add(k); tids.push([k, e.tagName.toLowerCase(), tx(e, 70)]); }
    const tables = q('table').map((t) => ({ tid: (t.closest('[data-testid]') || {}).getAttribute?.call(t.closest('[data-testid]'), 'data-testid'),
      th: [...t.querySelectorAll('thead th')].map((th) => tx(th, 40) + (th.querySelector('.ant-table-column-sorter') ? '↕' : '')),
      rows: t.querySelectorAll('tbody tr.ant-table-row').length, row1: [...(t.querySelector('tbody tr.ant-table-row')?.children || [])].map((td) => tx(td, 40)),
      empty: tx(t.querySelector('.ant-empty,.ant-table-placeholder'), 60) }));
    return {
      tag, url: location.href, title: document.title,
      bc: tx(document.querySelector('[data-testid="adm-breadcrumb"],.ant-breadcrumb'), 200),
      pt: tx(document.querySelector('[data-testid="adm-page-title"]'), 200),
      h: q('h1,h2,h3,h4,.title,.ant-modal-title,.ant-drawer-title').map((e) => e.tagName.toLowerCase() + ':' + tx(e, 60)).slice(0, 60),
      tabs: q('[role=tab]').map((e) => tx(e, 40) + (e.getAttribute('aria-selected') === 'true' ? '*' : '')),
      btn: [...new Set(q('button,a.ant-btn,[role=button]').map((e) => tx(e, 40)).filter(Boolean))].slice(0, 120),
      ph: [...new Set(q('input,textarea').map((e) => `${e.type}|${e.id}|${e.placeholder}|${e.disabled ? 'D' : ''}${e.readOnly ? 'R' : ''}`))].slice(0, 80),
      lab: [...new Set(q('.ant-form-item-label,label,.label,.key-area,.item-label').map((e) => tx(e, 50)).filter(Boolean))].slice(0, 120),
      sel: q('.ant-select').map((e) => (e.id || e.querySelector('input')?.id || '') + '=' + tx(e, 40) + (cls(e).includes('disabled') ? '(D)' : '')).slice(0, 40),
      seg: q('.ant-segmented-item,.ant-radio-wrapper,.ant-checkbox-wrapper,.ant-switch').map((e) => tx(e, 40) + (/(checked|selected)/.test(cls(e)) ? '*' : '')).slice(0, 60),
      tables, tids,
      modal: q('.ant-modal-wrap .ant-modal,.ant-drawer-content,.ant-popover,.ant-dropdown:not(.ant-dropdown-hidden),[role=tooltip]').map((e) => tx(e, 600)),
      text: tx(document.querySelector('main') || document.body, OPTS.textLen || 2500),
    };
  }
  async function clickEl(e) { if (!e) return false; e.scrollIntoView({ block: 'center' }); e.click(); await idle(); return true; }
  const out = { group: GROUP, pages: [], errors: [], lnb: [] };
  // LNB 그룹 펼치기
  const firsts = [...document.querySelectorAll('li.menu-first, .menu-wrap li.ant-menu-submenu, .menu-wrap li.ant-menu-item')];
  const top = [...document.querySelectorAll('li.menu-first')].find((li) => tx(li.querySelector('.ant-menu-submenu-title,.ant-menu-title-content') || li, 40).includes(GROUP));
  if (!top) { out.errors.push('top not found ' + GROUP + ' :: ' + firsts.map((f) => tx(f, 30)).join(' | ')); return out; }
  const expandAll = async () => {
    for (let k = 0; k < 4; k++) {
      const closed = [...top.querySelectorAll('li.ant-menu-submenu:not(.ant-menu-submenu-open) > .ant-menu-submenu-title')].concat(top.matches('.ant-menu-submenu:not(.ant-menu-submenu-open)') ? [top.querySelector(':scope > .ant-menu-submenu-title')] : []).filter(Boolean);
      if (!closed.length) break; for (const c of closed) { c.click(); await sleep(400); }
    }
  };
  await expandAll();
  let items = [...top.querySelectorAll('li[role=menuitem]')].map((li) => tx(li, 40));
  if (!items.length) items = [GROUP];
  out.lnb = items;
  const only = OPTS.only; const skip = OPTS.skip || [];
  for (const name of items) {
    if (only && !only.includes(name)) continue; if (skip.includes(name)) continue;
    try {
      await expandAll();
      const li = name === GROUP && !top.querySelector('li[role=menuitem]') ? top : [...top.querySelectorAll('li[role=menuitem]')].find((l) => tx(l, 40) === name);
      if (!li) { out.errors.push('menu missing ' + name); continue; }
      await clickEl(li.querySelector('.ant-menu-title-content') || li); await idle(10000);
      const base = location.href;
      out.pages.push(dump(name));
      const tabNames = [...document.querySelectorAll('main [role=tab], [role=tab]')].filter(vis).map((t) => tx(t, 40)).slice(0, 12);
      for (const tn of (tabNames.length ? tabNames : [null])) {
        if (OPTS.tabsOnly && tn && !OPTS.tabsOnly.includes(tn)) continue;
        if (tn) { const t = [...document.querySelectorAll('[role=tab]')].filter(vis).find((x) => tx(x, 40) === tn); if (!t) continue; await clickEl(t); await idle(8000); out.pages.push(dump(name + ' / ' + tn)); }
        const pane = document.querySelector('.ant-tabs-tabpane-active') || document.querySelector('main') || document;
        // 행 메뉴
        const more = [...pane.querySelectorAll('tbody tr.ant-table-row button')].filter((b) => vis(b) && tx(b) === 'more_horiz')[0];
        if (more) { more.click(); await sleep(700); out.pages.push({ tag: name + ' / ' + tn + ' / rowmenu', menu: [...document.querySelectorAll('.ant-dropdown:not(.ant-dropdown-hidden) [role=menuitem], .ant-dropdown:not(.ant-dropdown-hidden) li')].filter(vis).map((e) => tx(e, 40)) }); document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); document.body.click(); await sleep(400); }
        // 생성 화면
        if (!OPTS.noCreate) {
          const cb = pane.querySelector('[data-testid="adm-list-button-groups-create"]');
          if (cb && vis(cb) && !cb.disabled) {
            const u0 = location.href; await clickEl(cb); await idle(8000);
            out.pages.push(dump(name + ' / ' + tn + ' / CREATE'));
            const adv = [...document.querySelectorAll('label,div,span')].filter((e) => vis(e) && tx(e, 20) === '고급 모드' && e.children.length < 3)[0];
            if (adv && OPTS.adv !== false) { await clickEl(adv); await idle(5000); out.pages.push(dump(name + ' / ' + tn + ' / CREATE-ADV')); }
            if (location.href !== u0) { history.back(); await idle(8000); } else { const c = [...document.querySelectorAll('.ant-modal-wrap button, .ant-drawer button')].filter((b) => vis(b) && /^(취소|닫기|close)$/.test(tx(b))).pop(); if (c) { c.click(); await idle(); } }
            if (tn) { const t = [...document.querySelectorAll('[role=tab]')].filter(vis).find((x) => tx(x, 40) === tn); if (t) { await clickEl(t); await idle(6000); } }
          }
        }
        // 상세 화면
        if (!OPTS.noDetail) {
          const pane2 = document.querySelector('.ant-tabs-tabpane-active') || document.querySelector('main') || document;
          const link = [...pane2.querySelectorAll('tbody tr.ant-table-row a, tbody tr.ant-table-row .link, tbody tr.ant-table-row [class*=link]')].filter(vis)[0];
          if (link) {
            const u0 = location.href; await clickEl(link); await idle(10000);
            if (location.href !== u0) {
              out.pages.push(dump(name + ' / ' + tn + ' / DETAIL'));
              const dtabs = [...document.querySelectorAll('[role=tab]')].filter(vis).map((t) => tx(t, 40)).slice(0, 12);
              for (const dt of dtabs.slice(1)) { const t = [...document.querySelectorAll('[role=tab]')].filter(vis).find((x) => tx(x, 40) === dt); if (!t) continue; await clickEl(t); await idle(8000); out.pages.push(dump(name + ' / ' + tn + ' / DETAIL / ' + dt)); }
              history.back(); await idle(8000);
              if (dtabs.length > 1) { /* 탭 상태 복원 */ }
              if (tn) { const t = [...document.querySelectorAll('[role=tab]')].filter(vis).find((x) => tx(x, 40) === tn); if (t) { await clickEl(t); await idle(6000); } }
            } else out.pages.push(dump(name + ' / ' + tn + ' / ROWCLICK-SAMEURL'));
          }
        }
        if (location.href.split('?')[0] !== base.split('?')[0] && !tn) break;
      }
    } catch (e) { out.errors.push(name + ' :: ' + String(e && e.message || e)); }
  }
  return out;
})
