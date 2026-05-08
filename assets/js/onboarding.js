// ── Onboarding Steps ─────────────────────────────────────────────
// Step 1: Setup (names + character selection)
// Step 2: Pick your world (theme)
// Step 3: Vibe
// Step 4: Music
// Step 5: Style
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
        options: ['Space', 'Jungle', 'Ocean', 'Castle', 'City', 'Candy Land', 'Sports Arena', 'Music Studio'],
        nextButtonText: 'Next'
    },
    {
        id: 'vibe',
        title: 'What kind of adventure do you want?',
        subtitle: 'Choose the feeling',
        type: 'options',
        options: ['Chill', 'Brave', 'Funny', 'Magical', 'Fast', 'Cozy'],
        nextButtonText: 'Next'
    },
    {
        id: 'music',
        title: 'What should your world sound like?',
        subtitle: 'Pick your music style',
        type: 'options',
        options: ['Calm', 'Upbeat', 'Adventure', 'Silly', 'No music'],
        nextButtonText: 'Next'
    },
    {
        id: 'style',
        title: 'What should your character look like?',
        subtitle: 'Choose your outfit style',
        type: 'options',
        options: ['Hero', 'Explorer', 'Artist', 'Athlete', 'Gamer', 'Wizard', 'Scientist'],
        nextButtonText: 'Reveal My World'
    }
];

const characters = [
    { name: 'Mica',   image: 'Mica/Mica.Plain.png' },
    { name: 'Aria',   image: 'Aria/Aria.Plain.png' },
    { name: 'Trish',  image: 'Trish/Trish.plain.png' },
    { name: 'Steven', image: 'Steven/Steven.Plain.png' },
    { name: 'Emmett', image: 'Emmett/Emmett.Plain.png' },
    { name: 'Amelia', image: 'Amelia/Amelia.Plain.png' }
];

// ── State ─────────────────────────────────────────────────────────
let currentStep = 0;
let userChoices  = {};

// ── DOM ───────────────────────────────────────────────────────────
const questionCard  = document.getElementById('questionCard');
const progressFill  = document.querySelector('.progress-fill');

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => renderStep(currentStep));

// ── Render dispatcher ─────────────────────────────────────────────
function renderStep(stepIndex) {
    const step     = onboardingSteps[stepIndex];
    const progress = ((stepIndex + 1) / onboardingSteps.length) * 100;

    progressFill.style.width = progress + '%';
    questionCard.innerHTML   = '';

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
    // Two-column name inputs
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
               value="${userChoices.childName || ''}">
    `;

    // Right — parent
    const rightCol = document.createElement('div');
    rightCol.className = 'setup-column';
    rightCol.innerHTML = `
        <h3 class="setup-column-title">Parent's Information</h3>
        <label class="input-label">Parent / Guardian Name</label>
        <input type="text" id="parentNameInput" class="input-field"
               placeholder="Enter parent name..."
               value="${userChoices.parentName || ''}">
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

        card.innerHTML = `
            <img src="${char.image}" alt="${char.name}" class="setup-character-image">
            <p class="setup-character-name">${char.name}</p>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.setup-character-card')
                    .forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            userChoices.character = char.name;
        });

        grid.appendChild(card);
    });

    section.appendChild(grid);
    questionCard.appendChild(section);
}

// ── Steps 2+: question + options ──────────────────────────────────
function renderQuestionTitle(step) {
    questionCard.innerHTML = `
        <h2 class="question-title">${step.title}</h2>
        <p class="question-subtitle">${step.subtitle}</p>
    `;
}

function renderOptionButtons(step) {
    const group = document.createElement('div');
    group.className = step.options.length > 6
        ? 'button-group button-group-two-col'
        : 'button-group';

    step.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-button' +
                        (userChoices[step.id] === option ? ' selected' : '');
        btn.textContent = option;

        btn.addEventListener('click', () => {
            group.querySelectorAll('.option-button')
                 .forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            userChoices[step.id] = option;
        });

        group.appendChild(btn);
    });

    questionCard.appendChild(group);
}

// ── Nav buttons ───────────────────────────────────────────────────
function renderNavButtons(stepIndex) {
    const nav = document.createElement('div');
    nav.className = 'nav-buttons';

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

    const next = document.createElement('button');
    next.className = 'nav-button next';
    next.textContent = onboardingSteps[stepIndex].nextButtonText;
    next.addEventListener('click', goToNextStep);
    nav.appendChild(next);

    questionCard.appendChild(nav);
}

// ── Validation & navigation ───────────────────────────────────────
function goToNextStep() {
    const step = onboardingSteps[currentStep];

    if (step.type === 'setup') {
        const childName  = document.getElementById('childNameInput').value.trim();
        const parentName = document.getElementById('parentNameInput').value.trim();

        if (!childName)              { alert("Please enter the child's name.");    return; }
        if (!parentName)             { alert("Please enter the parent's name.");   return; }
        if (!userChoices.character)  { alert('Please select a character.');        return; }

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
