/**
 * supabase-client.js
 * ReadyKiddo 2.0 — shared Supabase client + helper functions
 *
 * SETUP: Replace the two placeholder values below with your real keys.
 * Find them at: Supabase Dashboard → Settings → API
 *
 * Include AFTER the Supabase CDN script:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="assets/js/supabase-client.js"></script>
 */

(function () {
  // ── Config (swap these out) ──────────────────────────────────
const SUPABASE_URL      = 'https://mqzbecwyubyifbjcvttk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T1cGPZcWizDyxxEq8-5CdA_IS4KuvSY';
  // ────────────────────────────────────────────────────────────

  if (!window.supabase) {
    console.error('[ReadyKiddo] Supabase CDN script not loaded before supabase-client.js');
    return;
  }

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Expose the raw client globally for auth.html / dashboard.html
  window.sb = sb;


  // ── Auth helpers ─────────────────────────────────────────────

  /** Returns the currently signed-in user or null */
  async function getCurrentUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
  }

  /** Redirects to auth.html if no active session */
  async function requireAuth(redirectTo = 'auth.html') {
    // Test mode bypass — no real Supabase session needed
    if (sessionStorage.getItem('rk_test_mode') === 'true') {
      const child = getActiveChild();
      if (child) return { id: child.parent_id ?? 'test-parent-001', email: 'test@readykiddo.com' };
    }
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = redirectTo;
      return null;
    }
    return user;
  }

  /** Sign out and redirect */
  async function signOut(redirectTo = 'auth.html') {
    await sb.auth.signOut();
    sessionStorage.removeItem('rk_child');
    window.location.href = redirectTo;
  }


  // ── Child profile helpers ────────────────────────────────────

  /**
   * Fetch all children belonging to the given parent.
   * @param {string} parentId - UUID from auth.users
   */
  async function getChildren(parentId) {
    const { data, error } = await sb
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });
    return { data, error };
  }

  /**
   * Get the active child from sessionStorage (set on login / child select).
   * Returns the parsed object or null.
   */
  function getActiveChild() {
    try {
      const raw = sessionStorage.getItem('rk_child');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Persist the active child to sessionStorage */
  function setActiveChild(child) {
    sessionStorage.setItem('rk_child', JSON.stringify(child));
  }


  // ── Game session helpers ─────────────────────────────────────

  /**
   * Log a completed game session to Supabase.
   * Call this from each game's completion handler.
   *
   * @param {string} gameId        - e.g. 'color-sort', 'draw-it'
   * @param {object} [opts]
   * @param {boolean} [opts.completed=true]
   * @param {number}  [opts.attempts=1]
   * @param {number}  [opts.timeSpentSec=0]
   * @param {number|null} [opts.score=null]
   */
  async function logGameSession(gameId, opts = {}) {
    const child = getActiveChild();
    if (!child) {
      console.warn('[ReadyKiddo] logGameSession: no active child in session');
      return { data: null, error: new Error('No active child') };
    }

    // Test mode — log to console only, skip Supabase
    if (child._testMode || sessionStorage.getItem('rk_test_mode') === 'true') {
      console.log(`[ReadyKiddo TEST] logGameSession → game:${gameId}`, {
        child: child.name,
        completed: opts.completed ?? true,
        attempts:  opts.attempts  ?? 1,
        timeSec:   opts.timeSpentSec ?? 0,
      });
      return { data: null, error: null };
    }

    const payload = {
      child_id:       child.id,
      game_id:        gameId,
      completed:      opts.completed      ?? true,
      attempts:       opts.attempts       ?? 1,
      time_spent_sec: opts.timeSpentSec   ?? 0,
      score:          opts.score          ?? null,
    };

    const { data, error } = await sb.from('game_sessions').insert(payload);
    if (error) console.error('[ReadyKiddo] logGameSession error:', error.message);
    return { data, error };
  }

  /**
   * Fetch all game sessions for the active child.
   * Returns an array grouped by game_id.
   */
  async function getChildSessions() {
    const child = getActiveChild();
    if (!child) return { data: [], error: null };

    const { data, error } = await sb
      .from('game_sessions')
      .select('*')
      .eq('child_id', child.id)
      .order('played_at', { ascending: false });

    return { data: data ?? [], error };
  }

  /**
   * Quick summary: which game_ids has this child completed at least once?
   * Returns a Set of game_id strings.
   */
  async function getCompletedGameIds() {
    const { data } = await getChildSessions();
    return new Set(
      (data ?? [])
        .filter(s => s.completed)
        .map(s => s.game_id)
    );
  }


  // ── Expose public API ────────────────────────────────────────
  window.RK = {
    // auth
    getCurrentUser,
    requireAuth,
    signOut,
    // child
    getChildren,
    getActiveChild,
    setActiveChild,
    // sessions
    logGameSession,
    getChildSessions,
    getCompletedGameIds,
  };

})();
