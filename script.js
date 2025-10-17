/* script.js - interactions and game logic */

window.addEventListener('load', () => {
  // basic interactions
  document.getElementById('year').textContent = new Date().getFullYear();
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', () => document.body.classList.toggle('light'));

  // Game variables
  const playBtn = document.getElementById('playBtn');
  const restartBtn = document.getElementById('restartBtn');
  const overlay = document.getElementById('gameOverlay');
  const overlayText = document.getElementById('overlayText');
  const overlayRestart = document.getElementById('overlayRestart');
  const scoreEl = document.getElementById('score');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let player = { x: canvas.width/2 - 20, y: canvas.height - 60, w: 40, h: 20, speed: 6 };
  let obstacles = [];
  let keys = {};
  let score = 0;
  let running = false;
  let gameOver = false;
  let spawnRate = 0.02; // initial chance to spawn each frame
  let baseSpeed = 2.5;
  let difficultyTimer = 0;

  function resetGame() {
    obstacles = [];
    keys = {};
    score = 0;
    running = false;
    gameOver = false;
    spawnRate = 0.02;
    baseSpeed = 2.5;
    difficultyTimer = 0;
    scoreEl.textContent = score;
    overlay.classList.add('hidden');
    restartBtn.style.display = 'none';
    playBtn.style.display = 'inline-block';
    clearCanvas();
    drawStatic(); // initial frame
  }

  function startGame() {
    resetGame();
    running = true;
    playBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    gameLoop();
  }

  function endGame() {
    running = false;
    gameOver = true;
    overlayText.innerHTML = 'Game Over<br>Score: <strong>' + score + '</strong>';
    overlay.classList.remove('hidden');
    restartBtn.style.display = 'inline-block';
  }

  function spawnObstacle() {
    const size = 28 + Math.random() * 20;
    const x = Math.random() * (canvas.width - size);
    const speed = baseSpeed + Math.random() * 1.5 + (difficultyTimer * 0.002);
    obstacles.push({ x, y: -size, w: size, h: size, speed });
  }

  function update() {
    if (!running) return;
    // player movement
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

    // spawn new obstacles randomly based on spawnRate
    if (Math.random() < spawnRate) spawnObstacle();

    // update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].y += obstacles[i].speed;
      if (obstacles[i].y > canvas.height + 50) obstacles.splice(i, 1);
    }

    // collisions
    for (let o of obstacles) {
      if (o.x < player.x + player.w && o.x + o.w > player.x && o.y < player.y + player.h && o.y + o.h > player.y) {
        endGame();
      }
    }

    // increase difficulty gradually
    difficultyTimer++;
    if (difficultyTimer % 240 === 0) {
      spawnRate += 0.005;
      baseSpeed += 0.25;
    }

    score++;
    scoreEl.textContent = score;
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawStatic() {
    clearCanvas();
    // background gradient
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#07173a');
    g.addColorStop(1, '#000814');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // player
    ctx.fillStyle = '#3fa7d6';
    roundRect(ctx, player.x, player.y, player.w, player.h, 6, true, false);

    // obstacles
    ctx.fillStyle = '#b5e2fa';
    for (let o of obstacles) {
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
  }

  function draw() {
    clearCanvas();
    // background
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#07173a');
    g.addColorStop(1, '#000814');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // player shadow + glow
    ctx.save();
    ctx.fillStyle = 'rgba(63,167,214,0.12)';
    ctx.fillRect(player.x - 4, player.y - 6, player.w + 8, player.h + 12);
    ctx.restore();

    // player
    ctx.fillStyle = '#3fa7d6';
    roundRect(ctx, player.x, player.y, player.w, player.h, 6, true, false);

    // obstacles
    ctx.fillStyle = '#b5e2fa';
    for (let o of obstacles) {
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // input handlers
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  // buttons
  playBtn.addEventListener('click', () => {
    if (!running) {
      running = true;
      playBtn.style.display = 'none';
      restartBtn.style.display = 'none';
      overlay.classList.add('hidden');
    }
  });

  restartBtn.addEventListener('click', () => {
    resetGame();
    running = true;
    playBtn.style.display = 'none';
    restartBtn.style.display = 'none';
  });

  overlayRestart.addEventListener('click', () => {
    resetGame();
    running = true;
    overlay.classList.add('hidden');
  });

  // initialize small static frame & start loop paused
  resetGame();
  gameLoop();
});