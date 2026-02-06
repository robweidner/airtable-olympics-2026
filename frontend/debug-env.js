/* eslint-disable no-unused-expressions */
// #region agent log
(function () {
  var q = {
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
    location: 'frontend/debug-env.js:1',
    message: 'Extension load env',
    data: {
      hasAirtableInterface: typeof window !== 'undefined' && typeof window.__getAirtableInterfaceAtVersion !== 'undefined',
      isIframe: typeof window !== 'undefined' && window.self !== window.top,
      href: typeof window !== 'undefined' ? window.location.href : '',
    },
    timestamp: Date.now(),
  };
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7246/ingest/d61a069d-8375-40cd-9ba9-8ef8dfa5f632', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) }).catch(function () {});
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('error', function (e) {
      fetch('http://127.0.0.1:7246/ingest/d61a069d-8375-40cd-9ba9-8ef8dfa5f632', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B', location: 'window.onerror', message: e.message, data: { stack: e.error && e.error.stack }, timestamp: Date.now() }) }).catch(function () {});
    });
  }
})();
// #endregion
