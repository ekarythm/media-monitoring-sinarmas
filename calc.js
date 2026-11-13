dash.calc('semua', {
  inputs: ['entries', 'riwayat'],
  title: 'Seluruh konten terpantau',
  description: 'Gabungan data harian terbaru dengan riwayat alert 5 Oktober sampai 11 November 2026.',
  fn: (entries, riwayat) => [...riwayat, ...entries],
});
dash.calc('catatan', {
  inputs: ['briefs', 'briefs_riwayat'],
  title: 'Seluruh temuan dan rekomendasi',
  description: 'Gabungan temuan dan rekomendasi hari terbaru dengan riwayat alert sebelumnya.',
  fn: (briefs, briefs_riwayat) => [...briefs_riwayat, ...briefs],
});
dash.calc('ringkasan', {
  inputs: ['semua'],
  title: 'Ringkasan per periode',
  description: 'Jumlah temuan, konten negatif, interaksi, dan tayangan per hari, pekan, bulan, dan tahun pemantauan, beserta isu dan lini terbesar.',
  fn: (entries) => {
    entries = Array.isArray(entries) ? entries : [];
    const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const date = (s) => new Date(s + 'T00:00:00Z');
    const senin = (s) => { const d = date(s); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
    const kunci = { D: (s) => s, W: senin, M: (s) => s.slice(0, 7), Y: (s) => s.slice(0, 4) };
    const label = {
      D: (k) => { const d = date(k); return HARI[d.getUTCDay()] + ', ' + d.getUTCDate() + ' ' + BLN[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); },
      W: (k) => { const a = date(k), b = date(k); b.setUTCDate(b.getUTCDate() + 6); return 'Pekan ' + a.getUTCDate() + (a.getUTCMonth() !== b.getUTCMonth() ? ' ' + BLN[a.getUTCMonth()] : '') + '–' + b.getUTCDate() + ' ' + BLN[b.getUTCMonth()] + ' ' + b.getUTCFullYear(); },
      M: (k) => BLN[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4),
      Y: (k) => 'Tahun ' + k,
    };
    const out = [];
    for (const mode of ['D', 'W', 'M', 'Y']) {
      const grup = new Map();
      for (const r of entries) { const k = kunci[mode](r.lap); if (!grup.has(k)) grup.set(k, []); grup.get(k).push(r); }
      let prev = null;
      for (const key of [...grup.keys()].sort()) {
        const semua = grup.get(key), negatif = semua.filter((r) => r.status !== 'Dibuang');
        const urut = (f) => { const c = new Map(); for (const r of negatif) c.set(r[f], (c.get(r[f]) || 0) + 1); return [...c].sort((a, b) => b[1] - a[1]); };
        const kl = urut('kluster'), li = urut('lini');
        const row = {
          pid: mode + '_' + key, mode, key, label: label[mode](key),
          total: negatif.length,
          online: negatif.filter((r) => r.kanal === 'Media Online').length,
          sosial: negatif.filter((r) => r.kanal === 'Media Sosial').length,
          entri: semua.length, dibuang: semua.length - negatif.length,
          neg_pct: semua.length ? Math.round(negatif.length / semua.length * 100) : 0,
          sumber_n: new Set(negatif.map((r) => r.sumber)).size,
          hari: new Set(semua.map((r) => r.lap)).size,
          lini_n: li.length,
          kluster_top: kl.length ? kl[0][0] : '—', kluster_top_n: kl.length ? kl[0][1] : 0,
          kluster_top_pct: negatif.length ? Math.round(kl[0][1] / negatif.length * 100) : 0,
          lini_top: li.length ? li[0][0] : '—', lini_top_n: li.length ? li[0][1] : 0,
          views: negatif.reduce((s, r) => s + (+r.views || 0), 0),
          interaksi: negatif.reduce((s, r) => s + (+r.likes || 0) + (+r.reposts || 0) + (+r.replies || 0), 0),
          prev_label: prev ? prev.label : '', prev_total: prev ? prev.total : null,
          delta_pct: prev && prev.total ? Math.round((negatif.length - prev.total) / prev.total * 100) : null,
        };
        out.push(row); prev = row;
      }
    }
    return out;
  },
});
