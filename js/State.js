/**
 * State.js — Reactive userProfile engine using the Observer Pattern.
 * Any change to userProfile auto-notifies all registered UI subscribers.
 */

const STORAGE_KEY = 'readykiddo_profile';

const _defaultProfile = {
  name: '',
  interest: null,   // 'space'|'horology'|'dinosaurs'|'deepsea'|'jungle'|'classiclit'
  avatar: null,     // 'sherlock'|'pooh'|'alice'|'robinhood'|'peterpan'|'mowgli'|'dorothy'|'mermaid'
  vibe: null,       // 'calm'|'balanced'|'active'
  music: null,      // 'lofi'|'orchestral'|'synthwave'|'8bit'
};

let _profile = { ..._defaultProfile };
const _subscribers = {};

/**
 * Subscribe to changes on a specific profile key.
 * @param {string} key - Profile key to watch (or '*' for all changes)
 * @param {Function} callback - Called with (newValue, oldValue, key)
 * @returns {Function} Unsubscribe function
 */
export function subscribe(key, callback) {
  if (!_subscribers[key]) _subscribers[key] = [];
  _subscribers[key].push(callback);
  return () => {
    _subscribers[key] = _subscribers[key].filter(cb => cb !== callback);
  };
}

/**
 * Update a single key on userProfile. Notifies subscribers and persists.
 * @param {string} key
 * @param {*} value
 */
export function setState(key, value) {
  const oldValue = _profile[key];
  _profile[key] = value;

  // Notify specific-key subscribers
  (_subscribers[key] || []).forEach(cb => cb(value, oldValue, key));
  // Notify wildcard subscribers
  (_subscribers['*'] || []).forEach(cb => cb(value, oldValue, key));

  _persist();
}

/**
 * Batch-update multiple profile keys at once.
 * @param {Object} updates
 */
export function setStates(updates) {
  Object.entries(updates).forEach(([key, value]) => {
    const oldValue = _profile[key];
    _profile[key] = value;
    (_subscribers[key] || []).forEach(cb => cb(value, oldValue, key));
    (_subscribers['*'] || []).forEach(cb => cb(value, oldValue, key));
  });
  _persist();
}

/**
 * Get the current value of a profile key.
 * @param {string} key
 */
export function getState(key) {
  return _profile[key];
}

/**
 * Get the full profile snapshot.
 */
export function getProfile() {
  return { ..._profile };
}

/**
 * Check if the onboarding is fully complete.
 */
export function isProfileComplete() {
  return !!(
    _profile.name &&
    _profile.interest &&
    _profile.avatar &&
    _profile.vibe &&
    _profile.music
  );
}

/**
 * Reset profile and clear localStorage.
 */
export function resetProfile() {
  _profile = { ..._defaultProfile };
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* private browsing */ }
  (_subscribers['*'] || []).forEach(cb => cb(null, null, 'reset'));
}

/**
 * Load profile from localStorage. Returns true if a complete profile was found.
 */
export function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      _profile = { ..._defaultProfile, ...JSON.parse(saved) };
      return isProfileComplete();
    }
  } catch (e) {
    console.warn('State: Could not load from localStorage.', e);
  }
  return false;
}

function _persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_profile));
  } catch (e) {
    console.warn('State: Could not save to localStorage.', e);
  }
}
