/**
 * zoey-client.js
 * ReadyKiddo 2.0 — client-side wrapper for the Zoey AI advisor
 *
 * Exposes: window.Zoey.ask(message) → Promise<string>
 *
 * Include after supabase-client.js:
 *   <script src="assets/js/zoey-client.js"></script>
 */

(function () {

  const ENDPOINT = '/api/zoey';

  /**
   * Build child context object from the active child + completed game IDs.
   * @param {Set<string>} completedIds - from window.RK.getCompletedGameIds()
   */
  function buildContext(completedIds = new Set()) {
    const child = window.RK?.getActiveChild?.() ?? {};
    return {
      name:           child.name       ?? 'your child',
      ageRange:       child.age_range  ?? '3-5',
      completedGames: [...completedIds],
      totalSessions:  completedIds.size,
    };
  }

  /**
   * Ask Zoey a question.
   * @param {string} message - parent's question
   * @param {Set<string>} [completedIds] - optional; pass the Set from dashboard state
   * @returns {Promise<string>} - Zoey's reply text
   */
  async function ask(message, completedIds) {
    if (!message?.trim()) throw new Error('Message is empty');

    const childContext = buildContext(completedIds);

    const res = await fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message: message.trim(), childContext }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error ?? 'Zoey could not respond right now.');
    }

    return data.reply;
  }

  // Expose public API
  window.Zoey = { ask };

})();
