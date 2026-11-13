(() => {
const root = document.querySelector('.mm'); if (!root) return;
const S = { mode: 'D', key: null, f: { lini: null, kluster: null, saluran: null, q: '' }, qRaw: '', sel: null, tab: 'Media Online' };
const BLN3 = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const LINI = ['Group', 'Agribusiness', 'Pulp & Paper', 'Property', 'Financial', 'Technology', 'Energy & Infrastructure', 'Belum dikategorikan'];
const AB = { 'Group': 'Group', 'Agribusiness': 'Agri', 'Pulp & Paper': 'P&P', 'Property': 'Properti', 'Financial': 'Finansial', 'Technology': 'Tekno', 'Energy & Infrastructure': 'Energi', 'Belum dikategorikan': 'Belum' };
const SAL = ['Media Online', 'Threads', 'X', 'Facebook'];
const PAL = dash.colors && dash.colors.length ? dash.colors : ['var(--color-fg)'];
const col = (i) => PAL[((i % PAL.length) + PAL.length) % PAL.length];
const SC = { 'Media Online': col(0), 'Threads': col(1), 'X': col(2), 'Facebook': col(3) };
const lc = (l) => col(Math.max(0, LINI.indexOf(l)));
const SENT = [['Negatif', 'var(--color-bad)'], ['Netral atau promosi', 'var(--cds-chart-muted, var(--color-fg-muted))'], ['Positif', 'var(--color-ok)'], ['Tidak relevan', 'var(--color-warn)']];
const sent = (r) => r.status !== 'Dibuang' ? SENT[0][0] : r.sentimen === 'Netral' ? SENT[1][0] : r.sentimen === 'Positif' ? SENT[2][0] : SENT[3][0];
const STOP = new Set('yang dari untuk dengan pada dalam tidak akan juga atau karena oleh sebagai bisa saat sudah lebih telah kami kita saya mereka para serta hingga agar jadi kalau tapi bukan sampai masih baru lagi bagi atas soal usai hari kata yakni https http banget udah nggak tetap sama buat kalo lalu maka antara seperti tersebut terkait kepada namun secara setelah belum harus dapat hanya adalah bahwa kembali tahun ini itu dan ada akibat hingga usai jelang tanpa lewat masuk makin semakin sebut disebut diduga unggahan threads rincian tercatat soal menyebut'.split(' '));
const NAMES = ['periode', 's-label', 's-total', 's-hari', 's-kluster', 's-pct', 's-lini', 'k-entri', 'k-total', 'k-delta', 'k-prev', 'k-pct', 'k-eng', 'k-views', 'tren', 'sentimen', 'sov', 'kanal', 'isu', 'sumber', 'kata', 'jangkauan', 'matriks', 'sorotan', 'brief-tgl', 'brief-a', 'brief-r', 'chips', 'feed'];
const date = (s) => new Date(s + 'T00:00:00Z');
const iso = (d) => d.toISOString().slice(0, 10);
const senin = (s) => { const d = date(s); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return iso(d); };
const KEY = { D: (s) => s, W: senin, M: (s) => s.slice(0, 7), Y: (s) => s.slice(0, 4) };
const nf = (n) => Math.round(n).toLocaleString('id-ID');
const pct = (v, t) => (t ? Math.round(v / t * 100) : 0) + '%';
const cut = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
const safe = (u) => typeof u === 'string' && u.startsWith('https://') ? u : null;
const h = (tag, attrs, ...kids) => {
  const e = document.createElement(tag);
  for (const k in attrs || {}) { const v = attrs[k]; if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k === 'style') e.style.cssText = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); }
  for (const c of kids.flat()) if (c != null) e.append(c);
  return e;
};
const ent = () => dash.data('semua');
const ring = () => { const d = dash.data('ringkasan'); return d.status === 'ok' && Array.isArray(d.data) ? d.data : []; };
const keys = () => ring().filter((r) => r.mode === S.mode).map((r) => r.key);
const R = () => ring().find((r) => r.pid === S.mode + '_' + S.key);
const all = () => ent().data.filter((r) => KEY[S.mode](r.lap) === S.key);
const neg = () => all().filter((r) => r.status !== 'Dibuang');
const hit = (r, no) => { no = no || {}; return (no.lini || !S.f.lini || r.lini === S.f.lini) && (no.kluster || !S.f.kluster || r.kluster === S.f.kluster) && (no.saluran || !S.f.saluran || r.saluran === S.f.saluran) && (!S.f.q || (r.judul + ' ' + r.sumber + ' ' + r.isu + ' ' + r.kluster).toLowerCase().includes(S.f.q)); };
const ts = (r) => r.jam ? Date.UTC(+r.tgl.slice(0, 4), +r.tgl.slice(5, 7) - 1, +r.tgl.slice(8, 10), +r.jam.slice(0, 2), +r.jam.slice(3, 5)) : null;
const waktu = (r) => +r.tgl.slice(8, 10) + ' ' + BLN3[+r.tgl.slice(5, 7) - 1] + (r.jam ? ' · ' + r.jam : '');
const ready = (el) => { if (ent().status === 'ok' && S.key) return true; if (el.tagName === 'TBODY') el.replaceChildren(); else el.replaceChildren('—'); return false; };
const put = (el, ...kids) => el.replaceChildren(...kids.flat().filter((x) => x != null));
const note = (el, t) => el.replaceChildren(h('p', { class: 'mm-note' }, t));
const NONE = 'Tidak ada konten yang cocok dengan saringan.';
const tip = (box) => {
  const t = h('div', { class: 'mm-tip' }); t.hidden = true; box.append(t);
  return {
    show(ev, lines) {
      t.replaceChildren(...lines.filter(Boolean).map((l, i) => h('div', { class: i ? null : 'mm-tip-h' }, l))); t.hidden = false;
      const b = box.getBoundingClientRect(), x = ev.clientX - b.left + box.scrollLeft + 14, y = ev.clientY - b.top + 14;
      t.style.left = Math.max(0, Math.min(x, box.scrollLeft + b.width - t.offsetWidth - 4)) + 'px'; t.style.top = y + 'px';
    },
    hide() { t.hidden = true; },
  };
};

const sync = () => {
  const ks = keys(); if (ks.length && !ks.includes(S.key)) S.key = ks[ks.length - 1];
  const i = ks.indexOf(S.key), r = R(), has = !!r && r.delta_pct != null, any = !!(S.f.lini || S.f.kluster || S.f.saluran || S.f.q);
  root.querySelectorAll('.mm-seg-b').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
  root.querySelectorAll('.mm-pill').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.sal || null) === S.f.saluran)));
  root.querySelectorAll('.mm-step').forEach((b) => { const j = i + +b.dataset.step; b.disabled = i < 0 || j < 0 || j >= ks.length; });
  root.querySelectorAll('.mm-tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === S.tab)));
  root.querySelectorAll('.mm-d-a').forEach((e) => { e.hidden = !has; });
  root.querySelectorAll('.mm-d-b').forEach((e) => { e.hidden = has || !r; });
  root.querySelectorAll('.mm-reset').forEach((b) => { b.disabled = !any; });
  root.querySelectorAll('.mm-search').forEach((x) => { if (x.value !== S.qRaw) x.value = S.qRaw; });
};
const redraw = (names) => { sync(); (names || NAMES).forEach((n) => dash.draw(n)); };
const setMode = (m, key) => { const cur = ent().status === 'ok' && S.key ? all().map((r) => r.lap).sort().pop() : null; S.mode = m; S.key = key || (cur ? KEY[m](cur) : null); S.sel = null; redraw(); };
const tog = (k, v) => { S.f[k] = S.f[k] === v ? null : v; redraw(); };
const pick = (id) => { S.sel = id; redraw(['sorotan', 'feed']); };
const cari = (q) => { S.qRaw = q; S.f.q = q.trim().toLowerCase(); redraw(); };

root.addEventListener('click', (e) => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.classList.contains('mm-pill')) { S.f.saluran = t.dataset.sal || null; redraw(); }
  else if (t.dataset.mode) setMode(t.dataset.mode);
  else if (t.dataset.step) { const ks = keys(), k = ks[ks.indexOf(S.key) + +t.dataset.step]; if (k) { S.key = k; S.sel = null; redraw(); } }
  else if (t.dataset.tab) { S.tab = t.dataset.tab; redraw(['brief-a', 'brief-r']); }
  else if (t.classList.contains('mm-reset')) { S.f = { lini: null, kluster: null, saluran: null, q: '' }; S.qRaw = ''; redraw(); }
});
root.addEventListener('input', (e) => { if (e.target.classList && e.target.classList.contains('mm-search')) { S.qRaw = e.target.value; S.f.q = S.qRaw.trim().toLowerCase(); redraw(); } });

const num = (name, field, fmt, cls) => dash.draw(name, (el) => {
  const r = R(); if (!r || r[field] == null || r[field] === '') { el.replaceChildren('—'); return; }
  el.replaceChildren(h('span', { class: cls ? cls(r[field]) : null }, (fmt || String)(r[field])));
});
num('s-label', 'label'); num('s-total', 'total', nf); num('s-hari', 'hari'); num('s-kluster', 'kluster_top'); num('s-pct', 'kluster_top_pct', (v) => v + '%'); num('s-lini', 'lini_top', (v) => 'Sinar Mas ' + v);
num('k-entri', 'entri', nf); num('k-total', 'total', nf); num('k-pct', 'neg_pct', (v) => v + '%'); num('k-eng', 'interaksi', nf); num('k-views', 'views', nf); num('k-prev', 'prev_label');
num('k-delta', 'delta_pct', (v) => (v > 0 ? 'Naik ' : v < 0 ? 'Turun ' : 'Tetap ') + Math.abs(v) + '%', (v) => v > 0 ? 'mm-bad' : v < 0 ? 'mm-ok' : null);

dash.draw('updated', (el) => {
  const d = ent(); if (d.status !== 'ok' || !d.data.length) { el.replaceChildren('—'); return; }
  const k = d.data.map((r) => r.lap).sort().pop(), t = date(k);
  el.replaceChildren(t.getUTCDate() + ' ' + BLN[t.getUTCMonth()] + ' ' + t.getUTCFullYear());
});

dash.draw('periode', (sel) => {
  sel.replaceChildren(...ring().filter((r) => r.mode === S.mode).map((r) => new Option(r.label, r.key)));
  sel.value = S.key || ''; sel.onchange = () => { S.key = sel.value; S.sel = null; redraw(); };
});

dash.draw('tren', (el) => {
  if (!ready(el)) return;
  const base = neg(), rows = base.filter((r) => hit(r, { saluran: 1 })), w = Math.max(280, el.clientWidth); el.replaceChildren();
  if (!base.length) return note(el, 'Tidak ada konten negatif pada periode ini.');
  const H = 300, m = { t: 22, r: 8, b: 26, l: 30 }; let bins, kf;
  if (S.mode === 'D') {
    const end = date(S.key).getTime() + 16 * 36e5, start = end - 864e5;
    bins = d3.range(24).map((i) => { const t = new Date(start + i * 36e5), hh = String(t.getUTCHours()).padStart(2, '0') + '.00'; return { k: i, lab: hh, full: t.getUTCDate() + ' ' + BLN3[t.getUTCMonth()] + ', ' + hh }; });
    kf = (r) => { const t = ts(r); return t == null ? null : Math.max(0, Math.min(23, Math.floor((t - start) / 36e5))); };
  } else if (S.mode === 'W') { bins = d3.range(7).map((i) => { const d = date(S.key); d.setUTCDate(d.getUTCDate() + i); return { k: iso(d), lab: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i] + ' ' + d.getUTCDate(), go: 'D' }; }); kf = (r) => r.lap; }
  else if (S.mode === 'M') { bins = d3.range(1, new Date(Date.UTC(+S.key.slice(0, 4), +S.key.slice(5, 7), 0)).getUTCDate() + 1).map((i) => ({ k: S.key + '-' + String(i).padStart(2, '0'), lab: String(i), go: 'D' })); kf = (r) => r.lap; }
  else { bins = d3.range(12).map((i) => ({ k: S.key + '-' + String(i + 1).padStart(2, '0'), lab: BLN3[i], full: BLN3[i] + ' ' + S.key, go: 'M' })); kf = (r) => r.lap.slice(0, 7); }
  bins.forEach((b) => { const rs = rows.filter((r) => kf(r) === b.k); b.p = SAL.map((s) => rs.filter((r) => r.saluran === s).length); b.n = d3.sum(b.p); b.has = !!b.go && base.some((r) => kf(r) === b.k); });
  const tanpaJam = S.mode === 'D' ? rows.filter((r) => kf(r) == null).length : 0;
  if (S.mode === 'D' && !bins.some((b) => b.n)) return note(el, rows.length ? 'Jam unggah tidak tercatat untuk ' + nf(rows.length) + ' konten pada hari ini, sehingga sebaran per jam tidak dapat digambar. Buka tampilan mingguan atau bulanan untuk melihat trennya.' : NONE);
  const x = d3.scaleBand(bins.map((b) => b.k), [m.l, w - m.r]).padding(0.24), y = d3.scaleLinear([0, d3.max(bins, (b) => b.n) || 1], [H - m.b, m.t]).nice(4);
  const svg = d3.select(el).append('svg').attr('width', w).attr('height', H).attr('role', 'img').attr('aria-label', 'Jumlah konten negatif per ' + (S.mode === 'D' ? 'jam' : S.mode === 'Y' ? 'bulan' : 'hari') + ' menurut jenis sumber');
  const yt = y.ticks(4).filter(Number.isInteger);
  svg.append('g').selectAll('line').data(yt).join('line').attr('class', 'mm-grid').attr('x1', m.l).attr('x2', w - m.r).attr('y1', (d) => y(d)).attr('y2', (d) => y(d));
  svg.append('g').selectAll('text').data(yt).join('text').attr('x', m.l - 6).attr('y', (d) => y(d) + 4).attr('text-anchor', 'end').text((d) => nf(d));
  const every = Math.ceil((S.mode === 'D' ? 40 : 28) / Math.max(1, x.step())), T = tip(el);
  const g = svg.append('g').selectAll('g').data(bins).join('g').attr('class', 'mm-bar').style('cursor', (b) => b.has ? 'pointer' : 'default')
    .on('pointermove', (ev, b) => T.show(ev, [b.full || b.lab, nf(b.n) + ' konten negatif', SAL.map((s, i) => s + ' ' + nf(b.p[i])).join(' · ')])).on('pointerleave', T.hide).on('click', (ev, b) => { if (b.has) setMode(b.go, b.k); });
  g.append('rect').attr('x', (b) => x(b.k)).attr('width', x.bandwidth()).attr('y', m.t).attr('height', H - m.b - m.t).style('fill', 'transparent');
  g.each(function (b) { let acc = 0; SAL.forEach((s, i) => { const v = b.p[i]; if (!v) return; d3.select(this).append('rect').attr('x', x(b.k)).attr('width', x.bandwidth()).attr('y', y(acc + v)).attr('height', Math.max(0, y(acc) - y(acc + v) - 1)).attr('rx', 2).attr('class', S.f.saluran && S.f.saluran !== s ? 'mm-dim' : null).style('fill', SC[s]); acc += v; }); });
  if (x.bandwidth() >= 14) g.filter((b) => b.n > 0).append('text').attr('class', 'mm-lab').attr('x', (b) => x(b.k) + x.bandwidth() / 2).attr('y', (b) => y(b.n) - 6).attr('text-anchor', 'middle').text((b) => nf(b.n));
  g.filter((b, i) => i % every === 0).append('text').attr('x', (b) => x(b.k) + x.bandwidth() / 2).attr('y', H - 8).attr('text-anchor', 'middle').text((b) => b.lab);
  el.append(h('div', { class: 'mm-legend' }, SAL.map((s) => h('button', { type: 'button', class: 'mm-chip', 'aria-pressed': String(S.f.saluran === s), onclick: () => tog('saluran', s) }, h('i', { style: 'background:' + SC[s] }), s))));
  if (tanpaJam) el.append(h('p', { class: 'mm-note' }, nf(tanpaJam) + ' konten tanpa jam unggah tidak tergambar di grafik ini.'));
});

const donut = (el, parts, label, onPick, active) => {
  const total = d3.sum(parts, (p) => p.v), size = Math.min(190, Math.max(140, el.clientWidth - 8)), r = size / 2;
  el.replaceChildren(); const wrap = h('div', { class: 'mm-donut' }); el.append(wrap); const T = tip(el);
  const svg = d3.select(wrap).append('svg').attr('width', size).attr('height', size).attr('role', 'img').attr('aria-label', label);
  const g = svg.append('g').attr('transform', 'translate(' + r + ',' + r + ')'), arc = d3.arc().innerRadius(r * 0.64).outerRadius(r - 1);
  g.selectAll('path').data(d3.pie().sort(null).value((p) => p.v)(parts.filter((p) => p.v > 0))).join('path').attr('d', arc).attr('class', (d) => 'mm-arc' + (active && active !== d.data.name ? ' mm-dim' : '')).style('fill', (d) => d.data.c).style('cursor', onPick ? 'pointer' : 'default')
    .on('pointermove', (ev, d) => T.show(ev, [d.data.name, nf(d.data.v) + ' konten', pct(d.data.v, total) + ' dari yang tampil'])).on('pointerleave', T.hide).on('click', (ev, d) => { if (onPick) onPick(d.data.name); });
  g.append('text').attr('class', 'mm-big').attr('text-anchor', 'middle').attr('y', 6).text(nf(total));
  g.append('text').attr('text-anchor', 'middle').attr('y', 24).text('konten');
  wrap.append(h('div', { class: 'mm-leg' }, parts.map((p) => h(onPick ? 'button' : 'div', { type: onPick ? 'button' : null, class: 'mm-leg-r', 'aria-pressed': onPick ? String(active === p.name) : null, onclick: onPick ? () => onPick(p.name) : null }, h('i', { style: 'background:' + p.c }), h('span', { class: 'mm-leg-n' }, p.name), h('b', null, nf(p.v)), h('span', { class: 'mm-leg-p' }, pct(p.v, total))))));
};

dash.draw('sentimen', (el) => {
  if (!ready(el)) return;
  const rows = all().filter((r) => hit(r)); if (!rows.length) return note(el, NONE);
  const c = d3.rollup(rows, (v) => v.length, sent);
  donut(el, SENT.map(([n, k]) => ({ name: n, v: c.get(n) || 0, c: k })), 'Komposisi sentimen seluruh temuan kata kunci');
});
dash.draw('sov', (el) => {
  if (!ready(el)) return;
  const rows = neg().filter((r) => hit(r, { lini: 1 })); if (!rows.length) return note(el, NONE);
  const c = d3.rollup(rows, (v) => v.length, (r) => r.lini);
  donut(el, [...c].sort((a, b) => b[1] - a[1]).map(([l, v]) => ({ name: l, v, c: lc(l) })), 'Porsi konten negatif menurut lini bisnis', (l) => tog('lini', l), S.f.lini);
});

const rowBtn = (n, s, v, share, fn, c, on) => h('button', { type: 'button', class: 'mm-row', 'aria-pressed': on == null ? null : String(on), onclick: fn }, h('span', { class: 'mm-row-n' }, n), h('span', { class: 'mm-row-v' }, nf(v)), h('span', { class: 'mm-row-s' }, s), h('span', { class: 'mm-row-b' }, h('i', { style: 'width:' + Math.round(share * 100) + '%' + (c ? ';background:' + c : '') })));
dash.draw('kanal', (el) => {
  if (!ready(el)) return;
  const rows = neg().filter((r) => hit(r, { saluran: 1 })); if (!rows.length) return note(el, NONE);
  const c = d3.rollup(rows, (v) => v.length, (r) => r.saluran), max = d3.max(c.values()) || 1;
  el.replaceChildren(...SAL.map((s) => rowBtn(s, pct(c.get(s) || 0, rows.length) + ' dari konten negatif', c.get(s) || 0, (c.get(s) || 0) / max, () => tog('saluran', s), SC[s], S.f.saluran === s)));
});
dash.draw('isu', (el) => {
  if (!ready(el)) return;
  const rows = neg().filter((r) => hit(r, { kluster: 1 })); if (!rows.length) return note(el, NONE);
  const g = d3.rollups(rows, (v) => v.length, (r) => r.kluster).sort((a, b) => b[1] - a[1]).slice(0, 7);
  el.replaceChildren(...g.map(([k, v]) => rowBtn(k, pct(v, rows.length) + ' dari konten negatif', v, v / g[0][1], () => tog('kluster', k), null, S.f.kluster === k)));
});
dash.draw('sumber', (el) => {
  if (!ready(el)) return;
  const g = d3.groups(neg().filter((r) => hit(r)), (r) => r.sumber).sort((a, b) => b[1].length - a[1].length).slice(0, 7);
  if (!g.length) return note(el, NONE);
  el.replaceChildren(...g.map(([n, v]) => rowBtn(n, v[0].saluran + ' · ' + v[0].kluster, v.length, v.length / g[0][1].length, () => cari(n), SC[v[0].saluran])));
});
dash.draw('jangkauan', (el) => {
  if (!ready(el)) return;
  const g = neg().filter((r) => hit(r) && r.views > 0).sort((a, b) => b.views - a.views).slice(0, 7);
  if (!g.length) return note(el, 'Belum ada angka tayangan untuk konten yang tampil.');
  el.replaceChildren(...g.map((r) => rowBtn(r.sumber, cut(r.judul, 90), r.views, r.views / g[0].views, () => pick(r.id))));
});
dash.draw('kata', (el) => {
  if (!ready(el)) return;
  const c = new Map();
  neg().filter((r) => hit(r)).forEach((r) => new Set(String(r.judul || '').toLowerCase().match(/[a-zÀ-ɏ][a-zÀ-ɏ0-9]{3,}/g) || []).forEach((wd) => { if (!STOP.has(wd)) c.set(wd, (c.get(wd) || 0) + 1); }));
  const top = [...c].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 28);
  if (!top.length) return note(el, NONE);
  const fs = d3.scaleSqrt([top[top.length - 1][1], top[0][1]], [12, 30]); el.replaceChildren(); const T = tip(el);
  el.prepend(h('div', { class: 'mm-cloud' }, top.slice().sort((a, b) => a[0].localeCompare(b[0])).map(([wd, v]) => h('button', { type: 'button', class: 'mm-word', style: 'font-size:' + Math.round(fs(v)) + 'px;opacity:' + (0.55 + 0.45 * v / top[0][1]).toFixed(2), onclick: () => cari(wd), onpointermove: (ev) => T.show(ev, [wd, 'Muncul di ' + nf(v) + ' konten']), onpointerleave: T.hide }, wd))));
});

dash.draw('matriks', (el) => {
  if (!ready(el)) return;
  const rows = neg().filter((r) => hit(r, { lini: 1, kluster: 1 }));
  if (!rows.length) return note(el, NONE);
  const ls = LINI.filter((l) => rows.some((r) => r.lini === l)), ks = d3.rollups(rows, (v) => v.length, (r) => r.kluster).sort((a, b) => b[1] - a[1]);
  const c = d3.rollup(rows, (v) => v.length, (r) => r.kluster, (r) => r.lini), max = d3.max(ks, ([k]) => d3.max(c.get(k).values())) || 1;
  el.replaceChildren(); const T = tip(el);
  el.prepend(h('table', { class: 'mm-mx' }, h('thead', null, h('tr', null, h('th'), ls.map((l) => h('th', null, AB[l])), h('th', null, 'Total'))),
    h('tbody', null, ks.map(([k, tot]) => h('tr', null, h('th', { class: 'mm-rowh' }, k), ls.map((l) => {
      const v = c.get(k).get(l) || 0, a = v ? 0.12 + 0.88 * v / max : 0, on = S.f.lini === l && S.f.kluster === k;
      return h('td', { style: '--a:' + a.toFixed(2), class: (v ? '' : 'mm-z ') + (a > 0.55 ? 'mm-hot ' : '') + (on ? 'mm-on' : ''), onpointermove: (ev) => v && T.show(ev, [k, 'Sinar Mas ' + l, nf(v) + ' konten']), onpointerleave: T.hide, onclick: () => { if (!v) return; S.f.lini = on ? null : l; S.f.kluster = on ? null : k; redraw(); } }, v ? nf(v) : '0');
    }), h('th', null, nf(tot)))))));
});

dash.draw('sorotan', (el) => {
  if (!ready(el)) return;
  const rows = neg(), r = rows.find((x) => x.id === S.sel) || rows.filter((x) => hit(x)).sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  if (!r) return note(el, NONE);
  const st = [['Tayangan', r.views], ['Suka', r.likes], ['Unggah ulang', r.reposts], ['Balasan', r.replies]].filter((s) => s[1] != null), u = safe(r.link);
  put(el,
    h('div', { class: 'mm-spot-meta' }, r.saluran + ' · ' + waktu(r)), h('div', { class: 'mm-row-n' }, r.sumber), h('p', { class: 'mm-spot-t' }, r.judul), h('p', { class: 'mm-spot-i' }, r.isu),
    h('div', { class: 'mm-tags' }, h('span', { class: 'mm-tag' }, 'Sinar Mas ' + r.lini), h('span', { class: 'mm-tag' }, r.kluster), h('span', { class: 'mm-tag' }, r.status)),
    st.length ? h('div', { class: 'mm-stats' }, st.map((s) => h('div', null, h('b', null, nf(s[1])), s[0]))) : null,
    r.catatan ? h('p', { class: 'mm-note' }, r.catatan) : null,
    u ? h('a', { class: 'mm-link', href: u, target: '_blank', rel: 'noopener noreferrer' }, 'Buka sumber ↗') : null);
});

const lastLap = () => all().map((r) => r.lap).sort().pop();
dash.draw('brief-tgl', (el) => {
  if (!ready(el)) return;
  const r = ring().find((x) => x.pid === 'D_' + lastLap()); if (!r) { el.replaceChildren('—'); return; }
  el.replaceChildren(r.label);
});
const brief = (name, jenis) => dash.draw(name, (el) => {
  const d = dash.data('catatan'); if (d.status !== 'ok' || !ready(el)) { el.replaceChildren('—'); return; }
  const lap = lastLap(), rs = d.data.filter((b) => b.lap === lap && b.kanal === S.tab && b.jenis === jenis).sort((a, b) => a.urut - b.urut);
  if (!rs.length) return note(el, 'Belum ada catatan untuk kanal ini.');
  el.replaceChildren(...rs.map((b, i) => h('article', null, h('span', { class: 'mm-no' }, String(i + 1).padStart(2, '0')), h('h4', null, b.judul), h('p', null, b.isi))));
});
brief('brief-a', 'Analisis'); brief('brief-r', 'Rekomendasi');

dash.draw('chips', (el) => {
  if (!ready(el)) return;
  const kids = [h('span', null, nf(neg().filter((r) => hit(r)).length) + ' dari ' + nf(neg().length) + ' konten negatif')];
  [['lini', 'Lini'], ['kluster', 'Isu']].forEach(([k, lab]) => { if (S.f[k]) kids.push(h('button', { type: 'button', class: 'mm-chip', 'aria-pressed': 'true', onclick: () => tog(k, S.f[k]) }, lab + ': ' + S.f[k] + ' ✕')); });
  el.replaceChildren(...kids);
});

dash.draw('feed', (tb) => {
  if (!ready(tb)) return;
  const rs = neg().filter((r) => hit(r)).sort((a, b) => (ts(b) || 0) - (ts(a) || 0)).slice(0, 300);
  if (!rs.length) { tb.replaceChildren(h('tr', null, h('td', { colspan: '7' }, NONE))); return; }
  tb.replaceChildren(...rs.map((r) => { const u = safe(r.link); return h('tr', { class: r.id === S.sel ? 'mm-on' : null, onclick: () => pick(r.id) },
    h('td', { class: 'mm-nw' }, waktu(r)), h('td', { class: 'mm-nw' }, r.saluran), h('td', null, r.sumber), h('td', null, u ? h('a', { href: u, target: '_blank', rel: 'noopener noreferrer' }, r.judul) : r.judul), h('td', null, r.lini), h('td', null, r.kluster), h('td', { class: 'mm-r' }, r.views != null ? nf(r.views) : '–')); }));
});

dash.onData(sync);
})();
