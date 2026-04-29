import { categories, defaults } from "./data.js";

const STORAGE_KEY = "readykiddo.motion.v3";

const allowed = new Map(
  categories
    .filter(category => category.key !== "name")
    .map(category => [category.key, new Set(category.choices.map(choice => choice.value))])
);

const boolKeys = new Set(["audioEnabled", "hasCompletedComfort", "hasCompletedJourney"]);

export function normalizeName(value) {
  const clean = String(value || "friend")
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .trim()
    .replace(/\s+/g, " ");
  return clean ? clean.slice(0, 16) : "friend";
}

export function validateState(input = {}) {
  const next = { ...defaults };

  for (const [key, value] of Object.entries(input || {})) {
    if (key === "name") {
      next.name = normalizeName(value);
      continue;
    }

    if (key === "pathfinderIndex") {
      const numberValue = Number.parseInt(value, 10);
      next.pathfinderIndex = Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
      continue;
    }

    if (boolKeys.has(key)) {
      next[key] = Boolean(value);
      continue;
    }

    const allowedSet = allowed.get(key);
    if (allowedSet?.has(value)) {
      next[key] = value;
    }
  }

  return next;
}

function safeGetStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export class Store {
  constructor() {
    this.subscribers = new Set();
    this.state = this.load();
  }

  load() {
    const storage = safeGetStorage();

    if (!storage) {
      return validateState();
    }

    try {
      return validateState(JSON.parse(storage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      return validateState();
    }
  }

  persist() {
    const storage = safeGetStorage();

    if (!storage) {
      return;
    }

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // School-managed browsers can block storage. The in-memory state still works.
    }
  }

  get() {
    return this.state;
  }

  set(patch = {}) {
    this.state = validateState({ ...this.state, ...patch });
    this.persist();
    this.notify();
    return this.state;
  }

  reset() {
    this.state = validateState();
    this.persist();
    this.notify();
    return this.state;
  }

  subscribe(fn) {
    this.subscribers.add(fn);
    fn(this.state);
    return () => this.subscribers.delete(fn);
  }

  notify() {
    for (const fn of this.subscribers) {
      fn(this.state);
    }
  }
}
