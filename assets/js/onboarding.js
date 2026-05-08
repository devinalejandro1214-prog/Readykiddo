// Onboarding Flow Configuration
const onboardingSteps = [
    {
        id: 'setup',
        title: null,
        type: 'setup',
        nextButtonText: 'Next'
    },
    {
        id: 'character',
        title: 'Pick your character',
        subtitle: 'Choose who you want to be',
        type: 'character',
        characters: [
            { name: 'Mica', image: '../../Mica/Mica.Plain.png' },
            { name: 'Aria', image: '../../Aria/Aria.Plain.png' },
            { name: 'Trish', image: '../../Trish/Trish.plain.png' },
            { name: 'Steven', image: '../../Steven/Steven.Plain.png' },
            { name: 'Emmett', image: '../../Emmett/Emmett.Plain.png' }
        ],
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

// State Management
let currentStep = 0;
let userChoices = {};

// DOM Elements
const questionCard = document.getElementById('questionCard');
const progressFill = document.querySelector('.progress-fill');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderStep(currentStep);
});

function renderStep(stepIndex) {
    const step = onboardingSteps[stepIndex];

    // Update progress bar
    const progress = ((stepIndex + 1) / onboardingSteps.length) * 100;
    progressFill.style.width = progress + '%';

    // Clear card
    questionCard.innerHTML = '';

    // Render based on type
    if (step.type === 'setup') {
        renderSetupForm(step);
    } else if (step.type === 'character') {
        renderQuestionCard(step);
        renderCharacterSelection(step);
    } else if (step.type === 'options') {
        renderQuestionCard(step);
        renderOptionButtons(step);
    }

    // Add navigation buttons
    renderNavButtons(stepIndex);
}

function renderQuestionCard(step) {
    const title = document.createElement('h2');
    title.className = 'question-title';
    title.textContent = step.title;
    questionCard.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'question-subtitle';
    subtitle.textContent = step.subtitle;
    questionCard.appendChild(subtitle);
}

function renderSetupForm(step) {
    // Create two-column container
    const twoColContainer = document.createElement('div');
    twoColContainer.className = 'setup-form';

    // Left column - Child info
    const leftCol = document.createElement('div');
    leftCol.className = 'setup-column left-column';

    const childTitle = document.createElement('h3');
    childTitle.className = 'setup-column-title';
    childTitle.textContent = "Child's Information";
    leftCol.appendChild(childTitle);

    // Child name input
    const childNameLabel = document.createElement('label');
    childNameLabel.className = 'input-label';
    childNameLabel.textContent = 'What is your name?';
    leftCol.appendChild(childNameLabel);

    const childNameInput = document.createElement('input');
    childNameInput.type = 'text';
    childNameInput.className = 'input-field';
    childNameInput.placeholder = 'Enter your name...';
    childNameInput.id = 'childNameInput';
    if (userChoices['childName']) {
        childNameInput.value = userChoices['childName'];
    }
    leftCol.appendChild(childNameInput);

    // Right column - Parent info
    const rightCol = document.createElement('div');
    rightCol.className = 'setup-column right-column';

    const parentTitle = document.createElement('h3');
    parentTitle.className = 'setup-column-title';
    parentTitle.textContent = "Parent's Information";
    rightCol.appendChild(parentTitle);

    // Parent name input
    const parentNameLabel = document.createElement('label');
    parentNameLabel.className = 'input-label';
    parentNameLabel.textContent = 'Parent/Guardian Name';
    rightCol.appendChild(parentNameLabel);

    const parentNameInput = document.createElement('input');
    parentNameInput.type = 'text';
    parentNameInput.className = 'input-field';
    parentNameInput.placeholder = 'Enter parent name...';
    parentNameInput.id = 'parentNameInput';
    if (userChoices['parentName']) {
        parentNameInput.value = userChoices['parentName'];
    }
    rightCol.appendChild(parentNameInput);

    // Add columns to container
    twoColContainer.appendChild(leftCol);
    twoColContainer.appendChild(rightCol);

    // Append two-column form
    questionCard.appendChild(twoColContainer);

    // Add character selection section
    const characterSection = document.createElement('div');
    characterSection.className = 'setup-character-section';

    const charLabel = document.createElement('p');
    charLabel.className = 'setup-char-label';
    charLabel.textContent = 'Select your character:';
    characterSection.appendChild(charLabel);

    const characterGrid = document.createElement('div');
    characterGrid.className = 'setup-character-grid';

    const characters = [
        { name: 'Mica', image: '../../Mica/Mica.Plain.png' },
        { name: 'Aria', image: '../../Aria/Aria.Plain.png' },
        { name: 'Trish', image: '../../Trish/Trish.plain.png' },
        { name: 'Steven', image: '../../Steven/Steven.Plain.png' },
        { name: 'Emmett', image: '../../Emmett/Emmett.Plain.png' }
    ];

    characters.forEach(character => {
        const characterCard = document.createElement('button');
        characterCard.className = 'setup-character-card';

        if (userChoices['character'] === character.name) {
            characterCard.classList.add('selected');
        }

        const img = document.createElement('img');
        img.src = character.image;
        img.alt = character.name;
        img.className = 'setup-character-image';

        const label = document.createElement('p');
        label.className = 'setup-character-name';
        label.textContent = character.name;

        characterCard.appendChild(img);
        characterCard.appendChild(label);

        characterCard.addEventListener('click', function() {
            document.querySelectorAll('.setup-character-card').forEach(card => {
                card.classList.remove('selected');
            });
            characterCard.classList.add('selected');
            userChoices['character'] = character.name;
        });

        characterGrid.appendChild(characterCard);
    });

    characterSection.appendChild(characterGrid);
    questionCard.appendChild(characterSection);
}

function renderCharacterSelection(step) {
    const characterGrid = document.createElement('div');
    characterGrid.className = 'character-grid';

    step.characters.forEach(character => {
        const characterCard = document.createElement('button');
        characterCard.className = 'character-card';

        if (userChoices[step.id] === character.name) {
            characterCard.classList.add('selected');
        }

        const img = document.createElement('img');
        img.src = character.image;
        img.alt = character.name;
        img.className = 'character-image';

        const label = document.createElement('p');
        label.className = 'character-name';
        label.textContent = character.name;

        characterCard.appendChild(img);
        characterCard.appendChild(label);

        characterCard.addEventListener('click', function() {
            document.querySelectorAll('.character-card').forEach(card => {
                card.classList.remove('selected');
            });
            characterCard.classList.add('selected');
            userChoices[step.id] = character.name;
        });

        characterGrid.appendChild(characterCard);
    });

    questionCard.appendChild(characterGrid);
}

function renderOptionButtons(step) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    buttonGroup.classList.toggle('button-group-two-col', step.options.length > 6);

    step.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;

        if (userChoices[step.id] === option) {
            button.classList.add('selected');
        }

        button.addEventListener('click', function() {
            document.querySelectorAll('.option-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');
            userChoices[step.id] = option;
        });

        buttonGroup.appendChild(button);
    });

    questionCard.appendChild(buttonGroup);
}

function renderNavButtons(stepIndex) {
    const navDiv = document.createElement('div');
    navDiv.className = 'nav-buttons';

    if (stepIndex > 0) {
        const backBtn = document.createElement('button');
        backBtn.className = 'nav-button back';
        backBtn.textContent = 'Back';
        backBtn.addEventListener('click', goToPreviousStep);
        navDiv.appendChild(backBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-button next';
    nextBtn.textContent = onboardingSteps[stepIndex].nextButtonText;
    nextBtn.addEventListener('click', goToNextStep);
    navDiv.appendChild(nextBtn);

    questionCard.appendChild(navDiv);
}

function goToNextStep() {
    const step = onboardingSteps[currentStep];

    // Validate input
    if (step.type === 'setup') {
        const childNameInput = document.getElementById('childNameInput');
        const parentNameInput = document.getElementById('parentNameInput');

        if (!childNameInput.value.trim()) {
            alert('Please enter child\'s name');
            return;
        }
        if (!parentNameInput.value.trim()) {
            alert('Please enter parent\'s name');
            return;
        }

        userChoices['childName'] = childNameInput.value;
        userChoices['parentName'] = parentNameInput.value;
    } else if (step.type === 'options') {
        if (!userChoices[step.id]) {
            alert('Please select an option');
            return;
        }
    }

    if (currentStep < onboardingSteps.length - 1) {
        currentStep++;
        renderStep(currentStep);
    } else {
        // Onboarding complete - go to world reveal
        saveUserChoices();
        window.location.href = 'world-reveal.html';
    }
}

function goToPreviousStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
    }
}

function saveUserChoices() {
    // Save to localStorage for now
    localStorage.setItem('userProfile', JSON.stringify(userChoices));
}
