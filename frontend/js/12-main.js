/* 12-main.js
 * App bootstrap: auto-refresh timer and visibility/focus/pageshow listeners.
 */

// Automatic full refresh every 4 minutes, plus refresh on resume/start
const V5_REFRESH_MS = 240000;
setInterval(() => {
  if (currentUser) v5RefreshDashboard('auto 4 min');
}, V5_REFRESH_MS);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && currentUser) v5RefreshDashboard('retour application');
});

window.addEventListener('focus', () => {
  if (currentUser) v5RefreshDashboard('focus');
});

window.addEventListener('pageshow', () => {
  if (currentUser) v5RefreshDashboard('redémarrage / reprise');
});
