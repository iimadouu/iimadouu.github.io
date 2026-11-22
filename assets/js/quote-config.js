/* ============================================================
   IIMADOUU — QUOTE BUILDER CONFIG
   ------------------------------------------------------------
   No API key lives in this site. The page posts the prompt to a
   small proxy (quote-api/) which holds the key as a server secret
   and talks to Google AI Studio on our behalf.

   To move the proxy, change endpoint. Nothing else is needed.
   ============================================================ */
window.QUOTE_CONFIG = {
  endpoint: "https://iimadouu-quote-api-zhd9mh-preview.freebuff.site",
  timeoutMs: 70000
};
