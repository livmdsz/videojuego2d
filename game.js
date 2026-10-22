(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const screens = ['#loadingScreen', '#menuScreen', '#gameScreen'];
  const canvas = $('#gameCanvas'), ctx = canvas.getContext('2d');
  const zombieImg = new Image(); zombieImg.src = 'assets/zombie.png';
  const ambience = $('#ambience'), shotSound = $('#shotSound'), hitSound = $('#hitSound'), comboSound = $('#comboSound');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let soundOn = true, volume = .35, gameRunning = false, paused = false, score = 0;
  let duration = 60, timeLeft = duration, lastTick = 0, animFrame = 0, lastFrame = 0;
  let entities = [], particles = [], crosshair = { x: canvas.width / 2, y: canvas.height / 2 };
  let combo = 0, comboTimer = 0, maxCombo = 0;
  let focusAvailable = true, focusActive = false, focusCooldown = 0, focusEnergy = 100;
  let glitchEnabled = true, glitchIntensity = 0, glitchTimer = 0;
  let lastShotTime = 0;
  let record = Number(localStorage.getItem('psychosisRecord') || 0);

  $('#record').textContent = String(record).padStart(2, '0');
  $('#year').textContent = new Date().getFullYear();

  function updateDate() {
    $('#currentDate').textContent = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
  }
  updateDate();

  /* ========== SISTEMA DE PANTALLAS Y MODALES ========== */
  function showScreen(id) { screens.forEach(s => $(s).classList.toggle('hidden', s !== id)); }
  function setModal(id, open = true) { $(id).classList.toggle('hidden', !open); }

  /* ========== FRASES DE CARGA Y WHISPERS ========== */
  const loadingTips = [
    '…la señal se debilita…',
    '…no confíes en lo que ves…',
    '…los pasillos cambian cuando parpadeas…',
    '…el sujeto 09 sigue ahí…',
    '…escuchas pasos que no son tuyos…'
  ];
  const menuWhispers = [
    'no mires atrás',
    'estamos dentro',
    'sector 09 no existe',
    '¿quién apagó las luces?',
    'el sujeto 09 escapó',
    'cuenta las cabezas',
    'no son zombis'
  ];

  function initLoading() {
    let p = 0; const bar = $('#loadBar'), label = $('#loadPercent'), status = $('#loadStatus'), tip = $('#loadingTip');
    const statuses = ['CARGANDO RECURSOS...', 'INICIALIZANDO ENTIDADES...', 'SINCRONIZANDO SEÑAL...', 'PROTOCOLO LISTO'];
    tip.textContent = loadingTips[Math.floor(Math.random() * loadingTips.length)];
    const tipTimer = setInterval(() => { tip.textContent = loadingTips[Math.floor(Math.random() * loadingTips.length)]; }, 900);
    const timer = setInterval(() => {
      p = Math.min(100, p + Math.ceil(Math.random() * 5));
      bar.style.width = p + '%'; label.textContent = p + '%'; status.textContent = statuses[Math.min(3, Math.floor(p / 26))];
      if (p >= 100) { clearInterval(timer); clearInterval(tipTimer); setTimeout(() => showScreen('#menuScreen'), 350); }
    }, 85);
  }

  /* ========== AUDIO ========== */
  function initAudio() { if (!soundOn) return; ambience.volume = volume; ambience.play().catch(() => { }); }
  function playShot() { if (!soundOn) return; try { shotSound.currentTime = 0; shotSound.volume = .65; shotSound.play().catch(() => { }); } catch (e) { } }
  function playHit() { if (!soundOn) return; try { hitSound.currentTime = 0; hitSound.volume = .7; hitSound.play().catch(() => { }); } catch (e) { } }
  function playCombo() { if (!soundOn) return; try { comboSound.currentTime = 0; comboSound.volume = .55; comboSound.play().catch(() => { }); } catch (e) { } }

  $('#soundToggle').addEventListener('click', () => {
    soundOn = !soundOn;
    $('#soundToggle').innerHTML = soundOn ? '♫ <span>SONIDO</span>' : '♩ <span>MUDO</span>';
    if (soundOn) { ambience.volume = volume; ambience.play().catch(() => { }); } else ambience.pause();
  });

  /* ========== ENTIDADES ========== */
  function random(min, max) { return Math.random() * (max - min) + min; }

  function spawnEntity(existing) {
    const w = canvas.width, h = canvas.height, size = random(46, 82);
    const type = ['up', 'down', 'diagonal', 'circular'][Math.floor(Math.random() * 4)];
    let x, y;
    if (existing) { x = random(35, w - 35); y = random(40, h - 40); }
    else { x = random(35, w - 35); y = random(40, h - 40); }
    const speed = random(34, 88);
    return { x, y, size, vx: random(-1, 1) * speed, vy: random(-1, 1) * speed, speed, type, phase: random(0, Math.PI * 2), orbit: random(16, 48), radius: size * .19, angle: random(0, Math.PI * 2), spin: random(.4, 1.1) * (Math.random() < .5 ? -1 : 1), bob: random(0, Math.PI * 2), flash: 0, variant: Math.random() };
  }
  function resetEntities() { entities = Array.from({ length: 25 }, () => spawnEntity(false)); }

  /* ========== ESTADO DEL JUEGO ========== */
  function startGame() {
    setModal('#instructionsModal', false); setModal('#settingsModal', false); setModal('#resultModal', false);
    showScreen('#gameScreen');
    score = 0; timeLeft = duration; paused = false; gameRunning = true;
    combo = 0; maxCombo = 0; comboTimer = 0;
    focusAvailable = true; focusActive = false; focusCooldown = 0; focusEnergy = 100;
    glitchIntensity = 0;
    lastTick = performance.now(); lastFrame = lastTick;
    $('#score').textContent = '00'; $('#timer').innerHTML = timeLeft + '<span>s</span>'; $('#timer').classList.remove('urgent');
    $('#activeCount').textContent = '25'; $('#pauseBtn').textContent = 'Ⅱ PAUSAR';
    $('#comboBadge').classList.add('hidden'); $('#comboLabel').textContent = '0';
    $('#pauseOverlay').classList.add('hidden'); $('#startHint').classList.remove('faded');
    $('#focusBtn').classList.remove('active'); $('#focusBtn').disabled = false;
    resetEntities(); particles = [];
    cancelAnimationFrame(animFrame); initAudio();
    animFrame = requestAnimationFrame(loop);
    setTimeout(() => $('#startHint').classList.add('faded'), 2200);
  }

  function finishGame() {
    gameRunning = false; cancelAnimationFrame(animFrame);
    $('#finalScore').textContent = String(score).padStart(2, '0');
    if (score > record) { record = score; localStorage.setItem('psychosisRecord', String(record)); }
    $('#record').textContent = String(record).padStart(2, '0');
    $('#finalRecord').textContent = String(record).padStart(2, '0');
    // Rango según puntuación
    let rank = 'SUPERVIVIENTE';
    if (score >= 8) rank = 'EXPLORADOR';
    if (score >= 15) rank = 'CAZADOR';
    if (score >= 25) rank = 'EJECUTOR';
    if (score >= 35) rank = 'VERDUGO DEL SECTOR 09';
    if (maxCombo >= 8) rank += ' · RACHA IMPARABLE';
    $('#resultRank').textContent = rank;
    setModal('#resultModal', true);
  }

  function pauseGame() {
    if (!gameRunning) return;
    paused = !paused;
    $('#pauseOverlay').classList.toggle('hidden', !paused);
    $('#pauseBtn').textContent = paused ? '▶ REANUDAR' : 'Ⅱ PAUSAR';
    if (!paused) { lastFrame = performance.now(); lastTick = lastFrame; animFrame = requestAnimationFrame(loop); }
  }
  $('#pauseBtn').addEventListener('click', pauseGame);
  $('#resumeBtn').addEventListener('click', pauseGame);
  $('#restartBtn').addEventListener('click', startGame);
  $('#menuBtn').addEventListener('click', () => { gameRunning = false; cancelAnimationFrame(animFrame); showScreen('#menuScreen'); });
  $('#playAgainBtn').addEventListener('click', startGame);
  $('#resultMenuBtn').addEventListener('click', () => { setModal('#resultModal', false); showScreen('#menuScreen'); });

  /* ========== MODO ENFOQUE ========== */
  function activateFocus() {
    if (!gameRunning || paused || !focusAvailable) return;
    focusAvailable = false; focusActive = true; focusEnergy = 100;
    $('#focusBtn').classList.add('active'); $('#focusBtn').disabled = true;
    setTimeout(() => {
      focusActive = false;
      $('#focusBtn').classList.remove('active');
      focusCooldown = 6;
      $('#focusBtn').textContent = '◎ RECARGA';
      const rec = setInterval(() => {
        focusCooldown--;
        if (focusCooldown <= 0) { clearInterval(rec); focusAvailable = true; $('#focusBtn').disabled = false; $('#focusBtn').textContent = '◎ ENFOQUE'; }
      }, 1000);
    }, 3000);
  }
  $('#focusBtn').addEventListener('click', activateFocus);

  /* ========== MENÚ ========== */
  document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => {
    btn.classList.add('clicked'); setTimeout(() => btn.classList.remove('clicked'), 250);
    const action = btn.dataset.action;
    if (action === 'start') startGame();
    if (action === 'instructions') setModal('#instructionsModal', true);
    if (action === 'settings') setModal('#settingsModal', true);
    if (action === 'exit') {
      gameRunning = false; cancelAnimationFrame(animFrame); showScreen('#menuScreen');
      const title = $('.menu-panel .subtitle');
      title.textContent = 'SEÑAL DESCONECTADA — PUEDES CERRAR ESTA PESTAÑA';
    }
  }));
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => {
    setModal('#instructionsModal', false); setModal('#settingsModal', false);
  }));
  $('#volumeSlider').addEventListener('input', e => { volume = Number(e.target.value) / 100; ambience.volume = volume; });
  $('#durationSelect').addEventListener('change', e => { duration = Number(e.target.value); });
  $('#glitchToggle').addEventListener('change', e => { glitchEnabled = e.target.checked; });

  /* ========== POINTER ========== */
  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * canvas.width / rect.width, y: (e.clientY - rect.top) * canvas.height / rect.height };
  }
  canvas.addEventListener('pointermove', e => { crosshair = pointerPos(e); });
  canvas.addEventListener('pointerdown', e => {
    if (!gameRunning || paused) return;
    crosshair = pointerPos(e); playShot();
    const flash = $('#flash'); flash.classList.remove('fire'); void flash.offsetWidth; flash.classList.add('fire');
    let hit = -1;
    for (let i = entities.length - 1; i >= 0; i--) {
      const z = entities[i], headX = z.x, headY = z.y - z.size * .22, rx = z.size * .19, ry = z.size * .22;
      const dx = (crosshair.x - headX) / rx, dy = (crosshair.y - headY) / ry;
      if (dx * dx + dy * dy <= 1) { hit = i; break; }
    }
    if (hit >= 0) {
      const z = entities[hit];
      burst(z.x, z.y - z.size * .2);
      // Sistema de combo
      const now = performance.now();
      if (now - lastShotTime < 1500) { combo++; } else { combo = 1; }
      lastShotTime = now; comboTimer = 1.4;
      if (combo > maxCombo) maxCombo = combo;
      const mult = Math.min(5, combo);
      score += mult;
      playHit();
      if (combo >= 2) {
        playCombo();
        const badge = $('#comboBadge');
        badge.textContent = 'x' + mult; badge.classList.remove('hidden');
        badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop');
        $('#comboLabel').textContent = combo;
        showFloatScore(z.x, z.y - z.size * .4, '+' + mult);
      } else {
        $('#comboLabel').textContent = '1';
        showFloatScore(z.x, z.y - z.size * .4, '+1');
      }
      $('#score').textContent = String(score).padStart(2, '0');
      entities[hit] = spawnEntity(true);
      $('#activeCount').textContent = String(entities.length);
      $('#startHint').classList.add('faded');
      // Corrupción por aciertos
      if (combo >= 4) triggerGlitch(.6);
    } else {
      particles.push({ x: crosshair.x, y: crosshair.y, life: .18, max: .18, miss: true });
      combo = 0; $('#comboBadge').classList.add('hidden'); $('#comboLabel').textContent = '0';
    }
  });

  function showFloatScore(x, y, text) {
    const layer = $('#floatScoreLayer');
    const el = document.createElement('div');
    el.className = 'float-score';
    el.textContent = text;
    el.style.left = (x / canvas.width * 100) + '%';
    el.style.top = (y / canvas.height * 100) + '%';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  /* ========== PARTÍCULAS Y GLITCH ========== */
  function burst(x, y) {
    for (let i = 0; i < 15; i++) {
      const a = random(0, Math.PI * 2), s = random(50, 200);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: random(.18, .48), max: .48, miss: false });
    }
  }
  function triggerGlitch(duration = 1) {
    if (!glitchEnabled) return;
    glitchIntensity = duration; glitchTimer = duration;
    const layer = $('#glitchLayer');
    layer.classList.remove('active'); void layer.offsetWidth; layer.classList.add('active');
    const warn = $('#sanityWarning');
    warn.classList.remove('hidden'); warn.classList.add('show');
    setTimeout(() => warn.classList.remove('show'), 800);
  }

  /* ========== UPDATE ========== */
  function update(dt) {
    const speedFactor = focusActive ? .35 : 1;
    for (const z of entities) {
      z.phase += dt * z.spin * speedFactor; z.bob += dt * 2 * speedFactor;
      if (z.type === 'up') { z.y -= z.speed * dt * speedFactor; if (z.y < -z.size) z.y = canvas.height + z.size; }
      else if (z.type === 'down') { z.y += z.speed * dt * speedFactor; if (z.y > canvas.height + z.size) z.y = -z.size; }
      else if (z.type === 'diagonal') {
        z.x += z.vx * dt * speedFactor; z.y += z.vy * dt * speedFactor;
        if (z.x < z.size / 2 || z.x > canvas.width - z.size / 2) z.vx *= -1;
        if (z.y < z.size / 2 || z.y > canvas.height - z.size / 2) z.vy *= -1;
      }
      else {
        z.x += Math.cos(z.phase) * z.speed * .48 * dt * speedFactor;
        z.y += Math.sin(z.phase * 1.1) * z.speed * .42 * dt * speedFactor;
        if (z.x < z.size / 2 || z.x > canvas.width - z.size / 2) z.phase = Math.PI - z.phase;
        if (z.y < z.size / 2 || z.y > canvas.height - z.size / 2) z.phase = -z.phase;
      }
      z.x = Math.max(z.size * .28, Math.min(canvas.width - z.size * .28, z.x));
      z.y = Math.max(z.size * .3, Math.min(canvas.height - z.size * .3, z.y));
    }
    for (let i = 0; i < entities.length; i++)for (let j = i + 1; j < entities.length; j++) {
      const a = entities[i], b = entities[j], dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy), min = (a.size + b.size) * .25;
      if (dist < min && dist > 0) {
        const nx = dx / dist, ny = dy / dist;
        [a.vx, b.vx] = [b.vx, a.vx];[a.vy, b.vy] = [b.vy, a.vy];
        a.x -= nx * 2; b.x += nx * 2; a.y -= ny * 2; b.y += ny * 2;
        if (Math.random() < .07) particles.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, life: .16, max: .16, miss: false, collision: true });
      }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.life -= dt;
      if (p.vx) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 180 * dt; }
      if (p.life <= 0) particles.splice(i, 1);
    }
    // Timer de combo
    if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) { combo = 0; $('#comboBadge').classList.add('hidden'); $('#comboLabel').textContent = '0'; } }
    // Decaimiento del glitch
    if (glitchTimer > 0) { glitchTimer -= dt; glitchIntensity = Math.max(0, glitchTimer); }
    // Efecto de sangre en bordes (vignette global) según tiempo
    const vig = $('#vignette');
    if (timeLeft <= 10 && timeLeft > 0) { vig.classList.add('danger'); } else { vig.classList.remove('danger'); }
  }

  /* ========== DIBUJO ========== */
  const bgImg = new Image(); bgImg.src = 'assets/game-hall.png';

  function drawBackground() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (bgImg.complete && bgImg.naturalWidth) { ctx.drawImage(bgImg, 0, 0, w, h); }
    else { ctx.fillStyle = '#050908'; ctx.fillRect(0, 0, w, h); }
    const grad = ctx.createRadialGradient(w * .5, h * .5, 80, w * .5, h * .5, w * .72);
    grad.addColorStop(0, 'rgba(2,9,8,.04)'); grad.addColorStop(1, 'rgba(0,0,0,.72)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,28,24,.22)'; ctx.fillRect(0, 0, w, h);
    // Overlay de corrupción
    if (glitchIntensity > 0) {
      const a = glitchIntensity * .4;
      ctx.fillStyle = 'rgba(255,49,87,' + a + ')';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 12; i++) {
        const y = Math.random() * h, hh = Math.random() * 30 + 3;
        ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * .15) + ')';
        ctx.fillRect(0, y, w, hh);
      }
    }
  }

  function drawZombie(z) {
    const size = z.size;
    ctx.save();
    ctx.translate(z.x, z.y + Math.sin(z.bob) * 2);
    ctx.rotate(z.type === 'circular' ? Math.sin(z.phase) * .06 : 0);
    ctx.globalAlpha = .88 + Math.sin(z.bob * 1.4) * .08;
    if (zombieImg.complete && zombieImg.naturalWidth) {
      ctx.shadowColor = '#50ffdb'; ctx.shadowBlur = 5;
      ctx.drawImage(zombieImg, -size * .5, -size * .55, size, size * 1.05);
    } else {
      ctx.fillStyle = '#182b27'; ctx.beginPath(); ctx.arc(0, -size * .2, size * .28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff3157'; ctx.fillRect(-size * .14, -size * .24, size * .08, size * .05); ctx.fillRect(size * .06, -size * .24, size * .08, size * .05);
    }
    const hx = 0, hy = -size * .22, hr = size * .19;
    const dx = crosshair.x - (z.x + hx), dy = crosshair.y - (z.y + hy);
    if (Math.hypot(dx, dy) < hr * 1.8) {
      ctx.strokeStyle = '#ff3157'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hx, hy, hr + 5, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.max); ctx.globalAlpha = alpha;
      if (p.miss) { ctx.strokeStyle = '#ff3157'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 8 * (1 - alpha) + 2, 0, Math.PI * 2); ctx.stroke(); }
      else { ctx.fillStyle = p.collision ? '#b8fff2' : '#ff3157'; ctx.fillRect(p.x, p.y, random(2, 5), random(2, 5)); }
    }
    ctx.globalAlpha = 1;
  }

  function drawCrosshair() {
    const x = crosshair.x, y = crosshair.y;
    ctx.save();
    ctx.strokeStyle = '#c7fff4'; ctx.lineWidth = 1.4;
    ctx.shadowColor = '#ff3157'; ctx.shadowBlur = 7;
    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.moveTo(x - 23, y); ctx.lineTo(x - 7, y);
    ctx.moveTo(x + 7, y); ctx.lineTo(x + 23, y);
    ctx.moveTo(x, y - 23); ctx.lineTo(x, y - 7);
    ctx.moveTo(x, y + 7); ctx.lineTo(x, y + 23);
    ctx.stroke();
    ctx.strokeStyle = '#ff3157'; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.stroke();
    // Anillo extra cuando enfoque activo
    if (focusActive) {
      ctx.strokeStyle = '#65f7d5'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 22 + Math.sin(performance.now() * .01) * 3, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  /* ========== LOOP ========== */
  function loop(now) {
    if (!gameRunning || paused) return;
    const dt = Math.min((now - lastFrame) / 1000, .04); lastFrame = now;
    update(dt);
    if (now - lastTick >= 1000) {
      timeLeft--; lastTick = now;
      $('#timer').innerHTML = timeLeft + '<span>s</span>';
      if (timeLeft <= 10) $('#timer').classList.add('urgent');
      if (timeLeft <= 0) { finishGame(); return; }
    }
    drawBackground();
    entities.forEach(drawZombie);
    drawParticles();
    drawCrosshair();
    animFrame = requestAnimationFrame(loop);
  }

  /* ========== KEYBOARD ========== */
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('#instructionsModal').classList.contains('hidden')) setModal('#instructionsModal', false);
      else if (!$('#settingsModal').classList.contains('hidden')) setModal('#settingsModal', false);
      else if (gameRunning) pauseGame();
    }
    if (e.key === 'e' || e.key === 'E') { activateFocus(); }
  });

  /* ========== WHISPERS ALEATORIOS EN MENÚ ========== */
  setInterval(() => {
    const w = $('#menuWhisper');
    if (!w || $('#menuScreen').classList.contains('hidden')) return;
    w.textContent = menuWhispers[Math.floor(Math.random() * menuWhispers.length)];
    w.classList.add('show');
    setTimeout(() => w.classList.remove('show'), 2000);
  }, 4500);

  /* ========== INICIO ========== */
  initLoading();
})();