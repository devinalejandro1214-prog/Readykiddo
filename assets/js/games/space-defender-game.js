/* ─────────────────────────────────────────────────────────
   Space Defender Game Logic
   ───────────────────────────────────────────────────────── */

class SpaceDefenderGame {
  constructor(context) {
    this.context = context;
    this.container = document.getElementById('gameArea');
    
    // Game state
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.isPlaying = false;
    this.enemies = [];
    this.lasers = [];
    this.config = {
      levels: null,
      worlds: null,
      currentLevelData: null,
      worldData: null
    };

    // Tracking Metrics
    this.metrics = {
      shotsFired: 0,
      enemiesHit: 0,
      enemiesSpawned: 0,
      enemySpawnTimes: {},
      reactionTimes: [],
      dragPoints: []
    };

    // Game loop references
    this.lastTime = 0;
    this.spawnTimer = 0;
    this.shootTimer = 0;
    this.animationFrameId = null;

    // Ship element
    this.shipX = 50; // percentage

    // ── FIX: keyboard & on-screen arrow state ──
    this.keysDown = new Set();
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
      
      this.config.worldData = this.config.worlds[this.context.worldSlug] || this.config.worlds['space'];
      this.config.currentLevelData = this.config.levels[this.level.toString()];
      
      document.documentElement.style.setProperty('--sd-primary', this.config.worldData.colors.primary);
      document.documentElement.style.setProperty('--sd-accent', this.config.worldData.colors.accent);
      
    } catch (e) {
      console.warn('Using fallback Space Defender config', e);
      // ── FIX: complete fallback with colors ──
      this.config.worldData = {
        ship: 'assets/images/games/space-defender/ships/space-ship.png',
        background: 'assets/images/games/space-defender/backgrounds/space-bg.png',
        colors: { primary: '#4f46e5', accent: '#818cf8' }
      };
      this.config.levels = {
        '1': { enemyCount: 5,  speedMs: 2500, spawnIntervalMs: 2000 },
        '2': { enemyCount: 8,  speedMs: 2000, spawnIntervalMs: 1500 },
        '3': { enemyCount: 12, speedMs: 1500, spawnIntervalMs: 1200 },
        'endless': { enemyCount: 15, speedMs: 1000, spawnIntervalMs: 1000 }
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
        <div class="play-area" id="sdPlayArea">
          <div class="ship" id="sdShip" style="left: 50%;">
            <img src="${this.config.worldData.ship}" class="ship-sprite" onerror="this.src=''; this.style.backgroundColor='white'; this.style.borderRadius='10px';" />
            <div class="ship-cockpit">
              <img src="${this.context.characterPath}" onerror="this.src=''; this.style.backgroundColor='gray'; this.style.borderRadius='50%';" />
            </div>
          </div>
        </div>

        <!-- ── FIX: on-screen arrow controls ── -->
        <div class="arrow-controls" id="sdArrowControls">
          <button class="arrow-btn" id="sdBtnLeft" aria-label="Move Left">&#9664;</button>
          <div class="arrow-hint">or use arrow keys</div>
          <button class="arrow-btn" id="sdBtnRight" aria-label="Move Right">&#9654;</button>
        </div>

        <div id="sdOverlay" class="screen-overlay" style="display: none;"></div>
      </div>
    `;

    this.playArea   = document.getElementById('sdPlayArea');
    this.shipElement= document.getElementById('sdShip');
    this.overlay    = document.getElementById('sdOverlay');

    this.setupControls();
  }

  setupControls() {
    // ── drag / touch ──
    let isDragging = false;

    const startDrag = (e) => { if (!this.isPlaying) return; isDragging = true; this.updateShipPosition(e); };
    const moveDrag  = (e) => { if (!isDragging || !this.isPlaying) return; this.updateShipPosition(e); this.metrics.dragPoints.push({ x: this.shipX, time: Date.now() }); };
    const endDrag   = () => { isDragging = false; };

    this.playArea.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    this.playArea.addEventListener('touchstart', (e) => startDrag(e.touches[0]), { passive: false });
    document.addEventListener('touchmove',  (e) => moveDrag(e.touches[0]),  { passive: false });
    document.addEventListener('touchend', endDrag);

    // ── FIX: keyboard arrow keys (← → A D) ──
    document.addEventListener('keydown', (e) => {
      if (['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key)) {
        e.preventDefault();
        this.keysDown.add(e.key);
      }
    });
    document.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.key);
    });

    // ── FIX: on-screen arrow buttons (hold to move) ──
    const btnLeft  = document.getElementById('sdBtnLeft');
    const btnRight = document.getElementById('sdBtnRight');
    const addKey   = (key) => { this.keysDown.add(key); };
    const clearAll = ()    => { this.keysDown.delete('ArrowLeft'); this.keysDown.delete('ArrowRight'); };

    if (btnLeft) {
      btnLeft.addEventListener('mousedown',  () => addKey('ArrowLeft'));
      btnLeft.addEventListener('touchstart', () => addKey('ArrowLeft'), { passive: true });
    }
    if (btnRight) {
      btnRight.addEventListener('mousedown',  () => addKey('ArrowRight'));
      btnRight.addEventListener('touchstart', () => addKey('ArrowRight'), { passive: true });
    }
    document.addEventListener('mouseup',   clearAll);
    document.addEventListener('touchend',  clearAll);
  }

  updateShipPosition(e) {
    const rect = this.playArea.getBoundingClientRect();
    let x   = e.clientX || e.pageX;
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
        <div class="overlay-text">Enemies are coming! Use ← → arrows (or drag) to dodge — we auto-shoot!</div>
        <button class="btn-primary" id="sdBtnStart">Start Level 1</button>
      `;
      this.context.speak(`Ready for action, ${this.context.childName}? Enemies are coming!`);
      this.context.characterAnimation('wave');
    } else if (type === 'levelComplete') {
      html = `
        <div class="overlay-title">Level Complete!</div>
        <div class="overlay-text">Great job! The next level is faster!</div>
        <button class="btn-primary" id="sdBtnNext">Continue to Level ${this.level + 1}</button>
      `;
      this.context.speak(`Level ${this.level} Complete! Next level is faster!`);
      this.context.characterAnimation('celebrate');
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

    const btnNext = document.getElementById('sdBtnNext');
    if (btnNext) btnNext.onclick = () => { this.level++; this.startLevel(); };

    const btnSummary = document.getElementById('sdBtnSummary');
    if (btnSummary) btnSummary.onclick = () => this.showScreen('summary');

    const btnFinish = document.getElementById('sdBtnFinish');
    if (btnFinish) btnFinish.onclick = () => { this.context.goToNextGame('world-reveal'); };
  }

  generateSummaryHTML() {
    const accuracy    = this.metrics.shotsFired > 0 ? Math.round((this.metrics.enemiesHit / this.metrics.shotsFired) * 100) : 0;
    const avgReaction = this.metrics.reactionTimes.length > 0
      ? (this.metrics.reactionTimes.reduce((a, b) => a + b, 0) / this.metrics.reactionTimes.length / 1000).toFixed(1)
      : 'N/A';

    this.context.saveSession({ metrics: { accuracy, avgReaction, enemiesDefeated: this.score, levelsReached: this.level } });

    return `
      <div class="parent-summary">
        <h3>${this.context.childName}'s Space Defender Adventure</h3>
        <p><strong>🎯 What ${this.context.childName} Did:</strong><br>
        Piloted a ship and defended against incoming aliens using arrow keys and quick reflexes.</p>
        <p><strong>⭐ Skills Showed:</strong></p>
        <ul>
          <li>Hand-Eye Coordination (${accuracy}% hit accuracy)</li>
          <li>Quick Reaction Time (avg ${avgReaction} sec)</li>
          <li>Focus &amp; Attention</li>
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
    this.keysDown.clear(); // clear any stale keys

    const levelKey = this.level > 3 ? 'endless' : this.level.toString();
    this.config.currentLevelData = this.config.levels[levelKey] || this.config.levels['3'];

    if (levelKey === 'endless') {
      this.config.currentLevelData = Object.assign({}, this.config.currentLevelData);
      this.config.currentLevelData.enemyCount = 12 + (this.level - 4) * 3;
      this.config.currentLevelData.speedMs    = Math.max(400, 800 - (this.level - 4) * 50);
    }

    document.getElementById('sdLevel').textContent = `LEVEL ${this.level}`;
    this.isPlaying = true;
    this.enemiesSpawnedThisLevel = 0;
    this.lastTime = performance.now();

    this.enemies.forEach(e => e.el.remove());
    this.lasers.forEach(l => l.el.remove());
    this.enemies = [];
    this.lasers  = [];

    this.gameLoop(this.lastTime);
  }

  gameLoop(currentTime) {
    if (!this.isPlaying) return;
    const dt  = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.update(dt);
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // ── FIX: process arrow-key / button movement ──
    const SPEED = 80; // % per second
    const move  = SPEED * (dt / 1000);
    if (this.keysDown.has('ArrowLeft') || this.keysDown.has('a') || this.keysDown.has('A')) {
      this.shipX = Math.max(5, this.shipX - move);
      this.shipElement.style.left = `${this.shipX}%`;
    }
    if (this.keysDown.has('ArrowRight') || this.keysDown.has('d') || this.keysDown.has('D')) {
      this.shipX = Math.min(95, this.shipX + move);
      this.shipElement.style.left = `${this.shipX}%`;
    }

    // Shooting
    this.shootTimer += dt;
    if (this.shootTimer >= 400) {
      this.shoot();
      this.shootTimer = 0;
    }

    // Spawning
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.config.currentLevelData.spawnIntervalMs && this.enemiesSpawnedThisLevel < this.config.currentLevelData.enemyCount) {
      this.spawnEnemy();
      this.spawnTimer = 0;
      this.enemiesSpawnedThisLevel++;
    }

    // Move Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.y -= (dt / 1000) * 100;
      laser.el.style.top = `${laser.y}%`;
      if (laser.y < -5) { laser.el.remove(); this.lasers.splice(i, 1); }
    }

    // Move Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.y += (dt / this.config.currentLevelData.speedMs) * 100;
      enemy.el.style.top = `${enemy.y}%`;

      if (enemy.y > 90) {
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

    if (this.enemiesSpawnedThisLevel >= this.config.currentLevelData.enemyCount && this.enemies.length === 0) {
      this.isPlaying = false;
      setTimeout(() => this.showScreen('levelComplete'), 1000);
    }
  }

  shoot() {
    this.metrics.shotsFired++;
    const laserEl = document.createElement('div');
    laserEl.className = 'laser';
    laserEl.style.left = `${this.shipX}%`;
    laserEl.style.top  = '82%';
    this.playArea.appendChild(laserEl);
    this.lasers.push({ el: laserEl, x: this.shipX, y: 82 });

    if (this.enemies.length > 0) {
      const target    = this.enemies[this.enemies.length - 1];
      const spawnTime = this.metrics.enemySpawnTimes[target.id];
      if (spawnTime) {
        const reactTime = Date.now() - spawnTime;
        if (reactTime < 3000) this.metrics.reactionTimes.push(reactTime);
      }
    }
  }

  spawnEnemy() {
    this.metrics.enemiesSpawned++;
    const enemyX  = 10 + Math.random() * 80;
    const enemyEl = document.createElement('div');
    enemyEl.className   = 'enemy';
    enemyEl.style.left  = `${enemyX}%`;
    enemyEl.style.top   = '-10%';

    const img = document.createElement('img');
    img.className = 'enemy-sprite';
    img.src = 'assets/images/games/space-defender/enemies/space-aliens/alien1.png';
    img.onerror = () => { img.src = ''; img.style.backgroundColor = '#ef4444'; img.style.borderRadius = '50%'; };
    enemyEl.appendChild(img);
    this.playArea.appendChild(enemyEl);

    const enemyId = `enemy_${Date.now()}_${Math.random()}`;
    this.metrics.enemySpawnTimes[enemyId] = Date.now();
    this.enemies.push({ id: enemyId, el: enemyEl, x: enemyX, y: -10, width: 60, height: 60 });
  }

  checkCollision(laser, enemy) {
    // Generous hitbox — enemy ±10% wide, 18% tall; laser ±4% wide
    const eLeft   = enemy.x - 10, eRight  = enemy.x + 10;
    const eTop    = enemy.y,       eBottom = enemy.y + 18;
    const lLeft   = laser.x - 4,  lRight  = laser.x + 4;
    const lTop    = laser.y,       lBottom = laser.y + 8;
    return (lLeft < eRight && lRight > eLeft && lTop < eBottom && lBottom > eTop);
  }

  hitEnemy(enemy, index) {
    this.score++;
    this.metrics.enemiesHit++;
    document.getElementById('sdScore').textContent = this.score;

    const exp = document.createElement('div');
    exp.className  = 'explosion';
    exp.style.left = `${enemy.x}%`;
    exp.style.top  = `${enemy.y}%`;
    this.playArea.appendChild(exp);
    setTimeout(() => exp.remove(), 400);

    this.context.playSound('correct');
    this.context.characterAnimation('thumbs-up');
    enemy.el.remove();
    this.enemies.splice(index, 1);
  }

  loseLife() {
    this.lives--;
    const livesEls = document.querySelectorAll('.life');
    if (livesEls[this.lives]) livesEls[this.lives].classList.add('lost');

    this.context.playSound('wrong');
    this.context.characterAnimation('nod');

    this.container.style.boxShadow = 'inset 0 0 50px red';
    setTimeout(() => { this.container.style.boxShadow = 'none'; }, 300);

    if (this.lives <= 0) {
      this.isPlaying = false;
      setTimeout(() => this.showScreen('gameOver'), 1000);
    }
  }
}

if (typeof window !== 'undefined') {
  window.SpaceDefenderGame = SpaceDefenderGame;
}
