document.addEventListener('DOMContentLoaded', () => {
  // Grid and Game Constants
  const gridSize = 5;
  const levels = [
    { start: {x: 0, y: 0}, goal: {x: 2, y: 0}, friend: 'assets/friend_dog.png' },
    { start: {x: 0, y: 4}, goal: {x: 0, y: 1}, friend: 'assets/friend_alien.png' },
    { start: {x: 0, y: 0}, goal: {x: 3, y: 3}, friend: 'assets/friend_cat.png' },
    { start: {x: 4, y: 4}, goal: {x: 1, y: 2}, friend: 'assets/friend_unicorn.png' },
    { start: {x: 2, y: 2}, goal: {x: 4, y: 0}, friend: 'assets/friend_dino.png' }
  ];

  let currentLevelIdx = 0;
  let robotPos = { x: 0, y: 0 };
  let sequence = [];
  let isExecuting = false;

  // DOM Elements
  const gridEl = document.getElementById('game-grid');
  const sequenceContainer = document.getElementById('sequence-container');
  const runBtn = document.getElementById('run-btn');
  const clearBtn = document.getElementById('clear-btn');
  const commandBtns = document.querySelectorAll('.command-btn');
  const gameMessage = document.getElementById('game-message');
  const nextLevelBtn = document.getElementById('next-level-btn');
  const levelNumEl = document.getElementById('level-num');

  // Initialization
  function initGame() {
    createGrid();
    loadLevel(currentLevelIdx);
  }

  function createGrid() {
    gridEl.innerHTML = '';
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        gridEl.appendChild(cell);
      }
    }
  }

  function getCell(x, y) {
    return document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
  }

  function loadLevel(idx) {
    const level = levels[idx];
    levelNumEl.textContent = idx + 1;
    robotPos = { ...level.start };
    sequence = [];
    isExecuting = false;
    
    // Clear entities
    document.querySelectorAll('.robot-entity, .friend-entity').forEach(el => el.remove());

    // Place Friend
    const friendCell = getCell(level.goal.x, level.goal.y);
    const friendEl = document.createElement('img');
    friendEl.className = 'friend-entity friend-bounce';
    friendEl.src = level.friend;
    friendCell.appendChild(friendEl);

    // Place Robot
    placeRobot();
    
    // Reset UI
    renderSequence();
    gameMessage.classList.add('hidden');
    runBtn.disabled = false;
  }

  function placeRobot() {
    let robotEl = document.querySelector('.robot-entity');
    if (!robotEl) {
      robotEl = document.createElement('img');
      robotEl.className = 'robot-entity';
      robotEl.src = 'assets/robot_char.png';
    }
    const robotCell = getCell(robotPos.x, robotPos.y);
    robotCell.appendChild(robotEl);
  }

  function moveRobotVisual(dir) {
    const robotEl = document.querySelector('.robot-entity');
    robotEl.classList.remove('robot-move');
    void robotEl.offsetWidth; // Trigger reflow
    robotEl.classList.add('robot-move');
    placeRobot();
  }

  // Sequencing
  function renderSequence() {
    if (sequence.length === 0) {
      sequenceContainer.innerHTML = '<span class="empty-sequence">Add commands below...</span>';
      return;
    }

    sequenceContainer.innerHTML = '';
    sequence.forEach((cmd, i) => {
      const span = document.createElement('div');
      span.className = 'seq-item';
      span.id = `seq-item-${i}`;
      span.innerHTML = `<img src="assets/game_arrow.png" class="arrow-img arrow-${cmd}" alt="${cmd}">`;
      sequenceContainer.appendChild(span);
    });
  }

  commandBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isExecuting) return;
      const dir = btn.dataset.dir;
      sequence.push(dir);
      renderSequence();
    });
  });

  clearBtn.addEventListener('click', () => {
    if (isExecuting) return;
    sequence = [];
    renderSequence();
    
    // Reset robot position
    const level = levels[currentLevelIdx];
    robotPos = { ...level.start };
    placeRobot();
  });

  // Execution
  async function runSequence() {
    if (sequence.length === 0 || isExecuting) return;
    isExecuting = true;
    runBtn.disabled = true;

    // Reset robot position to start before running
    const level = levels[currentLevelIdx];
    robotPos = { ...level.start };
    placeRobot();
    await sleep(300);

    for (let i = 0; i < sequence.length; i++) {
      const cmd = sequence[i];
      const seqEl = document.getElementById(`seq-item-${i}`);
      if (seqEl) seqEl.classList.add('executing');

      let newX = robotPos.x;
      let newY = robotPos.y;

      if (cmd === 'up') newY--;
      if (cmd === 'down') newY++;
      if (cmd === 'left') newX--;
      if (cmd === 'right') newX++;

      // Check bounds
      if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
        // Crash
        const robotEl = document.querySelector('.robot-entity');
        robotEl.classList.add('error-shake');
        setTimeout(() => robotEl.classList.remove('error-shake'), 400);
        isExecuting = false;
        runBtn.disabled = false;
        if (seqEl) seqEl.classList.remove('executing');
        return;
      }

      robotPos = { x: newX, y: newY };
      moveRobotVisual(cmd);

      await sleep(600);
      if (seqEl) seqEl.classList.remove('executing');

      // Check win condition
      if (robotPos.x === level.goal.x && robotPos.y === level.goal.y) {
        winLevel();
        return;
      }
    }

    isExecuting = false;
    runBtn.disabled = false;
  }

  runBtn.addEventListener('click', runSequence);

  function winLevel() {
    const friendEl = document.querySelector('.friend-entity');
    const robotEl = document.querySelector('.robot-entity');
    
    friendEl.classList.add('dance-together');
    robotEl.classList.add('dance-together');
    
    // Position them slightly apart so they don't completely overlap
    friendEl.style.marginLeft = '-30px';
    robotEl.style.marginLeft = '30px';
    
    setTimeout(() => {
      gameMessage.classList.remove('hidden');
    }, 1500);
  }

  nextLevelBtn.addEventListener('click', () => {
    currentLevelIdx++;
    if (currentLevelIdx >= levels.length) {
      currentLevelIdx = 0; // Loop back for now, or could show "Game Beaten!"
      alert("You beat all the levels! Restarting game...");
    }
    loadLevel(currentLevelIdx);
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  initGame();
});
