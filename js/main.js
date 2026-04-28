/**
 * main.js — ES6 Module entry point.
 * Imports Core.js and boots the Chameleon OS.
 */
import { init, initGameAPI } from './Core.js';

document.addEventListener('DOMContentLoaded', () => {
  initGameAPI();
  init();
});
