(() => {
'use strict';
const app = document.querySelector('.app'); if (!app) return;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Konstanta ---------- */
const BLN3 = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MODE_NAME = { D: 'Harian', W: 'Mingguan', M: 'Bulanan', Y: 'Tahunan' };
const LINI = ['Group', 'Agribusiness', 'Pulp & Paper', 'Property', 'Financial', 'Technology', 'Energy & Infrastructure', 'Belum dikategorikan'];
const LV = { 'Group': '--l-group', 'Agribusiness': '--l-agri', 'Pulp & Paper': '--l-pp', 'Property': '--l-prop', 'Financial': '--l-fin', 'Technology': '--l-tech', 'Energy & Infrastructure': '--l-energy', 'Belum dikategorikan': '--l-none' };
const AB = { 'Group': 'Group', 'Agribusiness': 'Agri', 'Pulp & Paper': 'P&P', 'Property': 'Properti', 'Financial': 'Finansial', 'Technology': 'Tekno', 'Energy & Infrastructure': 'Energi', 'Belum dikategorikan': 'Belum' };
const SAL = ['Media Online', 'Threads', 'X', 'Facebook'];
const SV = { 'Media Online': '--ch-online', 'Threads': '--ch-threads', 'X': '--ch-x', 'Facebook': '--ch-fb' };
const SC = (s) => 'var(' + (SV[s] || '--fg-subtle') + ')';
const LC = (l) => 'var(' + (LV[l] || '--l-none') + ')';
const SENT = [['Negatif', 'var(--neg)'], ['Netral atau promosi', 'var(--neu)'], ['Positif', 'var(--pos)'], ['Tidak relevan', 'var(--irr)']];
const sentOf = (r) => r.status !== 'Dibuang' ? SENT[0][0] : r.sentimen === 'Netral' ? SENT[1][0] : r.sentimen === 'Positif' ? SENT[2][0] : SENT[3][0];
const STOP = new Set('yang dari untuk dengan pada dalam tidak akan juga atau karena oleh sebagai bisa saat sudah lebih telah kami kita saya mereka para serta hingga agar jadi kalau tapi bukan sampai masih baru lagi bagi atas soal usai hari kata yakni https http banget udah nggak tetap sama buat kalo lalu maka antara seperti tersebut terkait kepada namun secara setelah belum harus dapat hanya adalah bahwa kembali tahun ini itu dan ada akibat jelang tanpa lewat masuk makin semakin sebut disebut diduga unggahan threads rincian tercatat menyebut'.split(' '));
const PER = 20;
const NONE = 'Tidak ada konten yang cocok dengan saringan.';
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Status ---------- */
const S = { mode: 'D', key: null, f: { lini: null, kluster: null, saluran: null, q: '' }, qRaw: '', tab: 'Media Online', sort: { col: 'waktu', dir: -1 }, page: 0, cloud: 'cloud', view: 'chart', open: null };
const P = new URLSearchParams(location.search);
if (MODE_NAME[P.get('m')]) S.mode = P.get('m');
if (SAL.includes(P.get('s'))) S.f.saluran = P.get('s');
if (P.get('l')) S.f.lini = P.get('l');
if (P.get('i')) S.f.kluster = P.get('i');
if (P.get('q')) { S.qRaw = P.get('q'); S.f.q = S.qRaw.trim().toLowerCase(); }
const wantKey = P.get('k');
let keyApplied = false, revealed = false;

/* ---------- Pembantu ---------- */
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
  for (const k in attrs || {}) { const v = attrs[k]; if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k === 'style') e.style.cssText = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c);
  return e;
};
const NS = 'http://www.w3.org/2000/svg';
const icon = (id, cls) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('class', 'ic' + (cls ? ' ' + cls : '')); s.setAttribute('aria-hidden', 'true'); const u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#i-' + id); s.append(u); return s; };
const empty = (el, t, ic) => el.replaceChildren(h('div', { class: 'empty' }, icon(ic || 'search'), h('span', null, t)));
const note = (t) => h('p', { class: 'note' }, icon('info'), h('span', null, t));

const ent = () => dash.data('semua');
const ring = () => { const d = dash.data('ringkasan'); return d.status === 'ok' && Array.isArray(d.data) ? d.data : []; };
const modeRows = () => ring().filter((r) => r.mode === S.mode);
const keys = () => modeRows().map((r) => r.key);
const R = () => ring().find((r) => r.pid === S.mode + '_' + S.key);
const all = () => ent().data.filter((r) => KEY[S.mode](r.lap) === S.key);
const neg = () => all().filter((r) => r.status !== 'Dibuang');
const hit = (r, no) => { no = no || {}; return (no.lini || !S.f.lini || r.lini === S.f.lini) && (no.kluster || !S.f.kluster || r.kluster === S.f.kluster) && (no.saluran || !S.f.saluran || r.saluran === S.f.saluran) && (!S.f.q || (r.judul + ' ' + r.sumber + ' ' + r.isu + ' ' + r.kluster + ' ' + r.lini).toLowerCase().includes(S.f.q)); };
const ts = (r) => r.jam ? Date.UTC(+r.tgl.slice(0, 4), +r.tgl.slice(5, 7) - 1, +r.tgl.slice(8, 10), +r.jam.slice(0, 2), +r.jam.slice(3, 5)) : null;
const when = (r) => ts(r) ?? date(r.tgl).getTime();
const waktu = (r) => +r.tgl.slice(8, 10) + ' ' + BLN3[+r.tgl.slice(5, 7) - 1] + (r.jam ? ' · ' + r.jam : '');
const ready = () => ent().status === 'ok' && !!S.key;
const shortLabel = (r) => { if (!r) return ''; const k = r.key; if (r.mode === 'D') { const d = date(k); return d.getUTCDate() + ' ' + BLN3[d.getUTCMonth()]; } if (r.mode === 'W') { const d = date(k); return 'pekan ' + d.getUTCDate() + ' ' + BLN3[d.getUTCMonth()]; } if (r.mode === 'M') return BLN3[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4); return k; };

/* ---------- Tooltip global ---------- */
const tipEl = $('.tip');
const place = (x, y) => { const w = tipEl.offsetWidth, hh = tipEl.offsetHeight; let l = x + 14, t = y + 14; if (l + w > innerWidth - 8) l = x - w - 14; if (t + hh > innerHeight - 8) t = y - hh - 14; tipEl.style.left = Math.max(8, l) + 'px'; tipEl.style.top = Math.max(8, t) + 'px'; };
const T = {
  fill(lines) { tipEl.replaceChildren(...lines.filter(Boolean).map((l, i) => h('div', { class: i ? null : 'tip-h' }, l))); tipEl.hidden = false; },
  show(ev, lines) { T.fill(lines); place(ev.clientX, ev.clientY); },
  at(el, lines) { T.fill(lines); const b = el.getBoundingClientRect(); place(b.left + b.width / 2, b.top); },
  hide() { tipEl.hidden = true; },
};

/* ---------- Sinkronisasi dan URL ---------- */
const writeURL = () => {
  const p = new URLSearchParams();
  p.set('m', S.mode); if (S.key) p.set('k', S.key);
  if (S.f.saluran) p.set('s', S.f.saluran); if (S.f.lini) p.set('l', S.f.lini); if (S.f.kluster) p.set('i', S.f.kluster); if (S.qRaw.trim()) p.set('q', S.qRaw.trim());
  try { history.replaceState(null, '', location.pathname + '?' + p.toString() + location.hash); } catch (e) { /* abaikan */ }
};
const sync = () => {
  const ok = ent().status === 'ok';
  if (!keyApplied && wantKey && keys().includes(wantKey)) { S.key = wantKey; keyApplied = true; }
  const ks = keys(); if (ks.length && !ks.includes(S.key)) S.key = ks[ks.length - 1];
  const i = ks.indexOf(S.key), any = !!(S.f.lini || S.f.kluster || S.f.saluran || S.f.q);
  document.documentElement.classList.toggle('is-loading', !ok);
  $$('.loaderr').forEach((x) => { x.hidden = !['semua', 'catatan', 'ringkasan'].some((n) => dash.data(n).status === 'error'); });
  if (ok && !revealed) { revealed = true; $$('.card').forEach((c, j) => c.style.setProperty('--i', Math.min(j, 14))); app.classList.add('reveal'); }
  $$('.seg-b[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
  $$('.view-b').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === S.view)));
  $$('.cloud-b').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cloud === S.cloud)));
  $$('.step').forEach((b) => { const j = i + +b.dataset.step; b.disabled = i < 0 || j < 0 || j >= ks.length; });
  $$('.tab').forEach((b) => { const on = b.dataset.tab === S.tab; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  $$('.reset').forEach((b) => { b.disabled = !any; });
  $$('.mm-search').forEach((x) => { if (x.value !== S.qRaw) x.value = S.qRaw; });
  $$('th[data-col]').forEach((th) => { if (th.dataset.col === S.sort.col) th.setAttribute('aria-sort', S.sort.dir > 0 ? 'ascending' : 'descending'); else th.removeAttribute('aria-sort'); });
  if (ok) writeURL();
};
const NAMES = ['periode', 'top-sub', 'updated', 'pills', 'chips', 's-label', 's-total', 's-hari', 's-kluster', 's-pct', 's-lini', 'facts', 'kpi-entri', 'kpi-total', 'kpi-pct', 'kpi-eng', 'kpi-views', 'tren', 'sentimen', 'lini', 'isu', 'kanal', 'sumber', 'jangkauan', 'kata', 'matriks', 'sorotan', 'brief-tgl', 'brief-a', 'brief-r', 'feed-count', 'feed', 'pager'];
const redraw = (names) => { T.hide(); sync(); (names || NAMES).forEach((n) => dash.draw(n)); };
const filtersChanged = () => { S.page = 0; redraw(); };
const setMode = (m, key) => { keyApplied = true; const cur = ready() ? all().map((r) => r.lap).sort().pop() : null; S.mode = m; S.key = key || (cur ? KEY[m](cur) : null); S.page = 0; redraw(); };
const tog = (k, v) => { S.f[k] = S.f[k] === v ? null : v; filtersChanged(); };
const cari = (q) => { S.qRaw = q; S.f.q = q.trim().toLowerCase(); filtersChanged(); };

/* ---------- Teks atas ---------- */
const textDraw = (name, fn) => dash.draw(name, (el) => { const r = R(); el.replaceChildren(r ? fn(r) : '—'); });
textDraw('s-label', (r) => r.label);
textDraw('s-total', (r) => nf(r.total));
textDraw('s-hari', (r) => String(r.hari));
textDraw('s-kluster', (r) => r.kluster_top);
textDraw('s-pct', (r) => r.kluster_top_pct + '%');
textDraw('s-lini', (r) => 'Sinar Mas ' + r.lini_top);
dash.draw('top-sub', (el) => { const r = R(); el.replaceChildren(r ? MODE_NAME[S.mode] + ' · ' + r.label + ' · ' + nf(r.total) + ' konten negatif' : (ent().status === 'error' ? 'Data gagal dimuat' : 'Memuat data…')); });
dash.draw('updated', (el) => {
  const d = ent(); if (d.status !== 'ok' || !d.data.length) { el.replaceChildren('—'); return; }
  const t = date(d.data.map((r) => r.lap).sort().pop());
  el.replaceChildren(t.getUTCDate() + ' ' + BLN[t.getUTCMonth()] + ' ' + t.getUTCFullYear());
});
dash.draw('periode', (sel) => {
  sel.replaceChildren(...modeRows().slice().reverse().map((r) => new Option(r.label + '  (' + nf(r.total) + ')', r.key)));
  sel.value = S.key || '';
  sel.onchange = () => { keyApplied = true; S.key = sel.value; S.page = 0; redraw(); };
});
dash.draw('pills', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const base = neg().filter((r) => hit(r, { saluran: 1 })), c = d3.rollup(base, (v) => v.length, (r) => r.saluran);
  const mk = (val, label, n, col) => h('button', { type: 'button', class: 'pill', 'data-sal': val, 'aria-pressed': String((val || null) === S.f.saluran) }, col ? h('span', { class: 'dot', style: 'background:' + col }) : null, label, h('span', { class: 'cnt' }, nf(n)));
  el.replaceChildren(mk('', 'Semua', base.length), ...SAL.filter((s) => c.get(s) || S.f.saluran === s).map((s) => mk(s, s === 'Media Online' ? 'Media online' : s, c.get(s) || 0, SC(s))));
});
dash.draw('chips', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const kids = [];
  [['lini', 'Lini'], ['kluster', 'Isu']].forEach(([k, lab]) => { if (S.f[k]) kids.push(h('button', { type: 'button', class: 'chip', 'aria-label': 'Hapus saringan ' + lab + ' ' + S.f[k], onclick: () => tog(k, S.f[k]) }, lab + ': ' + S.f[k], icon('x'))); });
  const shown = neg().filter((r) => hit(r)).length, tot = neg().length;
  kids.push(h('span', null, h('b', { class: 'num' }, nf(shown)), ' dari ', h('span', { class: 'num' }, nf(tot)), ' konten negatif'));
  el.replaceChildren(...kids);
});
dash.draw('facts', (el) => {
  const r = R(); if (!r || !ready()) { el.replaceChildren(); return; }
  const rows = neg(), top = (f) => d3.rollups(rows, (v) => v.length, (x) => x[f]).sort((a, b) => b[1] - a[1])[0];
  const src = top('sumber'), ch = top('saluran');
  const peak = [...modeRows()].sort((a, b) => b.total - a.total)[0];
  const fact = (dt, dd, n) => h('div', { class: 'fact' }, h('dt', null, dt), h('dd', null, dd, n != null ? h('span', { class: 'num' }, ' · ' + nf(n)) : null));
  el.replaceChildren(
    fact('Isu dominan', r.kluster_top, r.kluster_top_n),
    fact('Lini paling disorot', 'Sinar Mas ' + r.lini_top, r.lini_top_n),
    fact('Sumber teraktif', src ? src[0] : '—', src ? src[1] : null),
    fact('Kanal dominan', ch ? ch[0] : '—', ch ? ch[1] : null),
    fact('Puncak ' + MODE_NAME[S.mode].toLowerCase(), peak ? peak.label : '—', peak ? peak.total : null),
    fact('Sumber unik', nf(r.sumber_n) + ' media dan akun'));
});

/* ---------- KPI dengan sparkline ---------- */
const spark = (vals, label) => {
  if (vals.length < 2) return h('div', { class: 'spark-empty' }, 'Belum ada periode pembanding');
  const W = 120, H = 32, mx = Math.max(...vals) || 1, step = W / (vals.length - 1);
  const pts = vals.map((v, i) => [i * step, H - 2 - (v / mx) * (H - 6)]);
  const line = 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'spark'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label);
  const a = document.createElementNS(NS, 'path'); a.setAttribute('class', 'spark-area'); a.setAttribute('d', line + 'L' + W + ',' + H + 'L0,' + H + 'Z');
  const l = document.createElementNS(NS, 'path'); l.setAttribute('class', 'spark-line'); l.setAttribute('d', line);
  svg.append(a, l); return svg;
};
[['kpi-entri', 'entri', nf, 'Total temuan'], ['kpi-total', 'total', nf, 'Konten negatif'], ['kpi-pct', 'neg_pct', (v) => v + '%', 'Porsi negatif'], ['kpi-eng', 'interaksi', nf, 'Interaksi'], ['kpi-views', 'views', nf, 'Tayangan']].forEach(([name, field, fmt, label]) => dash.draw(name, (el) => {
  const rows = modeRows(), i = rows.findIndex((r) => r.key === S.key), r = rows[i];
  if (!r) { el.replaceChildren(); return; }
  const prev = i > 0 ? rows[i - 1] : null, v = r[field], pv = prev ? prev[field] : null, isPct = field === 'neg_pct';
  const dv = prev == null ? null : isPct ? v - pv : pv ? Math.round((v - pv) / pv * 100) : null;
  let badge;
  if (!prev) badge = h('span', { class: 'delta flat' }, 'Periode pertama');
  else if (dv == null) badge = h('span', { class: 'delta flat' }, v ? 'Baru muncul' : 'Tetap nol');
  else badge = h('span', { class: 'delta ' + (dv > 0 ? 'up' : dv < 0 ? 'down' : 'flat'), 'aria-label': (dv > 0 ? 'Naik ' : dv < 0 ? 'Turun ' : 'Tetap ') + Math.abs(dv) + (isPct ? ' poin' : ' persen') }, dv ? icon(dv > 0 ? 'up' : 'down') : null, (dv > 0 ? '+' : dv < 0 ? '−' : '±') + Math.abs(dv) + (isPct ? ' poin' : '%'));
  const series = rows.slice(Math.max(0, i - 11), i + 1);
  el.replaceChildren(
    h('div', { class: 'kpi-num' }, fmt(v)),
    h('div', { class: 'kpi-delta' }, badge, prev ? h('span', { class: 'kpi-vs' }, 'vs ' + shortLabel(prev)) : null),
    spark(series.map((x) => +x[field] || 0), label + ' pada ' + series.length + ' periode terakhir, dari ' + fmt(series[0][field]) + ' ke ' + fmt(v)));
}));

/* ---------- Tren ---------- */
const trendBins = (base, rows) => {
  let bins, kf;
  if (S.mode === 'D') {
    const end = date(S.key).getTime() + 16 * 36e5, start = end - 864e5;
    bins = d3.range(24).map((i) => { const t = new Date(start + i * 36e5), hh = String(t.getUTCHours()).padStart(2, '0') + '.00'; return { k: i, lab: hh, full: t.getUTCDate() + ' ' + BLN3[t.getUTCMonth()] + ', ' + hh + '–' + String((t.getUTCHours() + 1) % 24).padStart(2, '0') + '.00' }; });
    kf = (r) => { const t = ts(r); return t == null ? null : Math.max(0, Math.min(23, Math.floor((t - start) / 36e5))); };
  } else if (S.mode === 'W') { bins = d3.range(7).map((i) => { const d = date(S.key); d.setUTCDate(d.getUTCDate() + i); return { k: iso(d), lab: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i] + ' ' + d.getUTCDate(), full: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][i] + ', ' + d.getUTCDate() + ' ' + BLN3[d.getUTCMonth()], go: 'D' }; }); kf = (r) => r.lap; }
  else if (S.mode === 'M') { bins = d3.range(1, new Date(Date.UTC(+S.key.slice(0, 4), +S.key.slice(5, 7), 0)).getUTCDate() + 1).map((i) => ({ k: S.key + '-' + String(i).padStart(2, '0'), lab: String(i), full: i + ' ' + BLN3[+S.key.slice(5, 7) - 1], go: 'D' })); kf = (r) => r.lap; }
  else { bins = d3.range(12).map((i) => ({ k: S.key + '-' + String(i + 1).padStart(2, '0'), lab: BLN3[i], full: BLN[i] + ' ' + S.key, go: 'M' })); kf = (r) => r.lap.slice(0, 7); }
  bins.forEach((b) => { const rs = rows.filter((r) => kf(r) === b.k); b.p = SAL.map((s) => rs.filter((r) => r.saluran === s).length); b.n = d3.sum(b.p); b.has = !!b.go && base.some((r) => kf(r) === b.k); });
  return { bins, kf };
};
dash.draw('tren', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const base = neg(), rows = base.filter((r) => hit(r, { saluran: 1 }));
  if (!base.length) return empty(el, 'Tidak ada konten negatif pada periode ini.', 'inbox');
  const { bins, kf } = trendBins(base, rows);
  const tanpaJam = S.mode === 'D' ? rows.filter((r) => kf(r) == null).length : 0;
  const used = SAL.filter((s, i) => bins.some((b) => b.p[i]));
  if (S.mode === 'D' && !bins.some((b) => b.n)) {
    return el.replaceChildren(h('div', { class: 'empty' }, icon('info'), h('span', null, 'Jam unggah tidak tercatat untuk ' + nf(rows.length) + ' konten pada hari ini, sehingga sebaran per jam tidak dapat digambar.'), h('button', { type: 'button', class: 'btn', onclick: () => setMode('W') }, 'Lihat tren mingguan')));
  }
  if (S.view === 'table') {
    const vis = S.mode === 'D' || S.mode === 'Y' ? bins.filter((b) => b.n) : bins.filter((b) => b.n || b.has);
    el.replaceChildren(h('div', { class: 'table-wrap', style: 'margin-top:0;border-top:0' }, h('table', { class: 'table', style: 'min-width:520px' },
      h('caption', { class: 'sr-only' }, 'Jumlah konten negatif per ' + (S.mode === 'D' ? 'jam' : S.mode === 'Y' ? 'bulan' : 'hari')),
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, S.mode === 'D' ? 'Jam' : S.mode === 'Y' ? 'Bulan' : 'Tanggal'), used.map((s) => h('th', { scope: 'col', class: 'r' }, s)), h('th', { scope: 'col', class: 'r' }, 'Total'))),
      h('tbody', null, vis.length ? vis.map((b) => h('tr', { style: 'cursor:default' }, h('td', null, b.full || b.lab), used.map((s) => h('td', { class: 'r num' }, nf(b.p[SAL.indexOf(s)]))), h('td', { class: 'r num' }, h('b', null, nf(b.n))))) : h('tr', null, h('td', { colspan: used.length + 2 }, NONE))))));
    if (tanpaJam) el.append(note(nf(tanpaJam) + ' konten tanpa jam unggah tidak masuk tabel ini.'));
    return;
  }
  const w = Math.max(280, el.clientWidth), H = 290, m = { t: 22, r: 6, b: 28, l: 34 };
  el.replaceChildren();
  const x = d3.scaleBand(bins.map((b) => b.k), [m.l, w - m.r]).padding(S.mode === 'D' ? 0.22 : 0.28);
  const y = d3.scaleLinear([0, d3.max(bins, (b) => b.n) || 1], [H - m.b, m.t]).nice(4);
  const peak = bins.reduce((a, b) => (b.n > a.n ? b : a), bins[0]);
  const svg = d3.select(el).append('svg').attr('width', w).attr('height', H).attr('role', 'img')
    .attr('aria-label', 'Konten negatif per ' + (S.mode === 'D' ? 'jam' : S.mode === 'Y' ? 'bulan' : 'hari') + '. Puncak ' + nf(peak.n) + ' konten pada ' + (peak.full || peak.lab) + '.');
  const yt = y.ticks(4).filter(Number.isInteger);
  svg.append('g').selectAll('line').data(yt).join('line').attr('class', 'gridline').attr('x1', m.l).attr('x2', w - m.r).attr('y1', (d) => y(d)).attr('y2', (d) => y(d));
  svg.append('g').selectAll('text').data(yt).join('text').attr('x', m.l - 8).attr('y', (d) => y(d) + 4).attr('text-anchor', 'end').text((d) => nf(d));
  const every = Math.ceil((S.mode === 'D' ? 44 : 30) / Math.max(1, x.step()));
  const tipLines = (b) => [b.full || b.lab, nf(b.n) + ' konten negatif', ...SAL.map((s, i) => b.p[i] ? s + ': ' + nf(b.p[i]) : null), b.has ? 'Klik untuk membuka' : null];
  const g = svg.append('g').selectAll('g').data(bins).join('g').attr('class', (b) => 'bar-g' + (b.has ? '' : ' no-drill'))
    .attr('tabindex', (b) => b.n || b.has ? 0 : null).attr('role', (b) => b.has ? 'button' : null).attr('aria-label', (b) => (b.full || b.lab) + ': ' + nf(b.n) + ' konten negatif')
    .on('pointermove', (ev, b) => T.show(ev, tipLines(b))).on('pointerleave', T.hide)
    .on('focus', function (ev, b) { T.at(this, tipLines(b)); }).on('blur', T.hide)
    .on('click', (ev, b) => { if (b.has) setMode(b.go, b.k); })
    .on('keydown', (ev, b) => { if ((ev.key === 'Enter' || ev.key === ' ') && b.has) { ev.preventDefault(); setMode(b.go, b.k); } });
  g.append('rect').attr('class', 'bar-bg').attr('x', (b) => x(b.k) - x.step() * x.paddingInner() / 2).attr('width', x.step()).attr('y', m.t - 8).attr('height', H - m.b - m.t + 8).attr('rx', 6);
  g.each(function (b) {
    let acc = 0; const gg = d3.select(this);
    SAL.forEach((s, i) => { const v = b.p[i]; if (!v) return; gg.append('rect').attr('x', x(b.k)).attr('width', x.bandwidth()).attr('y', y(acc + v)).attr('height', Math.max(1, y(acc) - y(acc + v) - (acc ? 1.5 : 0))).attr('rx', Math.min(3, x.bandwidth() / 3)).attr('class', S.f.saluran && S.f.saluran !== s ? 'dim' : null).style('fill', SC(s)); acc += v; });
  });
  if (x.bandwidth() >= 16) g.filter((b) => b.n > 0).append('text').attr('class', 'lab').attr('x', (b) => x(b.k) + x.bandwidth() / 2).attr('y', (b) => y(b.n) - 6).attr('text-anchor', 'middle').text((b) => nf(b.n));
  svg.append('g').selectAll('text').data(bins.filter((b, i) => i % every === 0)).join('text').attr('x', (b) => x(b.k) + x.bandwidth() / 2).attr('y', H - 8).attr('text-anchor', 'middle').text((b) => b.lab);
  el.append(h('div', { class: 'legend', role: 'group', 'aria-label': 'Saring menurut jenis sumber' }, used.map((s) => h('button', { type: 'button', class: 'leg-b', 'aria-pressed': String(S.f.saluran === s), onclick: () => tog('saluran', s) }, h('i', { style: 'background:' + SC(s) }), s))));
  if (tanpaJam) el.append(note(nf(tanpaJam) + ' konten tanpa jam unggah tidak tergambar di grafik ini.'));
});

/* ---------- Donat sentimen ---------- */
dash.draw('sentimen', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const rows = all().filter((r) => hit(r)); if (!rows.length) return empty(el, NONE);
  const c = d3.rollup(rows, (v) => v.length, sentOf), parts = SENT.map(([n, k]) => ({ name: n, v: c.get(n) || 0, c: k })), total = rows.length;
  const size = Math.min(180, Math.max(140, el.clientWidth - 20)), r = size / 2;
  el.replaceChildren(); const wrap = h('div', { class: 'donut' }); el.append(wrap);
  const svg = d3.select(wrap).append('svg').attr('width', size).attr('height', size).attr('role', 'img').attr('aria-label', 'Sentimen: ' + parts.map((p) => p.name + ' ' + pct(p.v, total)).join(', '));
  const g = svg.append('g').attr('transform', 'translate(' + r + ',' + r + ')'), arc = d3.arc().innerRadius(r * 0.66).outerRadius(r - 1).cornerRadius(3).padAngle(0.012);
  g.selectAll('path').data(d3.pie().sort(null).value((p) => p.v)(parts.filter((p) => p.v > 0))).join('path').attr('d', arc).attr('class', 'arc').style('fill', (d) => d.data.c)
    .on('pointermove', (ev, d) => T.show(ev, [d.data.name, nf(d.data.v) + ' konten', pct(d.data.v, total) + ' dari temuan'])).on('pointerleave', T.hide);
  g.append('text').attr('class', 'big').attr('text-anchor', 'middle').attr('y', 6).text(nf(total));
  g.append('text').attr('text-anchor', 'middle').attr('y', 26).text('temuan');
  wrap.append(h('div', { class: 'leg' }, parts.map((p) => h('div', { class: 'leg-r' }, h('i', { class: 'sw', style: 'background:' + p.c }), h('span', { class: 'leg-n' }, p.name), h('b', null, nf(p.v)), h('span', { class: 'p' }, pct(p.v, total))))));
  if (rows.every((r) => r.status !== 'Dibuang')) el.append(note('Pada periode ini hanya konten negatif yang tercatat, sehingga porsi negatif selalu 100%.'));
});

/* ---------- Baris peringkat ---------- */
const rowBtn = ({ name, sub, v, share, fn, color, on, pctText, dot }) => h('button', { type: 'button', class: 'row', 'aria-pressed': on == null ? null : String(on), onclick: fn },
  h('span', { class: 'row-n' }, dot ? h('i', { class: 'sw', style: 'background:' + dot }) : null, h('span', null, name)),
  h('span', { class: 'row-v' }, nf(v), pctText ? h('small', null, pctText) : null),
  h('span', { class: 'row-b' }, h('i', { style: 'width:' + Math.max(2, Math.round(share * 100)) + '%' + (color ? ';background:' + color : '') })),
  sub ? h('span', { class: 'row-s' }, sub) : null);

dash.draw('lini', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const rows = neg().filter((r) => hit(r, { lini: 1 })); if (!rows.length) return empty(el, NONE);
  const g = d3.rollups(rows, (v) => v.length, (r) => r.lini).sort((a, b) => b[1] - a[1]), max = g[0][1];
  el.replaceChildren(
    h('div', { class: 'strip', role: 'img', 'aria-label': 'Komposisi lini: ' + g.map(([l, v]) => l + ' ' + pct(v, rows.length)).join(', ') }, g.map(([l, v]) => h('span', { style: 'flex:' + v + ';background:' + LC(l) + (S.f.lini && S.f.lini !== l ? ';opacity:.25' : ''), onpointermove: (ev) => T.show(ev, ['Sinar Mas ' + l, nf(v) + ' konten · ' + pct(v, rows.length)]), onpointerleave: T.hide }))),
    h('div', { class: 'rows' }, g.map(([l, v]) => rowBtn({ name: l === 'Belum dikategorikan' ? l : 'Sinar Mas ' + l, v, share: v / max, pctText: pct(v, rows.length), color: LC(l), dot: LC(l), on: S.f.lini === l, fn: () => tog('lini', l) }))));
});
dash.draw('isu', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const rows = neg().filter((r) => hit(r, { kluster: 1 })); if (!rows.length) return empty(el, NONE);
  const g = d3.groups(rows, (r) => r.kluster).map(([k, v]) => [k, v.length, d3.rollups(v, (x) => x.length, (x) => x.lini).sort((a, b) => b[1] - a[1])[0][0]]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  el.replaceChildren(h('div', { class: 'rows' }, g.map(([k, v, l]) => rowBtn({ name: k, v, share: v / g[0][1], pctText: pct(v, rows.length), sub: 'Paling banyak menyangkut Sinar Mas ' + l, on: S.f.kluster === k, fn: () => tog('kluster', k) }))));
});
dash.draw('kanal', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const rows = neg().filter((r) => hit(r, { saluran: 1 })); if (!rows.length) return empty(el, NONE);
  const c = d3.rollup(rows, (v) => v.length, (r) => r.saluran), max = d3.max(c.values()) || 1;
  el.replaceChildren(h('div', { class: 'rows' }, SAL.filter((s) => c.get(s)).map((s) => rowBtn({ name: s, v: c.get(s), share: c.get(s) / max, pctText: pct(c.get(s), rows.length), color: SC(s), dot: SC(s), on: S.f.saluran === s, fn: () => tog('saluran', s) }))));
});
dash.draw('sumber', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const g = d3.groups(neg().filter((r) => hit(r)), (r) => r.sumber).sort((a, b) => b[1].length - a[1].length).slice(0, 7);
  if (!g.length) return empty(el, NONE);
  el.replaceChildren(h('div', { class: 'rows' }, g.map(([n, v]) => rowBtn({ name: n, v: v.length, share: v.length / g[0][1].length, sub: v[0].saluran + ' · ' + v[0].kluster, color: SC(v[0].saluran), dot: SC(v[0].saluran), fn: () => cari(n) }))));
});
dash.draw('jangkauan', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const g = neg().filter((r) => hit(r) && r.views > 0).sort((a, b) => b.views - a.views).slice(0, 7);
  if (!g.length) return empty(el, 'Belum ada angka tayangan untuk konten yang tampil.', 'eye');
  el.replaceChildren(h('div', { class: 'rows' }, g.map((r) => rowBtn({ name: r.sumber, v: r.views, share: r.views / g[0].views, sub: cut(r.judul, 90), color: SC(r.saluran), dot: SC(r.saluran), fn: (ev) => openDrawer(r, ev.currentTarget) }))));
});
dash.draw('kata', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const c = new Map();
  neg().filter((r) => hit(r)).forEach((r) => new Set(String(r.judul || '').toLowerCase().match(/[a-zÀ-ɏ][a-zÀ-ɏ0-9]{3,}/g) || []).forEach((wd) => { if (!STOP.has(wd)) c.set(wd, (c.get(wd) || 0) + 1); }));
  const top = [...c].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 30);
  if (!top.length) return empty(el, NONE);
  if (S.cloud === 'list') {
    el.replaceChildren(h('div', { class: 'rows word-list' }, top.slice(0, 20).map(([wd, v]) => rowBtn({ name: wd, v, share: v / top[0][1], pctText: 'konten', fn: () => cari(wd) }))));
    return;
  }
  const fs = d3.scaleSqrt([top[top.length - 1][1], top[0][1]], [13, 34]);
  el.replaceChildren(h('div', { class: 'cloud' }, top.slice().sort((a, b) => a[0].localeCompare(b[0])).map(([wd, v]) => h('button', { type: 'button', class: 'word', 'aria-label': wd + ', muncul di ' + v + ' konten', style: 'font-size:' + Math.round(fs(v)) + 'px;opacity:' + (0.6 + 0.4 * v / top[0][1]).toFixed(2), onclick: () => cari(wd), onpointermove: (ev) => T.show(ev, [wd, 'Muncul di ' + nf(v) + ' konten', 'Klik untuk mencari']), onpointerleave: T.hide }, wd))));
});

/* ---------- Matriks ---------- */
dash.draw('matriks', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const rows = neg().filter((r) => hit(r, { lini: 1, kluster: 1 }));
  if (!rows.length) return empty(el, NONE);
  const ls = LINI.filter((l) => rows.some((r) => r.lini === l)), ks = d3.rollups(rows, (v) => v.length, (r) => r.kluster).sort((a, b) => b[1] - a[1]);
  const c = d3.rollup(rows, (v) => v.length, (r) => r.kluster, (r) => r.lini), max = d3.max(ks, ([k]) => d3.max(c.get(k).values())) || 1;
  el.replaceChildren(h('table', { class: 'mx' },
    h('caption', { class: 'sr-only' }, 'Jumlah konten negatif per isu dan lini bisnis'),
    h('thead', null, h('tr', null, h('th', { scope: 'col' }, h('span', { class: 'sr-only' }, 'Isu')), ls.map((l) => h('th', { scope: 'col', title: l }, AB[l])), h('th', { scope: 'col' }, 'Total'))),
    h('tbody', null, ks.map(([k, tot]) => h('tr', null, h('th', { scope: 'row', class: 'rowh' }, k), ls.map((l) => {
      const v = c.get(k).get(l) || 0, a = v ? 0.14 + 0.86 * v / max : 0, on = S.f.lini === l && S.f.kluster === k;
      return h('td', null, h('button', { type: 'button', class: 'cell' + (v ? '' : ' zero') + (a > 0.55 ? ' hot' : ''), style: '--a:' + a.toFixed(2), disabled: !v, 'aria-pressed': v ? String(on) : null, 'aria-label': k + ', Sinar Mas ' + l + ': ' + v + ' konten',
        onpointermove: (ev) => v && T.show(ev, [k, 'Sinar Mas ' + l, nf(v) + ' konten', 'Klik untuk menyaring']), onpointerleave: T.hide,
        onclick: () => { if (!v) return; S.f.lini = on ? null : l; S.f.kluster = on ? null : k; filtersChanged(); } }, v ? nf(v) : '0'));
    }), h('td', { class: 'tot' }, nf(tot)))))));
});

/* ---------- Detail konten ---------- */
const detail = (r, inDrawer) => {
  const st = [['Tayangan', r.views], ['Suka', r.likes], ['Unggah ulang', r.reposts], ['Balasan', r.replies]].filter((s) => s[1] != null), u = safe(r.link);
  return [
    h('div', { class: 'spot-meta' }, h('span', { class: 'badge' }, h('i', { class: 'sw', style: 'background:' + SC(r.saluran) }), r.saluran), h('span', null, waktu(r)), r.status === 'Dibuang' ? h('span', { class: 'badge muted' }, 'Dibuang') : h('span', { class: 'badge neg' }, 'Negatif')),
    h('div', { class: 'spot-src' }, r.sumber),
    h(inDrawer ? 'h3' : 'p', { class: 'spot-t' }, r.judul),
    h('p', { class: 'spot-i' }, r.isu),
    h('div', { class: 'tags' }, h('span', { class: 'badge' }, h('i', { class: 'sw', style: 'background:' + LC(r.lini) }), 'Sinar Mas ' + r.lini), h('span', { class: 'badge' }, r.kluster), h('span', { class: 'badge muted' }, 'Laporan ' + waktu({ tgl: r.lap, jam: '' }))),
    st.length ? h('div', { class: 'stats' }, st.map((s) => h('div', null, h('b', null, nf(s[1])), s[0]))) : null,
    r.catatan ? h('p', { class: 'callout' }, r.catatan) : null,
  ].concat(u ? [h('div', { class: 'actions' }, h('a', { class: 'btn btn-primary', href: u, target: '_blank', rel: 'noopener noreferrer' }, 'Buka sumber', icon('ext')))] : []);
};
dash.draw('sorotan', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const rows = neg().filter((x) => hit(x)), r = rows.slice().sort((a, b) => (b.views || 0) - (a.views || 0) || (b.likes || 0) - (a.likes || 0) || when(b) - when(a))[0];
  if (!r) return empty(el, NONE);
  const nodes = detail(r, false);
  nodes.push(h('div', { class: 'actions' }, h('button', { type: 'button', class: 'btn', onclick: (ev) => openDrawer(r, ev.currentTarget) }, 'Lihat detail')));
  el.replaceChildren(...nodes.filter(Boolean));
});

const wrapEl = $('.drawer-wrap'), drawer = $('.drawer'), body = $('#drawer-body');
let lastFocus = null;
const focusables = () => $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', drawer);
function openDrawer(r, from) {
  lastFocus = from || document.activeElement; S.open = r.id; T.hide();
  body.replaceChildren(...detail(r, true).filter(Boolean));
  wrapEl.hidden = false; document.body.style.overflow = 'hidden';
  $('.drawer-close').focus();
  dash.draw('feed');
}
function closeDrawer() {
  if (wrapEl.hidden) return;
  wrapEl.hidden = true; document.body.style.overflow = ''; S.open = null;
  dash.draw('feed');
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

/* ---------- Temuan ---------- */
const lastLap = () => all().map((r) => r.lap).sort().pop();
dash.draw('brief-tgl', (el) => {
  if (!ready()) { el.replaceChildren('—'); return; }
  const r = ring().find((x) => x.pid === 'D_' + lastLap()); el.replaceChildren(r ? r.label : '—');
});
const brief = (name, jenis) => dash.draw(name, (el) => {
  const d = dash.data('catatan'); if (d.status !== 'ok' || !ready()) { el.replaceChildren(); return; }
  const lap = lastLap(), rs = d.data.filter((b) => b.lap === lap && b.kanal === S.tab && b.jenis === jenis).sort((a, b) => a.urut - b.urut);
  if (!rs.length) return empty(el, 'Belum ada catatan ' + jenis.toLowerCase() + ' untuk ' + S.tab.toLowerCase() + ' pada hari ini.', 'file');
  el.replaceChildren(...rs.map((b, i) => h('article', null, h('span', { class: 'no' }, String(i + 1).padStart(2, '0')), h('h4', null, b.judul), h('p', null, b.isi))));
});
brief('brief-a', 'Analisis'); brief('brief-r', 'Rekomendasi');

/* ---------- Tabel ---------- */
const SORTERS = { waktu: when, kanal: (r) => r.saluran, sumber: (r) => r.sumber.toLowerCase(), lini: (r) => r.lini, isu: (r) => r.kluster, views: (r) => r.views ?? -1 };
const feedRows = () => { const get = SORTERS[S.sort.col] || when, d = S.sort.dir; return neg().filter((r) => hit(r)).sort((a, b) => { const x = get(a), y = get(b); return (x < y ? -1 : x > y ? 1 : 0) * d || when(b) - when(a) || b.id - a.id; }); };
dash.draw('feed-count', (el) => {
  if (!ready()) { el.replaceChildren('—'); return; }
  const n = neg().filter((r) => hit(r)).length;
  el.replaceChildren(nf(n) + ' konten negatif dalam periode dan saringan aktif. Pilih baris untuk melihat detail.');
});
dash.draw('feed', (tb) => {
  if (!ready()) { tb.replaceChildren(); return; }
  const rs = feedRows(), pages = Math.max(1, Math.ceil(rs.length / PER)); if (S.page >= pages) S.page = pages - 1;
  const slice = rs.slice(S.page * PER, S.page * PER + PER);
  if (!slice.length) { tb.replaceChildren(h('tr', { style: 'cursor:default' }, h('td', { colspan: '8' }, h('div', { class: 'empty', style: 'min-height:120px' }, icon('search'), NONE)))); return; }
  tb.replaceChildren(...slice.map((r) => { const u = safe(r.link); return h('tr', { tabindex: '0', class: S.open === r.id ? 'on' : null, 'aria-label': r.sumber + ': ' + r.judul, onclick: (ev) => { if (!ev.target.closest('a')) openDrawer(r, ev.currentTarget); }, onkeydown: (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openDrawer(r, ev.currentTarget); } } },
    h('td', { class: 'nw num t-mut' }, waktu(r)),
    h('td', { class: 'nw' }, h('span', { class: 'badge' }, h('i', { class: 'sw', style: 'background:' + SC(r.saluran) }), r.saluran)),
    h('td', { class: 't-src' }, r.sumber),
    h('td', { class: 't-judul' }, r.judul),
    h('td', { class: 'nw t-mut' }, r.lini),
    h('td', { class: 't-mut' }, r.kluster),
    h('td', { class: 'r num' }, r.views != null ? nf(r.views) : '–'),
    h('td', null, u ? h('a', { class: 'link-ic', href: u, target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Buka sumber ' + r.sumber, onclick: (ev) => ev.stopPropagation() }, icon('ext')) : null)); }));
});
dash.draw('pager', (el) => {
  if (!ready()) { el.replaceChildren(); return; }
  const n = neg().filter((r) => hit(r)).length, pages = Math.max(1, Math.ceil(n / PER)), a = n ? S.page * PER + 1 : 0, b = Math.min(n, (S.page + 1) * PER);
  el.replaceChildren(h('span', null, 'Menampilkan ', h('b', { class: 'num' }, nf(a) + '–' + nf(b)), ' dari ', h('b', { class: 'num' }, nf(n))),
    h('span', { class: 'pager-b' },
      h('button', { type: 'button', class: 'icon-btn', 'data-page': '-1', 'aria-label': 'Halaman sebelumnya', disabled: S.page <= 0 }, icon('left')),
      h('span', { class: 'num' }, 'Hal. ' + (S.page + 1) + ' / ' + pages),
      h('button', { type: 'button', class: 'icon-btn', 'data-page': '1', 'aria-label': 'Halaman berikutnya', disabled: S.page >= pages - 1 }, icon('right'))));
});

/* ---------- Ekspor dan berbagi ---------- */
const toast = (t) => { const el = $('.toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 2400); };
const exportCSV = () => {
  if (!ready()) return;
  const cols = [['tanggal_laporan', 'lap'], ['tanggal_unggah', 'tgl'], ['jam', 'jam'], ['kanal', 'kanal'], ['saluran', 'saluran'], ['sumber', 'sumber'], ['judul_atau_isi', 'judul'], ['tautan', 'link'], ['lini_bisnis', 'lini'], ['isu', 'isu'], ['kelompok_isu', 'kluster'], ['sentimen', 'sentimen'], ['tayangan', 'views'], ['suka', 'likes'], ['unggah_ulang', 'reposts'], ['balasan', 'replies'], ['status', 'status'], ['catatan', 'catatan']];
  const q = (v) => { const s = v == null ? '' : String(v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const rows = feedRows(), csv = '﻿' + [cols.map((c) => c[0]).join(','), ...rows.map((r) => cols.map((c) => q(r[c[1]])).join(','))].join('\r\n');
  const a = h('a', { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), download: 'monitoring-sinarmas-' + S.mode + '-' + S.key + '.csv' });
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast(nf(rows.length) + ' baris diunduh sebagai CSV');
};
const share = async () => {
  writeURL();
  try { await navigator.clipboard.writeText(location.href); toast('Tautan tampilan ini disalin'); }
  catch (e) { toast('Salin tautan dari bilah alamat browser'); }
};

/* ---------- Tema dan navigasi samping ---------- */
const setTheme = (t) => { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('mm-theme', t); } catch (e) { /* abaikan */ } };
const side = $('#side'), scrim = $('.scrim'), menuBtn = $('.menu-btn');
const openSide = (open) => { side.classList.toggle('open', open); scrim.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); if (open) $('.nav-a', side).focus(); };

/* ---------- Peristiwa ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, a'); if (!t) { if (e.target.closest('.drawer-scrim')) closeDrawer(); if (e.target === scrim) openSide(false); return; }
  if (t.classList.contains('pill')) { S.f.saluran = t.dataset.sal || null; filtersChanged(); }
  else if (t.dataset.mode) setMode(t.dataset.mode);
  else if (t.dataset.step) { const ks = keys(), k = ks[ks.indexOf(S.key) + +t.dataset.step]; if (k) { keyApplied = true; S.key = k; S.page = 0; redraw(); } }
  else if (t.dataset.tab) { S.tab = t.dataset.tab; redraw(['brief-a', 'brief-r']); }
  else if (t.dataset.view) { S.view = t.dataset.view; redraw(['tren']); }
  else if (t.dataset.cloud) { S.cloud = t.dataset.cloud; redraw(['kata']); }
  else if (t.dataset.sort) { const c = t.dataset.sort; S.sort = S.sort.col === c ? { col: c, dir: -S.sort.dir } : { col: c, dir: c === 'waktu' || c === 'views' ? -1 : 1 }; S.page = 0; redraw(['feed', 'pager']); }
  else if (t.dataset.page) { S.page += +t.dataset.page; redraw(['feed', 'pager']); $('#sec-daftar').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  else if (t.classList.contains('reset')) { S.f = { lini: null, kluster: null, saluran: null, q: '' }; S.qRaw = ''; filtersChanged(); }
  else if (t.classList.contains('export-btn')) exportCSV();
  else if (t.classList.contains('share-btn')) share();
  else if (t.classList.contains('theme-btn')) setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  else if (t.classList.contains('menu-btn')) openSide(true);
  else if (t.classList.contains('side-close')) { openSide(false); menuBtn.focus(); }
  else if (t.classList.contains('nav-a') && innerWidth < 1024) openSide(false);
  else if (t.classList.contains('drawer-close')) closeDrawer();
});
let qt = null;
document.addEventListener('input', (e) => { if (e.target.classList && e.target.classList.contains('mm-search')) { S.qRaw = e.target.value; clearTimeout(qt); qt = setTimeout(() => { S.f.q = S.qRaw.trim().toLowerCase(); filtersChanged(); }, 180); } });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (!wrapEl.hidden) closeDrawer(); else if (side.classList.contains('open')) { openSide(false); menuBtn.focus(); } T.hide(); }
  if (e.key === 'Tab' && !wrapEl.hidden) { const f = focusables(); if (!f.length) return; const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && e.target.classList && e.target.classList.contains('tab')) { const tabs = $$('.tab'), i = tabs.indexOf(e.target), n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; S.tab = n.dataset.tab; redraw(['brief-a', 'brief-r']); n.focus(); }
  if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName) && wrapEl.hidden) { e.preventDefault(); $('.mm-search').focus(); }
});
window.addEventListener('scroll', T.hide, { passive: true });

/* ---------- Penanda bagian aktif ---------- */
if ('IntersectionObserver' in window) {
  const links = new Map($$('.nav-a').map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((ents) => { ents.forEach((en) => { if (en.isIntersecting) { links.forEach((a) => a.removeAttribute('aria-current')); const a = links.get(en.target.id); if (a) a.setAttribute('aria-current', 'true'); } }); }, { rootMargin: '-30% 0px -60% 0px' });
  $$('.sec').forEach((s) => io.observe(s));
}

dash.onData(sync);
})();
