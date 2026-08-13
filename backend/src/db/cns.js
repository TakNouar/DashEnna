function computeCnsStats(logs) {
  const families = {
    Radar: ['PSR', 'SSR', 'ADS-B'],
    'VOR/DME': ['VOR', 'DME'],
    ILS: ['ILS'],
    VHF: ['COM_VHF'],
  };
  const byKey = {};
  const sorted = [...(logs || [])].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.time.localeCompare(b.time);
  });
  for (const l of sorted) {
    byKey[`${l.site}|${l.equip}`] = l;
  }
  const latest = Object.values(byKey);
  const score = (status) => {
    if (status === 'ON') return 1;
    if (status === 'Degradee' || status === 'Degradée') return 0.5;
    return 0;
  };
  const gauges = Object.entries(families).map(([label, equips]) => {
    const relevant = latest.filter((l) => equips.includes(l.equip));
    if (!relevant.length) {
      return { label, val: null, sample: 0, source: 'aucune donnee log' };
    }
    const avg = relevant.reduce((s, l) => s + score(l.status), 0) / relevant.length;
    return { label, val: Math.round(avg * 1000) / 10, sample: relevant.length, source: 'daily_logs' };
  });
  const allScored = latest.filter((l) =>
    Object.values(families).some((eq) => eq.includes(l.equip))
  );
  const overall =
    allScored.length > 0
      ? Math.round((allScored.reduce((s, l) => s + score(l.status), 0) / allScored.length) * 1000) / 10
      : null;
  return {
    gauges,
    overall,
    total_reports: (logs || []).length,
    latest_unique: latest.length,
    source: latest.length ? 'daily_logs' : 'empty',
  };
}

module.exports = { computeCnsStats };
