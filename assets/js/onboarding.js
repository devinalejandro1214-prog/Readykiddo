// ── Onboarding Steps ─────────────────────────────────────────────
// Step 1: Setup  (names + character selection)
// Step 2: Theme  (Pick your world — static picture buttons)
// Step 3: Vibe   (dynamic — shows the SELECTED world's vibe backgrounds)
// Step 4: Style  (dynamic — shows the SELECTED character's costume PNGs)

const onboardingSteps = [
    {
        id: 'setup',
        type: 'setup',
        nextButtonText: 'Next'
    },
    {
        id: 'theme',
        title: 'Pick your world',
        subtitle: 'Choose the environment for your adventure',
        type: 'options',
        options: [
            { label: 'Space',      image: 'assets/images/buttons/worlds/space.webp' },
            { label: 'Jungle',     image: 'assets/images/buttons/worlds/jungle.webp' },
            { label: 'Beach',      image: 'assets/images/buttons/worlds/beach.webp' },
            { label: 'Castle',     image: 'assets/images/buttons/worlds/castle.webp' },
            { label: 'Studio',     image: 'assets/images/buttons/worlds/studio.webp' },
            { label: 'Candy Land', image: 'assets/images/buttons/worlds/candy-land.webp' }
        ],
        nextButtonText: 'Next'
    },
    {
        id: 'vibe',
        title: 'What kind of adventure do you want?',
        subtitle: 'Choose the feeling for your world',
        type: 'options',
        dynamic: true,   // built at render time from the selected world
        nextButtonText: 'Next'
    },
    {
        id: 'style',
        title: 'What should your character wear?',
        subtitle: 'Pick an outfit',
        type: 'options',
        dynamic: true,   // built at render time from the selected character
        nextButtonText: 'Reveal My World'
    }
];

const characters = [
    { name: 'Mica',   image: 'assets/images/characters/mica/plain.png' },
    { name: 'Aria',   image: 'assets/images/characters/aria/plain.png' },
    { name: 'Trish',  image: 'assets/images/characters/trish/plain.png' },
    { name: 'Steven', image: 'assets/images/characters/steven/plain.png' },
    { name: 'Emmett', image: 'assets/images/characters/emmett/plain.png' },
    { name: 'Amelia', image: 'assets/images/characters/amelia/plain.png' }
];

// ── State ─────────────────────────────────────────────────────────
let currentStep = 0;
let userChoices  = {};

// ── DOM ───────────────────────────────────────────────────────────
const questionCard = document.getElementById('questionCard');
const progressFill = document.querySelector('.progress-fill');

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Attempt autoplay immediately (works in Chrome when user already
    // interacted on the landing page on the same origin)
    if (window.RKAudio) RKAudio.startTheme();
    renderStep(currentStep);
});

// ── Slugify helper ─────────────────────────────────────────────────
function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ── Dynamic option builders ────────────────────────────────────────
// Vibe: uses the selected world's actual vibe background images
function getVibeOptions() {
    const worldSlug = slugify(userChoices.theme || '');
    return ['Cozy', 'Exciting', 'Magical', 'Silly', 'Brave'].map(v => ({
        label: v,
        image: `assets/images/world-backgrounds/${worldSlug}/vibes/${slugify(v)}/background.webp`
    }));
}

// Style: uses the selected character's actual costume PNGs
function getStyleOptions() {
    const charSlug = slugify(userChoices.character || '');
    return ['Plain', 'Hero', 'Explorer', 'Wizard', 'Artist', 'Scientist'].map(s => ({
        label: s,
        image: `assets/images/characters/${charSlug}/${s.toLowerCase()}.png`
    }));
}

function resolveOptions(step) {
    if (step.id === 'vibe')  return getVibeOptions();
    if (step.id === 'style') return getStyleOptions();
    return step.options;
}

// ── Render dispatcher ─────────────────────────────────────────────
function renderStep(stepIndex) {
    const step     = onboardingSteps[stepIndex];
    const progress = ((stepIndex + 1) / onboardingSteps.length) * 100;

    progressFill.style.width = progress + '%';

    // Replay the slideIn animation every time the step changes
    questionCard.style.animation = 'none';
    // Force reflow so removing the animation takes effect before re-adding it
    void questionCard.offsetWidth;
    questionCard.style.animation = '';

    questionCard.innerHTML = '';

    if (step.type === 'setup') {
        renderSetupForm();
    } else {
        renderQuestionTitle(step);
        renderOptionButtons(step);
    }

    renderNavButtons(stepIndex);
}

// ── Step 1: Setup form ────────────────────────────────────────────
function renderSetupForm() {
    const form = document.createElement('div');
    form.className = 'setup-form';

    // Left — child
    const leftCol = document.createElement('div');
    leftCol.className = 'setup-column';
    leftCol.innerHTML = `
        <h3 class="setup-column-title">Child's Information</h3>
        <label class="input-label">What is your name?</label>
        <input type="text" id="childNameInput" class="input-field"
               placeholder="Enter your name..."
               value="${escapeAttribute(userChoices.childName || '')}">
    `;

    // Right — parent
    const rightCol = document.createElement('div');
    rightCol.className = 'setup-column';
    rightCol.innerHTML = `
        <h3 class="setup-column-title">Parent's Information</h3>
        <label class="input-label">Parent / Guardian Name</label>
        <input type="text" id="parentNameInput" class="input-field"
               placeholder="Enter parent name..."
               value="${escapeAttribute(userChoices.parentName || '')}">
    `;

    form.appendChild(leftCol);
    form.appendChild(rightCol);
    questionCard.appendChild(form);

    // Character selection
    const section = document.createElement('div');
    section.className = 'setup-character-section';
    section.innerHTML = '<p class="setup-char-label">Select your character:</p>';

    const grid = document.createElement('div');
    grid.className = 'setup-character-grid';

    characters.forEach(char => {
        const card = document.createElement('button');
        card.className = 'setup-character-card' +
                         (userChoices.character === char.name ? ' selected' : '');
        card.setAttribute('aria-label', char.name);

        card.innerHTML = `
            <img src="${char.image}" alt="${char.name}" class="setup-character-image">
            <p class="setup-character-name">${char.name}</p>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.setup-character-card')
                    .forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            userChoices.character = char.name;
            // Play a random excitement clip on character pick
            if (window.RKAudio) {
                const picks = ['yay', 'you got it', 'wow'];
                RKAudio.speak(picks[Math.floor(Math.random() * picks.length)]);
            }
        });

        grid.appendChild(card);
    });

    section.appendChild(grid);
    questionCard.appendChild(section);
}

// ── Steps 2+: question title ──────────────────────────────────────
function renderQuestionTitle(step) {
    // For vibe step, update subtitle with the chosen world name
    let subtitle = step.subtitle;
    if (step.id === 'vibe' && userChoices.theme) {
        subtitle = `Choose the feeling for your ${userChoices.theme} world`;
    }
    if (step.id === 'style' && userChoices.character) {
        subtitle = `Pick an outfit for ${userChoices.character}`;
    }

    questionCard.innerHTML = `
        <h2 class="question-title">${step.title}</h2>
        <p class="question-subtitle">${subtitle}</p>
    `;
}

// ── Option buttons (image cards) ──────────────────────────────────
function renderOptionButtons(step) {
    const options = resolveOptions(step);

    const group = document.createElement('div');
    group.className = 'button-group image-option-group';

    options.forEach(option => {
        const label = typeof option === 'object' ? option.label : option;
        const btn = document.createElement('button');
        btn.className = 'option-button image-option-button' +
                        (userChoices[step.id] === label ? ' selected' : '');
        btn.setAttribute('aria-label', label);

        btn.innerHTML = `
            <img src="${option.image}" alt="${label}" class="option-button-image">
            <span class="option-button-label">${label}</span>
        `;

        btn.addEventListener('click', () => {
            // Start theme on first user tap (guaranteed gesture = always works)
            if (window.RKAudio) RKAudio.startTheme();
            group.querySelectorAll('.option-button')
                 .forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            userChoices[step.id] = label;

            // Play a short excitement clip on every option pick
            if (window.RKAudio) {
                const picks = ['great job', 'yay', 'you got it', 'impressive'];
                RKAudio.speak(picks[Math.floor(Math.random() * picks.length)]);
            }

            // Auto-advance to next step after selection
            setTimeout(() => advanceFromOptionStep(step), 500);
        });

        group.appendChild(btn);
    });

    questionCard.appendChild(group);
}

// ── Auto-advance from option steps ────────────────────────────────
function advanceFromOptionStep(step) {
    // Selection is already made, so just advance
    if (currentStep < onboardingSteps.length - 1) {
        currentStep++;
        renderStep(currentStep);
    } else {
        // Last step - complete onboarding
        localStorage.setItem('userProfile', JSON.stringify(userChoices));
        window.location.href = 'world-reveal.html';
    }
}

// ── Nav buttons ───────────────────────────────────────────────────
function renderNavButtons(stepIndex) {
    const step = onboardingSteps[stepIndex];
    const nav = document.createElement('div');
    nav.className = 'nav-buttons';

    // Back button (always shown except on first step)
    if (stepIndex > 0) {
        const back = document.createElement('button');
        back.className = 'nav-button back';
        back.textContent = 'Back';
        back.addEventListener('click', () => {
            currentStep--;
            renderStep(currentStep);
        });
        nav.appendChild(back);
    }

    // Next button only for setup step (option steps auto-advance on tile click)
    if (step.type === 'setup') {
        const next = document.createElement('button');
        next.className = 'nav-button next';
        next.textContent = step.nextButtonText;
        next.addEventListener('click', () => {
            // Start theme on Next button tap (guaranteed gesture)
            if (window.RKAudio) RKAudio.startTheme();
            goToNextStep();
        });
        nav.appendChild(next);
    }

    questionCard.appendChild(nav);
}

// ── Validation & navigation ───────────────────────────────────────
function goToNextStep() {
    const step = onboardingSteps[currentStep];

    if (step.type === 'setup') {
        const childName  = document.getElementById('childNameInput').value.trim();
        const parentName = document.getElementById('parentNameInput').value.trim();

        if (!childName)             { alert("Please enter the child's name.");  return; }
        if (!parentName)            { alert("Please enter the parent's name."); return; }
        if (!userChoices.character) { alert('Please select a character.');      return; }

        userChoices.childName  = childName;
        userChoices.parentName = parentName;

    } else if (!userChoices[step.id]) {
        alert('Please make a selection to continue.');
        return;
    }

    if (currentStep < onboardingSteps.length - 1) {
        currentStep++;
        renderStep(currentStep);
    } else {
        localStorage.setItem('userProfile', JSON.stringify(userChoices));
        window.location.href = 'world-reveal.html';
    }
}

function escapeAttribute(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
