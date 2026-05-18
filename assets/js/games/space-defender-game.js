/*
   Space Defender Game Logic
*/

class SpaceDefenderGame {
  constructor(context) {
    this.context = context;
    this.container = document.getElementById('gameArea');

    this.level = 1;
    this.maxLevels = 5;
    this.score = 0;
    this.lives = 3;
    this.isPlaying = false;
    this.transitioningLevel = false;
    this.enemies = [];
    this.lasers = [];
    this.config = {
      levels: null,
      worlds: null,
      currentLevelData: null,
      worldData: null
    };

    this.metrics = {
      shotsFired: 0,
      enemiesHit: 0,
      enemiesSpawned: 0,
      enemySpawnTimes: {},
      reactionTimes: [],
      dragPoints: []
    };

    this.lastTime = 0;
    this.spawnTimer = 0;
    this.shootTimer = 0;
    this.animationFrameId = null;

    this.shipX = 50;
    this.enemyDirection = 1;
    this.enemyHorizontalSpeed = 8;
    this.enemyDropStep = 6;
    this.enemyLowerBound = 84;

    this.keysDown = new Set();
    this._lastLossSoundAt = 0;
  }

  async startGame() {
    console.log('[SpaceDefender] Starting game...');
    await this.loadConfigs();
    this.setupUI();
    this.showScreen('start');
  }

  async loadConfigs() {
    try {
      const [levelsRes, worldsRes] = await Promise.all([
        fetch('assets/data/games/space-defender/levels.json'),
        fetch('assets/data/games/space-defender/worlds.json')
      ]);
      this.config.levels = await levelsRes.json();
      this.config.worlds = await worldsRes.json();

      this.config.worldData = this.config.worlds[this.context.worldSlug] || this.config.worlds.space;
      this.config.currentLevelData = this.config.levels[String(this.level)];

      document.documentElement.style.setProperty('--sd-primary', this.config.worldData.colors.primary);
      document.documentElement.style.setProperty('--sd-accent', this.config.worldData.colors.accent);
    } catch (e) {
      console.warn('Using fallback Space Defender config', e);
      this.config.worldData = {
        ship: 'assets/images/games/space-defender/ships/space-ship.png',
        background: 'assets/images/games/space-defender/backgrounds/space-bg.png',
        colors: { primary: '#4f46e5', accent: '#818cf8' }
      };
      this.config.levels = {
        '1': { enemyCount: 5, speedMs: 2500, spawnIntervalMs: 2000 },
        '2': { enemyCount: 7, speedMs: 2150, spawnIntervalMs: 1700 },
        '3': { enemyCount: 9, speedMs: 1850, spawnIntervalMs: 1450 },
        '4': { enemyCount: 11, speedMs: 1550, spawnIntervalMs: 1200 },
        '5': { enemyCount: 13, speedMs: 1300, spawnIntervalMs: 1000 }
      };
      this.config.currentLevelData = this.config.levels['1'];
      document.documentElement.style.setProperty('--sd-primary', '#4f46e5');
      document.documentElement.style.setProperty('--sd-accent', '#818cf8');
    }
  }

  setupUI() {
    this.container.innerHTML = `
      <div class="space-defender-container">
        <div class="game-background" id="sdBackground" style="background-image: url('${this.config.worldData.background}')"></div>
        <div class="game-header">
          <div class="lives-counter" id="sdLives">
            <span class="life">❤️</span><span class="life">❤️</span><span class="life">❤️</span>
          </div>
          <div class="level-indicator" id="sdLevel">LEVEL 1</div>
          <div class="score-counter">Score: <span id="sdScore">0</span></div>
        </div>
        <div class="level-flash" id="sdLevelFlash" aria-live="polite"></div>
        <div class="play-area" id="sdPlayArea">
          <div class="ship" id="sdShip" style="left: 50%;">
            <img src="${this.config.worldData.ship}" class="ship-sprite" onerror="this.src=''; this.style.backgroundColor='white'; this.style.borderRadius='10px';" />
            <div class="ship-cockpit">
              <img src="${this.context.characterPath}" onerror="this.src=''; this.style.backgroundColor='gray'; this.style.borderRadius='50%';" />
            </div>
          </div>
        </div>

        <div class="arrow-controls" id="sdArrowControls">
          <button class="arrow-btn" id="sdBtnLeft" aria-label="Move Left">&#9664;</button>
          <div class="arrow-hint">or use arrow keys</div>
          <button class="arrow-btn" id="sdBtnRight" aria-label="Move Right">&#9654;</button>
        </div>

        <div id="sdOverlay" class="screen-overlay" style="display: none;"></div>
      </div>
    `;

    this.playArea = document.getElementById('sdPlayArea');
    this.shipElement = document.getElementById('sdShip');
    this.overlay = document.getElementById('sdOverlay');
    this.levelFlash = document.getElementById('sdLevelFlash');

    this.setupControls();
  }

  setupControls() {
    let isDragging = false;

    const startDrag = e => {
      if (!this.isPlaying) return;
      isDragging = true;
      this.updateShipPosition(e);
    };
    const moveDrag = e => {
      if (!isDragging || !this.isPlaying) return;
      this.updateShipPosition(e);
      this.metrics.dragPoints.push({ x: this.shipX, time: Date.now() });
    };
    const endDrag = () => {
      isDragging = false;
    };

    this.playArea.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    this.playArea.addEventListener('touchstart', e => startDrag(e.touches[0]), { passive: false });
    document.addEventListener('touchmove', e => moveDrag(e.touches[0]), { passive: false });
    document.addEventListener('touchend', endDrag);

    document.addEventListener('keydown', e => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        this.keysDown.add(e.key);
      }
    });
    document.addEventListener('keyup', e => {
      this.keysDown.delete(e.key);
    });

    const btnLeft = document.getElementById('sdBtnLeft');
    const btnRight = document.getElementById('sdBtnRight');
    const addKey = key => {
      this.keysDown.add(key);
    };
    const clearAll = () => {
      this.keysDown.delete('ArrowLeft');
      this.keysDown.delete('ArrowRight');
    };

    if (btnLeft) {
      btnLeft.addEventListener('mousedown', () => addKey('ArrowLeft'));
      btnLeft.addEventListener('touchstart', () => addKey('ArrowLeft'), { passive: true });
    }
    if (btnRight) {
      btnRight.addEventListener('mousedown', () => addKey('ArrowRight'));
      btnRight.addEventListener('touchstart', () => addKey('ArrowRight'), { passive: true });
    }
    document.addEventListener('mouseup', clearAll);
    document.addEventListener('touchend', clearAll);
  }

  updateShipPosition(e) {
    const rect = this.playArea.getBoundingClientRect();
    const x = e.clientX || e.pageX;
    let pos = ((x - rect.left) / rect.width) * 100;
    pos = Math.max(5, Math.min(95, pos));
    this.shipX = pos;
    this.shipElement.style.left = `${this.shipX}%`;
  }

  showScreen(type) {
    this.overlay.style.display = 'flex';
    let html = '';

    if (type === 'start') {
      html = `
        <div class="overlay-title">Ready for action, ${this.context.childName}?</div>
        <div class="overlay-text">Enemies are coming! Clear 5 levels in one smooth run. Use left and right arrows, or drag, to dodge. We auto-shoot!</div>
        <button class="btn-primary" id="sdBtnStart">Start Level 1</button>
      `;
      this.context.speak(`Ready for action, ${this.context.childName}? Enemies are coming!`);
      this.context.characterAnimation('wave');
    } else if (type === 'gameOver') {
      this.context.characterAnimation('nod');
      this.context.speak(`Great effort, ${this.context.childName}! You made it through ${this.level} levels!`);
      html = `
        <div class="overlay-title">Game Over</div>
        <div class="overlay-text">Great effort, ${this.context.childName}! You made it through ${this.level} levels!</div>
        <button class="btn-primary" id="sdBtnSummary">See What You Accomplished</button>
      `;
    } else if (type === 'summary') {
      html = this.generateSummaryHTML();
    }

    this.overlay.innerHTML = html;

    const btnStart = document.getElementById('sdBtnStart');
    if (btnStart) btnStart.onclick = () => this.startLevel();

    const btnSummary = document.getElementById('sdBtnSummary');
    if (btnSummary) btnSummary.onclick = () => this.showScreen('summary');

    const btnFinish = document.getElementById('sdBtnFinish');
    if (btnFinish) {
      btnFinish.onclick = () => {
        const nextGameType = typeof window.getNextGameRecommendation === 'function'
          ? window.getNextGameRecommendation('space-defender', 'hard', 1)
          : 'feed-alien';
        this.context.goToNextGame(nextGameType);
      };
    }
  }

  generateSummaryHTML() {
    const accuracy = this.metrics.shotsFired > 0
      ? Math.round((this.metrics.enemiesHit / this.metrics.shotsFired) * 100)
      : 0;
    const avgReaction = this.metrics.reactionTimes.length > 0
      ? (this.metrics.reactionTimes.reduce((a, b) => a + b, 0) / this.metrics.reactionTimes.length / 1000).toFixed(1)
      : 'N/A';

    this.context.saveSession({
      metrics: {
        accuracy,
        avgReaction,
        enemiesDefeated: this.score,
        levelsReached: this.level
      }
    });

    return `
      <div class="parent-summary">
        <h3>${this.context.childName}'s Space Defender Adventure</h3>
        <p><strong>What ${this.context.childName} Did:</strong><br>
        Piloted a ship and defended against incoming aliens using arrow keys and quick reflexes.</p>
        <p><strong>Skills Showed:</strong></p>
        <ul>
          <li>Hand-Eye Coordination (${accuracy}% hit accuracy)</li>
          <li>Quick Reaction Time (avg ${avgReaction} sec)</li>
          <li>Focus and Attention</li>
        </ul>
        <div class="stats">
          <div class="stat-item"><span class="stat-label">Enemies Defeated</span><span class="stat-value">${this.score}</span></div>
          <div class="stat-item"><span class="stat-label">Levels Reached</span><span class="stat-value">${this.level}</span></div>
          <div class="stat-item"><span class="stat-label">Hit Accuracy</span><span class="stat-value">${accuracy}%</span></div>
          <div class="stat-item"><span class="stat-label">Reaction Time</span><span class="stat-value">${avgReaction}s</span></div>
        </div>
        <button class="btn-primary" style="width:100%;font-size:18px;" id="sdBtnFinish">Continue Adventure</button>
      </div>
    `;
  }

  startLevel() {
    this.overlay.style.display = 'none';
    this.keysDown.clear();
    this.transitioningLevel = false;

    const levelKey = String(Math.min(this.level, this.maxLevels));
    this.config.currentLevelData = this.config.levels[levelKey] || this.config.levels['5'];

    document.getElementById('sdLevel').textContent = `LEVEL ${this.level}`;
    this.isPlaying = true;
    this.enemiesSpawnedThisLevel = 0;
    this.lastTime = performance.now();

    this.enemies.forEach(enemy => enemy.el.remove());
    this.lasers.forEach(laser => laser.el.remove());
    this.enemies = [];
    this.lasers = [];
    this.spawnTimer = 0;
    this.enemyDirection = 1;
    this.enemyHorizontalSpeed = this.getFormationSpeed();
    this.enemyDropStep = this.getFormationDropStep();
    this.createEnemyFormation();
    this.showLevelFlash(`Level ${this.level}`);

    this.gameLoop(this.lastTime);
  }

  gameLoop(currentTime) {
    if (!this.isPlaying) return;
    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.update(dt);
    this.animationFrameId = requestAnimationFrame(t => this.gameLoop(t));
  }

  update(dt) {
    const SPEED = 80;
    const move = SPEED * (dt / 1000);
    if (this.keysDown.has('ArrowLeft') || this.keysDown.has('a') || this.keysDown.has('A')) {
      this.shipX = Math.max(5, this.shipX - move);
      this.shipElement.style.left = `${this.shipX}%`;
    }
    if (this.keysDown.has('ArrowRight') || this.keysDown.has('d') || this.keysDown.has('D')) {
      this.shipX = Math.min(95, this.shipX + move);
      this.shipElement.style.left = `${this.shipX}%`;
    }

    this.shootTimer += dt;
    if (this.shootTimer >= 400) {
      this.shoot();
      this.shootTimer = 0;
    }

    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.y -= (dt / 1000) * 100;
      laser.el.style.top = `${laser.y}%`;
      if (laser.y < -5) {
        laser.el.remove();
        this.lasers.splice(i, 1);
      }
    }

    const horizontalStep = this.enemyHorizontalSpeed * (dt / 1000) * this.enemyDirection;
    const shouldDrop = this.enemies.some(enemy => {
      const nextX = enemy.x + horizontalStep;
      const halfWidth = enemy.widthPct / 2;
      return nextX - halfWidth <= 4 || nextX + halfWidth >= 96;
    });

    if (shouldDrop) {
      this.enemyDirection *= -1;
      this.enemies.forEach(enemy => {
        enemy.y += this.enemyDropStep;
        enemy.el.style.top = `${enemy.y}%`;
      });
    } else {
      this.enemies.forEach(enemy => {
        enemy.x += horizontalStep;
        enemy.el.style.left = `${enemy.x}%`;
      });
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.y + enemy.heightPct >= this.enemyLowerBound) {
        this.loseLife();
        enemy.el.remove();
        this.enemies.splice(i, 1);
        continue;
      }

      for (let j = this.lasers.length - 1; j >= 0; j--) {
        const laser = this.lasers[j];
        if (this.checkCollision(laser, enemy)) {
          this.hitEnemy(enemy, i);
          laser.el.remove();
          this.lasers.splice(j, 1);
          break;
        }
      }
    }

    if (!this.transitioningLevel && this.enemiesSpawnedThisLevel >= this.config.currentLevelData.enemyCount && this.enemies.length === 0) {
      this.isPlaying = false;
      this.transitioningLevel = true;

      if (this.level >= this.maxLevels) {
        this.showLevelFlash('All levels cleared!');
        this.context.characterAnimation('celebrate');
        this.context.speak('Amazing! You cleared all 5 levels!');
        setTimeout(() => this.showScreen('summary'), 900);
      } else {
        this.showLevelFlash(`Level ${this.level} clear!`);
        this.context.characterAnimation('celebrate');
        setTimeout(() => {
          this.level++;
          this.startLevel();
        }, 650);
      }
    }
  }

  shoot() {
    this.metrics.shotsFired++;
    this.context.playSound('space-shot');
    const laserEl = document.createElement('div');
    laserEl.className = 'laser';
    laserEl.style.left = `${this.shipX}%`;
    laserEl.style.top = '82%';
    this.playArea.appendChild(laserEl);
    this.lasers.push({ el: laserEl, x: this.shipX, y: 82 });

    if (this.enemies.length > 0) {
      const target = this.enemies[this.enemies.length - 1];
      const spawnTime = this.metrics.enemySpawnTimes[target.id];
      if (spawnTime) {
        const reactTime = Date.now() - spawnTime;
        if (reactTime < 3000) this.metrics.reactionTimes.push(reactTime);
      }
    }
  }

  getFormationSpeed() {
    const levelSpeeds = [7, 8.5, 10.5, 12.5, 14];
    return levelSpeeds[Math.min(this.level, this.maxLevels) - 1] || 14;
  }

  getFormationDropStep() {
    return this.level >= 4 ? 7 : 6;
  }

  showLevelFlash(message) {
    if (!this.levelFlash) return;
    this.levelFlash.textContent = message;
    this.levelFlash.classList.remove('show');
    void this.levelFlash.offsetWidth;
    this.levelFlash.classList.add('show');
  }

  createEnemyFormation() {
    const enemyCount = this.config.currentLevelData.enemyCount;
    const columns = enemyCount >= 12 ? 5 : enemyCount >= 8 ? 4 : enemyCount >= 6 ? 4 : enemyCount;
    const rows = Math.ceil(enemyCount / columns);
    const widthPct = 9;
    const heightPct = 9;
    const gapX = 5;
    const gapY = 6;
    const formationWidth = columns * widthPct + (columns - 1) * gapX;
    const startX = 50 - formationWidth / 2 + widthPct / 2;
    const startY = 10;

    this.metrics.enemiesSpawned += enemyCount;
    this.enemiesSpawnedThisLevel = enemyCount;

    for (let index = 0; index < enemyCount; index++) {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const enemyX = startX + column * (widthPct + gapX);
      const enemyY = startY + row * (heightPct + gapY);
      const enemyEl = document.createElement('div');
      enemyEl.className = 'enemy';
      enemyEl.style.left = `${enemyX}%`;
      enemyEl.style.top = `${enemyY}%`;

      const img = document.createElement('img');
      img.className = 'enemy-sprite';
      img.src = 'assets/images/games/space-defender/enemies/space-aliens/alien1.png';
      img.onerror = () => {
        img.src = '';
        img.style.backgroundColor = '#ef4444';
        img.style.borderRadius = '12px';
      };
      enemyEl.appendChild(img);
      this.playArea.appendChild(enemyEl);

      const enemyId = `enemy_${Date.now()}_${index}_${Math.random()}`;
      this.metrics.enemySpawnTimes[enemyId] = Date.now();
      this.enemies.push({
        id: enemyId,
        el: enemyEl,
        x: enemyX,
        y: enemyY,
        widthPct,
        heightPct
      });
    }
  }

  checkCollision(laser, enemy) {
    const laserRect = laser.el.getBoundingClientRect();
    const enemyRect = enemy.el.getBoundingClientRect();
    const enemyInset = 6;

    const eLeft = enemyRect.left + enemyInset;
    const eRight = enemyRect.right - enemyInset;
    const eTop = enemyRect.top + enemyInset;
    const eBottom = enemyRect.bottom - enemyInset;

    return (
      laserRect.left < eRight &&
      laserRect.right > eLeft &&
      laserRect.top < eBottom &&
      laserRect.bottom > eTop
    );
  }

  hitEnemy(enemy, index) {
    this.score++;
    this.metrics.enemiesHit++;
    document.getElementById('sdScore').textContent = this.score;

    const exp = document.createElement('div');
    exp.className = 'explosion';
    exp.style.left = `${enemy.x}%`;
    exp.style.top = `${enemy.y}%`;
    this.playArea.appendChild(exp);
    setTimeout(() => exp.remove(), 400);

    this.context.playSound('space-hit');
    this.context.characterAnimation('thumbs-up');
    enemy.el.remove();
    this.enemies.splice(index, 1);
  }

  loseLife() {
    this.lives--;
    const livesEls = document.querySelectorAll('.life');
    if (livesEls[this.lives]) livesEls[this.lives].classList.add('lost');

    const now = Date.now();
    if (now - this._lastLossSoundAt > 2500) {
      this.context.playSound('space-destroyed');
      this._lastLossSoundAt = now;
    }

    this.context.characterAnimation('nod');

    this.container.style.boxShadow = 'inset 0 0 50px red';
    setTimeout(() => {
      this.container.style.boxShadow = 'none';
    }, 300);

    if (this.lives <= 0) {
      this.isPlaying = false;
      this.transitioningLevel = true;
      // Play a losing voice clip when all hearts are gone
      this.context.speak('aww man');
      setTimeout(() => this.showScreen('gameOver'), 1000);
    }
  }
}

if (typeof window !== 'undefined') {
  window.SpaceDefenderGame = SpaceDefenderGame;
}
