(function () {
  'use strict';

  const STORAGE_KEY = 'readykiddo_uiux_preview';
  const VALID_ROUTES = new Set(['landing', 'onboarding', 'home', 'activities', 'milestones', 'parent', 'game']);
  const CHARACTERS = [
    { name: 'Mica', slug: 'mica' },
    { name: 'Aria', slug: 'aria' },
    { name: 'Trish', slug: 'trish' },
    { name: 'Steven', slug: 'steven' },
    { name: 'Emmett', slug: 'emmett' },
    { name: 'Amelia', slug: 'amelia' }
  ];

  const defaultState = {
    childName: 'Maya',
    age: '4–5',
    character: 'Mica',
    world: 'Sky Garden',
    routine: '10–15 minutes',
    completed: ['color-sort', 'shape-recognition', 'number-matching'],
    saved: []
  };

  let state = loadState();
  let onboardingStep = 0;
  let feedbackType = 'Idea';
  let toastTimer;

  const loadingScreen = document.getElementById('loadingScreen');
  const siteHeader = document.getElementById('siteHeader');
  const mobileNav = document.getElementById('mobileNav');
  const feedbackOpen = document.getElementById('feedbackOpen');
  const feedbackDialog = document.getElementById('feedbackDialog');
  const toast = document.getElementById('toast');
  const main = document.getElementById('mainContent');

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return { ...defaultState, ...(saved || {}) };
    } catch (_) {
      return { ...defaultState };
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function characterSlug() {
    return (CHARACTERS.find(item => item.name === state.character) || CHARACTERS[0]).slug;
  }

  function syncBindings() {
    document.querySelectorAll('[data-bind="childName"]').forEach(node => {
      node.textContent = state.childName || defaultState.childName;
    });
    document.getElementById('headerChildName').textContent = state.childName || defaultState.childName;
    document.querySelector('.mode-chip__avatar').textContent = (state.childName || 'M').charAt(0).toUpperCase();
    const homeCharacter = document.getElementById('homeCharacter');
    homeCharacter.src = `assets/images/characters/${characterSlug()}/plain.png`;
    homeCharacter.alt = `${state.character}, ${state.childName}'s selected learning character`;
    document.getElementById('completedStat').textContent = String(state.completed.length);
  }

  function routeFromHash() {
    const candidate = location.hash.replace(/^#\/?/, '').split('?')[0];
    return VALID_ROUTES.has(candidate) ? candidate : 'landing';
  }

  function navigate(route) {
    if (!VALID_ROUTES.has(route)) route = 'landing';
    if (location.hash === `#${route}`) applyRoute(route);
    else location.hash = route;
  }

  function applyRoute(route) {
    document.querySelectorAll('[data-screen]').forEach(screen => {
      screen.classList.toggle('is-active', screen.dataset.screen === route);
    });
    document.querySelectorAll('[data-route]').forEach(control => {
      control.classList.toggle('is-active', control.dataset.route === route);
      if (control.matches('button')) control.setAttribute('aria-current', control.dataset.route === route ? 'page' : 'false');
    });

    const immersive = route === 'landing' || route === 'onboarding' || route === 'game';
    siteHeader.classList.toggle('is-hidden', immersive);
    mobileNav.classList.toggle('is-hidden', immersive);
    feedbackOpen.classList.toggle('is-hidden', route === 'game');
    document.body.dataset.route = route;

    if (route === 'onboarding') renderOnboarding();
    if (route === 'home' || route === 'parent' || route === 'milestones') syncBindings();

    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => main.focus({ preventScroll: true }));
  }

  document.addEventListener('click', event => {
    const routeControl = event.target.closest('[data-route]');
    if (routeControl) {
      event.preventDefault();
      navigate(routeControl.dataset.route);
    }
  });

  window.addEventListener('hashchange', () => applyRoute(routeFromHash()));
  document.getElementById('beginJourney').addEventListener('click', () => {
    onboardingStep = 0;
    navigate('onboarding');
  });

  /* Onboarding */
  const onboardingStage = document.getElementById('onboardingStage');
  const onboardingBack = document.getElementById('onboardingBack');
  const onboardingNext = document.getElementById('onboardingNext');
  const stepLabel = document.getElementById('stepLabel');
  const stepMeterFill = document.getElementById('stepMeterFill');

  function renderOnboarding() {
    const name = escapeHtml(state.childName === defaultState.childName && onboardingStep === 0 ? '' : state.childName);
    let html = '';
    if (onboardingStep === 0) {
      html = `
        <p class="eyebrow">First, the essentials</p>
        <h1 id="onboardingTitle">Who is learning today?</h1>
        <p>We use this only to make the preview feel personal. Nothing is sent anywhere.</p>
        <div class="form-grid">
          <div class="field"><label for="previewChildName">Child’s first name</label><input id="previewChildName" maxlength="24" autocomplete="off" value="${name}" placeholder="e.g. Maya" aria-describedby="nameHelp"><small id="nameHelp">A nickname works perfectly.</small></div>
          <div><span class="choice-label">Age range</span><div class="age-choice-grid" role="radiogroup" aria-label="Age range">
            ${choiceCard('age', '3–4', '🌱', state.age === '3–4')}
            ${choiceCard('age', '4–5', '★', state.age === '4–5')}
          </div></div>
        </div>`;
    } else if (onboardingStep === 1) {
      html = `
        <p class="eyebrow">A friendly face</p>
        <h1 id="onboardingTitle">Choose a trail buddy</h1>
        <p>They’ll cheer, guide, and grow alongside ${escapeHtml(state.childName || 'your child')}.</p>
        <div class="character-choice-grid" role="radiogroup" aria-label="Choose a character">
          ${CHARACTERS.map(character => `<button class="character-choice${state.character === character.name ? ' is-selected' : ''}" type="button" role="radio" aria-checked="${state.character === character.name}" data-character="${character.name}"><img src="assets/images/characters/${character.slug}/plain.png" alt=""><b>${character.name}</b></button>`).join('')}
        </div>`;
    } else if (onboardingStep === 2) {
      html = `
        <p class="eyebrow">Make it feel like theirs</p>
        <h1 id="onboardingTitle">Pick a learning world</h1>
        <p>This preview uses a gentle visual theme. Existing game worlds remain available in the working activities.</p>
        <div class="world-choice-grid" role="radiogroup" aria-label="Choose a learning world">
          ${choiceCard('world', 'Sky Garden', '☁', state.world === 'Sky Garden')}
          ${choiceCard('world', 'Cozy Castle', '♜', state.world === 'Cozy Castle')}
          ${choiceCard('world', 'Ocean Cove', '≈', state.world === 'Ocean Cove')}
        </div>`;
    } else {
      html = `
        <p class="eyebrow">One last choice</p>
        <h1 id="onboardingTitle">Choose a comfortable rhythm</h1>
        <p>ReadyKiddo works best in short, happy moments. You can always stop early.</p>
        <div class="routine-grid" role="radiogroup" aria-label="Choose a session length">
          ${choiceCard('routine', '5–10 minutes', '◷', state.routine === '5–10 minutes')}
          ${choiceCard('routine', '10–15 minutes', '☀', state.routine === '10–15 minutes')}
          ${choiceCard('routine', 'We’ll decide', '♡', state.routine === 'We’ll decide')}
        </div>
        <div class="preview-summary"><div class="summary-child"><img src="assets/images/characters/${characterSlug()}/plain.png" alt=""><div><h2>${escapeHtml(state.childName || defaultState.childName)}’s trail is ready</h2><p>${escapeHtml(state.character)} · ${escapeHtml(state.world)} · ${escapeHtml(state.routine)}</p></div></div><div class="privacy-note"><span aria-hidden="true">✓</span><span><strong>Preview-safe:</strong> these choices stay in this browser and do not create an account or update production data.</span></div></div>`;
    }

    onboardingStage.innerHTML = html;
    stepLabel.textContent = `Step ${onboardingStep + 1} of 4`;
    stepMeterFill.style.width = `${(onboardingStep + 1) * 25}%`;
    onboardingBack.disabled = onboardingStep === 0;
    onboardingBack.style.visibility = onboardingStep === 0 ? 'hidden' : 'visible';
    onboardingNext.textContent = onboardingStep === 3 ? `Enter ${state.childName || defaultState.childName}’s world` : 'Continue';
    updateStoryStops();
  }

  function choiceCard(key, value, icon, selected) {
    return `<button class="choice-card${selected ? ' is-selected' : ''}" type="button" role="radio" aria-checked="${selected}" data-choice-key="${key}" data-choice-value="${value}"><span aria-hidden="true">${icon}</span><b>${value}</b></button>`;
  }

  function updateStoryStops() {
    document.querySelectorAll('.story-stop').forEach((stop, index) => stop.classList.toggle('is-done', index <= onboardingStep));
  }

  onboardingStage.addEventListener('click', event => {
    const character = event.target.closest('[data-character]');
    if (character) {
      state.character = character.dataset.character;
      saveState();
      renderOnboarding();
      return;
    }
    const choice = event.target.closest('[data-choice-key]');
    if (choice) {
      state[choice.dataset.choiceKey] = choice.dataset.choiceValue;
      saveState();
      renderOnboarding();
    }
  });

  onboardingStage.addEventListener('input', event => {
    if (event.target.id === 'previewChildName') {
      state.childName = event.target.value.trimStart();
      saveState();
    }
  });

  onboardingBack.addEventListener('click', () => {
    if (onboardingStep > 0) {
      onboardingStep -= 1;
      renderOnboarding();
    }
  });

  onboardingNext.addEventListener('click', () => {
    if (onboardingStep === 0) {
      const nameInput = document.getElementById('previewChildName');
      state.childName = (nameInput.value || '').trim();
      if (state.childName.length < 2) {
        nameInput.setAttribute('aria-invalid', 'true');
        nameInput.focus();
        showToast('Add a first name or nickname to continue.');
        return;
      }
    }
    saveState();
    if (onboardingStep < 3) {
      onboardingStep += 1;
      renderOnboarding();
      document.getElementById('onboardingTitle')?.focus?.();
    } else {
      syncBindings();
      showToast(`${state.childName}’s learning trail is ready!`);
      navigate('home');
    }
  });

  document.getElementById('skipOnboarding').addEventListener('click', () => {
    state = { ...defaultState };
    saveState();
    syncBindings();
    navigate('home');
  });

  /* Activity filters and saves */
  document.querySelectorAll('[data-filter]').forEach(control => {
    control.addEventListener('click', () => applyActivityFilter(control.dataset.filter));
  });

  function applyActivityFilter(filter) {
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.toggle('is-active', chip.dataset.filter === filter));
    const cards = [...document.querySelectorAll('.activity-card')];
    let visible = 0;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter || (filter === 'saved' && state.saved.includes(card.dataset.game));
      card.hidden = !show;
      if (show) visible += 1;
    });
    document.getElementById('activityEmpty').hidden = visible > 0;
  }

  document.querySelectorAll('.icon-save').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.activity-card');
      const id = card.dataset.game;
      const saved = state.saved.includes(id);
      state.saved = saved ? state.saved.filter(item => item !== id) : [...state.saved, id];
      button.textContent = saved ? '♡' : '♥';
      button.setAttribute('aria-label', `${saved ? 'Save' : 'Remove'} ${card.querySelector('h2').textContent}`);
      saveState();
      showToast(saved ? 'Removed from saved activities.' : 'Saved for later.');
    });
  });

  /* Kid mode controls */
  const soundToggle = document.getElementById('soundToggle');
  soundToggle.addEventListener('click', () => {
    const pressed = soundToggle.getAttribute('aria-pressed') === 'true';
    soundToggle.setAttribute('aria-pressed', String(!pressed));
    soundToggle.innerHTML = pressed ? '<span aria-hidden="true">♪</span> Sound on' : '<span aria-hidden="true">×</span> Sound off';
    showToast(pressed ? 'Sound is on.' : 'Sound is off for this preview.');
  });

  document.getElementById('dismissSync').addEventListener('click', () => {
    document.getElementById('syncNotice').hidden = true;
  });

  document.getElementById('copyCelebration').addEventListener('click', async () => {
    const phrase = 'I noticed how you kept trying.';
    try {
      await navigator.clipboard.writeText(phrase);
      showToast('Celebration phrase copied.');
    } catch (_) {
      showToast(`Try saying: “${phrase}”`);
    }
  });

  /* Mock parent guide */
  const zoeyChat = document.getElementById('zoeyChat');
  const zoeyInput = document.getElementById('zoeyInput');
  const zoeyForm = document.getElementById('zoeyForm');
  const mockZoeyReply = 'Try a five-minute sound hunt away from the screen. Pick one sound, then look for three household objects that begin with it. Keep it light and celebrate the noticing, not the score.';

  document.querySelectorAll('[data-zoey-prompt]').forEach(button => {
    button.addEventListener('click', () => {
      zoeyInput.value = button.dataset.zoeyPrompt;
      zoeyForm.requestSubmit();
    });
  });

  zoeyForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!zoeyInput.value.trim()) return;
    zoeyChat.textContent = 'Thinking about one small next step…';
    zoeyInput.disabled = true;
    setTimeout(() => {
      zoeyChat.textContent = mockZoeyReply;
      zoeyInput.value = '';
      zoeyInput.disabled = false;
      zoeyInput.focus();
    }, 650);
  });

  /* Interactive redesigned game */
  const gameFeedback = document.getElementById('gameFeedback');
  const companionLine = document.getElementById('companionLine');
  document.querySelectorAll('[data-answer]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-answer]').forEach(item => item.classList.remove('is-correct', 'is-wrong'));
      const correct = button.dataset.answer === 'circle';
      button.classList.add(correct ? 'is-correct' : 'is-wrong');
      gameFeedback.className = `game-feedback ${correct ? 'is-success' : 'is-error'}`;
      if (correct) {
        gameFeedback.textContent = 'You found the circle! Wonderful noticing. ★';
        companionLine.textContent = 'You looked carefully and found it!';
        if (!state.completed.includes('shape-recognition')) state.completed.push('shape-recognition');
        saveState();
        syncBindings();
      } else {
        gameFeedback.textContent = 'Good try. Look for the shape with no corners.';
        companionLine.textContent = 'Mistakes help our brains learn. Try once more!';
      }
    });
  });

  document.getElementById('listenPrompt').addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Which one is a circle?');
      utterance.rate = .88;
      speechSynthesis.speak(utterance);
    } else {
      showToast('Listen: Which one is a circle?');
    }
  });

  /* Feedback preview dialog */
  feedbackOpen.addEventListener('click', () => {
    feedbackOpen.setAttribute('aria-expanded', 'true');
    feedbackDialog.showModal();
    document.getElementById('feedbackMessage').focus();
  });
  document.getElementById('feedbackClose').addEventListener('click', closeFeedback);
  feedbackDialog.addEventListener('close', () => {
    feedbackOpen.setAttribute('aria-expanded', 'false');
    feedbackOpen.focus();
  });
  feedbackDialog.addEventListener('click', event => {
    if (event.target === feedbackDialog) closeFeedback();
  });

  function closeFeedback() {
    if (feedbackDialog.open) feedbackDialog.close();
  }

  document.querySelectorAll('[data-feedback-type]').forEach(button => {
    button.addEventListener('click', () => {
      feedbackType = button.dataset.feedbackType;
      document.querySelectorAll('[data-feedback-type]').forEach(item => item.setAttribute('aria-checked', String(item === button)));
    });
  });

  document.getElementById('feedbackForm').addEventListener('submit', event => {
    event.preventDefault();
    const message = document.getElementById('feedbackMessage');
    const status = document.getElementById('feedbackStatus');
    if (message.value.trim().length < 5) {
      status.className = 'feedback-status is-error';
      status.textContent = 'Add a little more detail so the team knows what to improve.';
      message.focus();
      return;
    }
    status.className = 'feedback-status';
    status.textContent = `Saving ${feedbackType.toLowerCase()} feedback locally…`;
    setTimeout(() => {
      status.className = 'feedback-status is-success';
      status.textContent = 'Preview success: your feedback would be ready for review. Nothing was sent.';
      message.value = '';
    }, 550);
  });

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  const offlineBanner = document.getElementById('offlineBanner');
  function updateConnection() { offlineBanner.hidden = navigator.onLine; }
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
  updateConnection();

  syncBindings();
  applyRoute(routeFromHash());
  setTimeout(() => loadingScreen.classList.add('is-hidden'), 650);
}());
