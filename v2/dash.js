/* Pengganti ringan untuk mesin dashboard Claude, agar halaman bisa berjalan di hosting statis (GitHub Pages). */
(function () {
  const SOURCES = {
    entries: '../data/entries.json',
    riwayat: '../data/riwayat.json',
    briefs: '../data/briefs.json',
    briefs_riwayat: '../data/briefs_riwayat.json',
  };
  const store = {};
  const calcs = {};
  const draws = {};
  const onDataFns = [];

  Object.keys(SOURCES).forEach((k) => { store[k] = { status: 'loading', data: [] }; });

  function computeCalcs() {
    for (let pass = 0; pass < 10; pass++) {
      let changed = false;
      for (const id in calcs) {
        if (store[id].status === 'ok' || store[id].status === 'error') continue;
        const ins = calcs[id].inputs.map((i) => store[i]);
        if (ins.some((s) => !s || s.status === 'error')) { store[id] = { status: 'error', data: [] }; changed = true; continue; }
        if (ins.every((s) => s.status === 'ok')) {
          try { store[id] = { status: 'ok', data: calcs[id].fn(...ins.map((s) => s.data)) }; }
          catch (e) { console.error('[dash] calc ' + id, e); store[id] = { status: 'error', data: [] }; }
          changed = true;
        }
      }
      if (!changed) break;
    }
  }

  function runDraw(name) {
    const fn = draws[name];
    if (!fn) return;
    document.querySelectorAll('[data-draw="' + name + '"]').forEach((el) => {
      try { fn(el); } catch (e) { console.error('[dash] draw ' + name, e); }
    });
  }

  function cycle() {
    onDataFns.forEach((fn) => { try { fn(); } catch (e) { console.error('[dash] onData', e); } });
    Object.keys(draws).forEach(runDraw);
  }

  window.dash = {
    colors: ['var(--ch-online)', 'var(--ch-threads)', 'var(--ch-x)', 'var(--ch-fb)'],
    data(id) { return store[id] || { status: 'missing', data: [] }; },
    calc(id, spec) { calcs[id] = spec; store[id] = { status: 'loading', data: [] }; },
    draw(name, fn) { if (typeof fn === 'function') draws[name] = fn; else runDraw(name); },
    onData(fn) { onDataFns.push(fn); try { fn(); } catch (e) { console.error('[dash] onData', e); } },
    params() { return {}; }, setParams() {}, resetParams() {}, setLink() {}, refresh() {},
    _start() {
      cycle();
      Object.entries(SOURCES).forEach(([id, url]) => {
        fetch(url, { cache: 'no-cache' })
          .then((r) => { if (!r.ok) throw new Error(r.status + ' ' + url); return r.json(); })
          .then((json) => { store[id] = { status: 'ok', data: json }; })
          .catch((e) => {
            console.error('[dash] gagal memuat ' + url, e);
            store[id] = { status: 'error', data: [] };
            const m = document.querySelector('.mm-loaderr'); if (m) m.hidden = false;
          })
          .finally(() => { computeCalcs(); cycle(); });
      });
      let t = null;
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(cycle, 150); });
    },
  };
})();
