(async () => {
  const sleep = (m) => new Promise((r) => setTimeout(r, m));
  const tx = (e) => ((e && (e.innerText || e.textContent)) || '').replace(/\s+/g, ' ').trim();
  const vis = (e) => !!(e && e.getClientRects().length) && getComputedStyle(e).visibility !== 'hidden';
  const cls = (e) => (typeof e.className === 'string' ? e.className : (e.getAttribute && e.getAttribute('class')) || '');
  const isViola = () => [...document.querySelectorAll('li.menu-first')].some((li) => /워크플로우|서비스 카탈로그/.test(tx(li)));
  const out = { before: location.href, already: isViola(), topLeft: [], popup: [], clicked: [] };
  if (out.already) { out.after = location.href; return out; }
  const all = [...document.querySelectorAll('body *')].filter((e) => { if (!vis(e)) return false; const r = e.getBoundingClientRect(); return r.left < 340 && r.top < 100 && r.width > 8 && r.height > 8; });
  out.topLeft = all.filter((e) => e.matches('button,a,[role=button],[role=combobox],[class*=product],[class*=solution],[class*=logo],[class*=switch],[class*=select]'))
    .map((e) => `${e.tagName.toLowerCase()}|${cls(e).slice(0, 80)}|${e.getAttribute('data-testid') || ''}|${tx(e).slice(0, 50)}`).slice(0, 40);
  const cand = all.filter((e) => e.matches('button,a,[role=button],[role=combobox],[class*=product],[class*=solution],[class*=logo],[class*=select]'))
    .sort((a, b) => (/(CONTRABASS|product|solution)/i.test(tx(b) + cls(b)) ? 1 : 0) - (/(CONTRABASS|product|solution)/i.test(tx(a) + cls(a)) ? 1 : 0));
  for (const c of cand.slice(0, 6)) {
    c.click(); out.clicked.push(tx(c).slice(0, 40) + '|' + cls(c).slice(0, 60)); await sleep(1200);
    const pops = [...document.querySelectorAll('.ant-dropdown:not(.ant-dropdown-hidden),.ant-popover:not(.ant-popover-hidden),.ant-select-dropdown:not(.ant-select-dropdown-hidden),[role=menu],[role=listbox],[class*=product],[class*=solution]')].filter(vis);
    out.popup = pops.map((p) => cls(p).slice(0, 60) + ' :: ' + tx(p).slice(0, 300));
    const v = [...document.querySelectorAll('body *')].filter((e) => vis(e) && /^VIOLA$/i.test(tx(e)) && e.getBoundingClientRect().top > 0)
      .sort((a, b) => a.children.length - b.children.length)[0];
    if (v) {
      const clickable = v.closest('button,a,li,[role=menuitem],[role=option],[class*=item]') || v;
      out.violaEl = clickable.tagName.toLowerCase() + '|' + cls(clickable).slice(0, 80) + '|' + (clickable.getAttribute('data-testid') || '') + '|' + tx(clickable).slice(0, 40);
      clickable.click(); await sleep(7000);
      for (let i = 0; i < 20 && !isViola(); i++) await sleep(500);
      break;
    }
    document.body.click(); await sleep(400);
  }
  out.after = location.href; out.ok = isViola();
  out.lnb = [...document.querySelectorAll('li.menu-first')].map((e) => tx(e).slice(0, 40));
  return out;
})()
