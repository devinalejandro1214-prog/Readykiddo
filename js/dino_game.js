document.addEventListener('DOMContentLoaded', () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let availableLetters = [...alphabet];
  
  let score = 0;
  
  // Game State
  let dinoRow = 0;
  let dinoCol = 1; // Start in middle column (0: left, 1: center, 2: right)
  let currentTargetLetter = '';
  let combo = 0;
  let isPlaying = false;
  
  // Constants
  const BLOCK_SIZE = 150;
  const GAP = 15;
  const TOTAL_COLS = 3;
  const WIN_DEPTH = 20; // Win at row 20

  // DOM Elements
  const gameWrapper = document.getElementById('game-wrapper');
  const worldEl = document.getElementById('world');
  const gridEl = document.getElementById('underground-grid');
  const targetLetterEl = document.getElementById('target-letter');
  const scoreEl = document.getElementById('score-text');
  const depthEl = document.getElementById('depth-text');
  const characterContainer = document.getElementById('character-container');
  const charParticles = document.getElementById('character-particles');
  const fxLayer = document.getElementById('fx-layer');
  const startOverlay = document.getElementById('start-overlay');
  const winOverlay = document.getElementById('win-overlay');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const finalScoreEl = document.getElementById('final-score');
  const dinoSvg = document.querySelector('.dino-svg');
  
  // Audio
  const roarSound = new Audio('assets/dino_roar.mp3');

  function resetGame() {
    gridEl.innerHTML = '';
    fxLayer.innerHTML = '';
    dinoRow = 0;
    dinoCol = 1;
    score = 0;
    combo = 0;
    scoreEl.textContent = score;
    depthEl.textContent = '0m';
    updateComboUI();
    characterContainer.className = 'character-container';
    
    // Generate initial grid
    for(let r = 1; r <= 8; r++) {
      generateRow(r);
    }
    setNewTarget();
    updateCamera();
  }

  function startGame() {
    startOverlay.classList.add('hidden');
    winOverlay.classList.add('hidden');
    resetGame();
    isPlaying = true;
  }

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  function getBiomeClass(row) {
    if (row < 5) return 'biome-dirt';
    if (row < 15) return 'biome-stone';
    if (row < 25) return 'biome-crystal';
    return 'biome-magma';
  }

  function generateRow(rowIdx) {
    // Determine rocks for this row. Max 2 rocks so 1 path is always open.
    // Don't put rocks on the very first row (row 1).
    let rockCols = [];
    if (rowIdx > 1) {
      const numRocks = Math.random() > 0.6 ? (Math.random() > 0.8 ? 2 : 1) : 0;
      for (let i = 0; i < numRocks; i++) {
        let rc = Math.floor(Math.random() * TOTAL_COLS);
        if (!rockCols.includes(rc)) rockCols.push(rc);
      }
    }

    for (let c = 0; c < TOTAL_COLS; c++) {
      const block = document.createElement('div');
      
      const isRock = rockCols.includes(c);
      block.className = `dirt-block ${isRock ? 'rock-block' : getBiomeClass(rowIdx)}`;
      block.dataset.row = rowIdx;
      block.dataset.col = c;
      block.dataset.isRock = isRock;
      
      // Calculate Absolute Position relative to center of screen horizontally
      const centerViewport = window.innerWidth / 2;
      const xPos = centerViewport + (c - 1) * (BLOCK_SIZE + GAP) - (BLOCK_SIZE / 2);
      const yPos = rowIdx * (BLOCK_SIZE + GAP);
      
      block.style.left = `${xPos}px`;
      block.style.top = `${yPos}px`;

      // Treasures (only in dirt)
      if (!isRock && Math.random() > 0.6) {
        const treasures = ['💎', '💰', '🌟', '🪙'];
        const t = document.createElement('div');
        t.className = 'block-treasure';
        t.textContent = treasures[Math.floor(Math.random() * treasures.length)];
        block.appendChild(t);
        block.dataset.hasTreasure = 'true';
      }
      
      // Letter placeholder
      const letterSpan = document.createElement('div');
      letterSpan.className = 'block-letter';
      block.appendChild(letterSpan);

      block.addEventListener('click', () => handleBlockClick(block));
      gridEl.appendChild(block);
    }
  }

  function getRandomWrongLetters(count, excludeLetter) {
    let wrongLetters = [];
    let tempAlphabet = alphabet.filter(l => l !== excludeLetter);
    for(let i=0; i<count; i++) {
      const idx = Math.floor(Math.random() * tempAlphabet.length);
      wrongLetters.push(tempAlphabet[idx]);
      tempAlphabet.splice(idx, 1);
    }
    return wrongLetters;
  }

  function setNewTarget() {
    if (availableLetters.length === 0) {
      availableLetters = [...alphabet];
    }
    
    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    currentTargetLetter = availableLetters[randomIndex];
    availableLetters.splice(randomIndex, 1);
    
    // Animate prompt
    targetLetterEl.textContent = currentTargetLetter;
    targetLetterEl.style.animation = 'none';
    void targetLetterEl.offsetWidth;
    targetLetterEl.style.animation = 'pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    // Now populate the active row blocks (the row immediately below the dino)
    populateActiveRow(dinoRow + 1);
  }

  function populateActiveRow(rowIdx) {
    const blocks = document.querySelectorAll(`.dirt-block[data-row="${rowIdx}"]`);
    if (blocks.length === 0) return;

    // Filter out rocks to find valid columns
    let validCols = [];
    blocks.forEach(b => { if(b.dataset.isRock !== 'true') validCols.push(parseInt(b.dataset.col)); });

    if (validCols.length === 0) {
      // Fallback: make one not a rock
      blocks[0].dataset.isRock = 'false';
      blocks[0].className = `dirt-block ${getBiomeClass(rowIdx)}`;
      validCols.push(parseInt(blocks[0].dataset.col));
    }

    // Pick one valid block to be the correct path
    const correctCol = validCols[Math.floor(Math.random() * validCols.length)];
    const wrongLetters = getRandomWrongLetters(2, currentTargetLetter);
    let wrongIdx = 0;

    blocks.forEach(block => {
      if (block.dataset.isRock === 'true') return; // skip rocks

      const col = parseInt(block.dataset.col);
      const letterSpan = block.querySelector('.block-letter');
      if (col === correctCol) {
        block.dataset.letter = currentTargetLetter;
        letterSpan.textContent = currentTargetLetter;
      } else {
        block.dataset.letter = wrongLetters[wrongIdx];
        letterSpan.textContent = wrongLetters[wrongIdx];
        wrongIdx++;
      }
    });
  }

  function updateComboUI() {
    for(let i=1; i<=3; i++) {
      const dot = document.getElementById(`combo-${i}`);
      if (dot) {
        if (i <= combo) dot.classList.add('filled');
        else dot.classList.remove('filled');
      }
    }
  }

  function handleBlockClick(block) {
    if (!isPlaying) return;
    if (block.dataset.isRock === 'true') return; // Cannot click rocks
    
    const bRow = parseInt(block.dataset.row);
    const bCol = parseInt(block.dataset.col);

    // Can only click blocks immediately below the dino
    if (bRow !== dinoRow + 1) return;
    
    if (block.dataset.letter === currentTargetLetter) {
      // Correct!
      combo++;
      updateComboUI();
      
      if (combo >= 3) {
        triggerMegaRoar(bRow, bCol);
      } else {
        digToBlock(block, bRow, bCol);
      }
    } else {
      // Wrong!
      combo = 0;
      updateComboUI();
      gameWrapper.classList.add('shake-screen');
      setTimeout(() => gameWrapper.classList.remove('shake-screen'), 400);
    }
  }

  function triggerMegaRoar(newRow, newCol) {
    // Mega roar clears the whole row!
    combo = 0;
    updateComboUI();
    
    // Play roar sound
    roarSound.currentTime = 0;
    roarSound.play().catch(e => console.log('Audio play failed', e));
    
    // Animation
    gameWrapper.classList.add('mega-roar-flash');
    dinoSvg.classList.add('dino-roar');
    
    // Add text and shockwave
    const shockwave = document.createElement('div');
    shockwave.className = 'shockwave';
    fxLayer.appendChild(shockwave);
    
    const textAnim = document.createElement('div');
    textAnim.className = 'mega-roar-text';
    textAnim.innerHTML = 'MEGA<br>ROAR!';
    fxLayer.appendChild(textAnim);
    
    const blocks = document.querySelectorAll(`.dirt-block[data-row="${newRow}"]`);
    
    setTimeout(() => {
      blocks.forEach(b => {
        b.classList.add('dug');
        if (b.dataset.hasTreasure === 'true') {
          createSparkles(b);
          score += 20; // Mega bonus
        }
      });
      
      score += 50; // Base mega score
      scoreEl.textContent = score;
      
      // Dino moves to the correct block even if the whole row is destroyed
      dinoRow = newRow;
      dinoCol = newCol;
      updateCamera();
      checkWinCondition();
      
      gameWrapper.classList.remove('mega-roar-flash');
      dinoSvg.classList.remove('dino-roar');
      
      // Cleanup VFX
      setTimeout(() => {
        shockwave.remove();
        textAnim.remove();
      }, 400); // Allow text animation to finish
      
      if (isPlaying) {
        if (!document.querySelector(`.dirt-block[data-row="${dinoRow + 6}"]`)) {
          generateRow(dinoRow + 6);
        }
        setNewTarget();
      }
    }, 600);
  }

  function digToBlock(block, newRow, newCol) {
    // 1. Determine facing direction for animation
    characterContainer.classList.remove('face-left', 'face-right');
    if (newCol < dinoCol) characterContainer.classList.add('face-left');
    if (newCol > dinoCol) characterContainer.classList.add('face-right');
    
    // 2. Play Digging Animation
    characterContainer.classList.add('digging');
    createParticles();
    
    // 3. Mark block as dug
    block.classList.add('dug');
    
    // 4. Handle Treasures
    if (block.dataset.hasTreasure === 'true') {
      createSparkles(block);
      showFloatingScore(10, block);
      score += 10;
    } else {
      score += 2; // Normal dig score
    }
    scoreEl.textContent = score;

    // 5. Update logical position
    dinoRow = newRow;
    dinoCol = newCol;
    
    // 6. Move Camera & Check Win
    updateCamera();
    checkWinCondition();

    // 7. Prep next state
    if (isPlaying) {
      setTimeout(() => {
        characterContainer.classList.remove('digging');
        // Generate more rows ahead
        if (!document.querySelector(`.dirt-block[data-row="${dinoRow + 6}"]`)) {
          generateRow(dinoRow + 6);
        }
        setNewTarget();
      }, 800);
    }
  }

  function checkWinCondition() {
    const currentDepth = dinoRow * 5;
    depthEl.textContent = `${currentDepth}m`;
    
    if (dinoRow >= WIN_DEPTH) {
      isPlaying = false;
      
      // Play roar sound for winning!
      roarSound.currentTime = 0;
      roarSound.play().catch(e => console.log('Audio play failed', e));
      
      setTimeout(() => {
        finalScoreEl.textContent = `Score: ${score}`;
        winOverlay.classList.remove('hidden');
      }, 1000);
    }
  }

  function updateCamera() {
    // The world moves in the OPPOSITE direction of the logical character position
    // Center column is 1. If dinoCol is 0 (left), world needs to shift right (+)
    const targetX = -(dinoCol - 1) * (BLOCK_SIZE + GAP);
    // Move up (-) as row increases
    const targetY = -dinoRow * (BLOCK_SIZE + GAP);
    
    worldEl.style.transform = `translate(${targetX}px, ${targetY}px)`;
  }

  function createParticles() {
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const tx = (Math.random() - 0.5) * 200;
      const ty = (Math.random() - 1) * 150;
      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.left = `${50 + (Math.random() - 0.5) * 80}px`;
      p.style.bottom = `${Math.random() * 20}px`;
      
      charParticles.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  function createSparkles(block) {
    const rect = block.getBoundingClientRect();
    for (let i=0; i<8; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = `${rect.left + rect.width/2}px`;
      s.style.top = `${rect.top + rect.height/2}px`;
      
      const tx = (Math.random() - 0.5) * 200;
      const ty = (Math.random() - 0.5) * 200;
      s.style.setProperty('--tx', `${tx}px`);
      s.style.setProperty('--ty', `${ty}px`);
      
      fxLayer.appendChild(s);
      setTimeout(() => s.remove(), 600);
    }
  }

  function showFloatingScore(amount, block) {
    const f = document.createElement('div');
    f.className = 'floating-score';
    f.textContent = `+${amount}`;
    
    const rect = block.getBoundingClientRect();
    f.style.left = `${rect.left + rect.width/2 - 20}px`;
    f.style.top = `${rect.top}px`;
    
    fxLayer.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  }

  // Game does not start immediately, wait for start button
});
