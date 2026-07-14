// ═══════════════════════════════════════════════════════════════════════════
// OmniRad — LOINC Consumer Names (radiology subset)
// Source: LOINC 2.82 · AccessoryFiles/ConsumerName/ConsumerName.csv
//         (patient-friendly names, filtered to radiology codes only)
// Compiled: 2026-07-14
// Codes   : 0
// ═══════════════════════════════════════════════════════════════════════════

(function(){
  const CONSUMER = {};
  const API = {
    get: (code) => CONSUMER[code] || null,
    all: () => CONSUMER,
    count: () => Object.keys(CONSUMER).length
  };
  if (typeof window !== 'undefined') window.OmniRadConsumer = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
