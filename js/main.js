document.addEventListener('DOMContentLoaded', () => {
  // 1. State Management
  let userProfile = {
    name: '',
    theme: 'space',
    vibe: 'calm'
  };

  // Content Data
  const playData = [
    { id: 'g_dino', title: 'Dino Diggers', image: 'assets/dino_diggers.png' },
    { id: 'g_robot', title: 'Robot Friends', image: 'assets/robot_friends.png' },
    { id: 'g_puzzle', title: 'Puzzle Palace', image: 'assets/puzzle_palace.png' }
  ];

  const watchData = [
    { id: 'w_story', title: 'Storytime Adventures', image: 'assets/storytime_adventures.png' },
    { id: 'w_math', title: 'Math Monsters', image: 'assets/math_monsters.png' }
  ];

  // DOM Elements
  const onboardingView = document.getElementById('onboarding-view');
  const dashboardView = document.getElementById('dashboard-view');
  const gameView = document.getElementById('game-view');
  
  const startBtn = document.getElementById('start-btn');
  const backBtn = document.getElementById('back-to-world-btn');
  const playRibbon = document.getElementById('play-ribbon');
  const watchRibbon = document.getElementById('watch-ribbon');

  // Initialize
  function init() {
    renderRibbon(playRibbon, playData);
    renderRibbon(watchRibbon, watchData);
  }

  // 2. The Chameleon Engine State Controller
  function applyState() {
    document.body.setAttribute('data-theme', userProfile.theme);
    document.body.setAttribute('data-vibe', userProfile.vibe);
    
    const nameDisplay = document.getElementById('display-name');
    if (nameDisplay) nameDisplay.textContent = userProfile.name || 'Explorer';
  }

  // Onboarding Submit
  startBtn.addEventListener('click', () => {
    userProfile.name = document.getElementById('ob-name').value;
    userProfile.theme = document.querySelector('input[name="theme"]:checked').value;
    userProfile.vibe = document.querySelector('input[name="vibe"]:checked').value;
    
    applyState();
    switchView(dashboardView);
  });

  // Ribbon Rendering
  function renderRibbon(container, data) {
    if (!container) return;
    container.innerHTML = data.map(item => `
      <div class="glass-card" onclick="openGame('${item.id}', '${item.title}')">
        <img src="${item.image}" alt="${item.title}" class="card-img" onerror="this.src='https://placehold.co/300x180/2a2e5c/fff?text=${item.title.replace(' ', '+')}'">
        <div class="card-info">
          <h4>${item.title}</h4>
        </div>
      </div>
    `).join('');
  }

  // View Switcher (Smooth 0.5s Transitions avoiding display:none)
  function switchView(targetView) {
    // Fade out all
    document.querySelectorAll('.view-layer').forEach(view => {
      view.classList.remove('view-active');
    });
    
    // Fade in target
    setTimeout(() => {
      targetView.classList.add('view-active');
    }, 50); // Small delay ensures CSS engine catches the transition
  }

  // 4. Game Integration Layer
  window.openGame = function(gameID, title) {
    document.getElementById('current-game-title').textContent = title || "Game Mode";
    switchView(gameView);
    
    const loadingText = document.getElementById('game-loading-text');
    if (loadingText) {
      loadingText.textContent = `Loading ${title}...`;
    }
  };

  backBtn.addEventListener('click', () => {
    switchView(dashboardView);
  });

  // Initial call
  init();
  applyState(); // Apply defaults so background renders immediately
});
