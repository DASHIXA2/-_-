/* ===================================================
   НАСТРОЙКИ — 10 ФОТО ЭЛЬВИРЫ
   =================================================== */

const EMOJIS = ['💖','🌸','✨','🦋','💫','🌷','💝','⭐','🌹','💕','🌺','💗'];

const PHOTOS = [
  { src: 'photos/1.jpg',  caption: 'Эльвира, твоя улыбка сводит меня с ума 🌸' },
  { src: 'photos/2.jpg',  caption: 'Самая лучшая, Эльвира 🌅' },
  { src: 'photos/3.jpg',  caption: 'Самая красивая девушка на свете — это ты 💫' },
  { src: 'photos/4.jpg',  caption: 'Мой любимый момент с тобой 🥰' },
  { src: 'photos/5.jpg',  caption: 'Эльвира — моё вдохновение ✨' },
  { src: 'photos/6.jpg',  caption: 'Обожаю тебя, Эльвира 💖' },
  { src: 'photos/7.jpg',  caption: 'Здесь ты особенно красива 🌷' },
  { src: 'photos/8.jpg',  caption: 'Мой любимый кадр с тобой 💕' },
  { src: 'photos/9.jpg',  caption: 'Эльвира, ты — моё счастье 💗' },
  { src: 'photos/10.jpg', caption: 'Просто потому что ты — Эльвира 💖' },
];

const CLICKS_TO_FINAL = 8;   // финал после 8 разных фото
const MUSIC_VOLUME   = 0.4;  // громкость музыки

/* ===================================================
   ДАЛЬШЕ НЕ ТРОГАЙ
   =================================================== */

const playground   = document.getElementById('playground');
const modal        = document.getElementById('modal');
const modalImg     = document.getElementById('modal-img');
const modalCaption = document.getElementById('modal-caption');
const closeBtn     = document.querySelector('.close');
const finalScreen  = document.getElementById('final');
const restartBtn   = document.getElementById('restart');
const bgMusic      = document.getElementById('bg-music');
const musicBtn     = document.getElementById('music-btn');
const musicIcon    = document.getElementById('music-icon');
const intro        = document.getElementById('intro');
const introBtn     = document.getElementById('intro-btn');

let openedCount  = 0;
let isFinalShown = false;
let musicStarted = false;
let musicEnabled = true;
let isMusicBusy  = false;

/* ===================================================
   ПРОВЕРКА ФАЙЛА МУЗЫКИ
   =================================================== */

(function checkMusic() {
  if (!bgMusic) {
    console.error('❌ Не найден <audio id="bg-music"> в HTML');
    return;
  }

  bgMusic.addEventListener('loadedmetadata', () => {
    console.log('✅ music.mp3 найден. Длительность:', Math.round(bgMusic.duration), 'сек.');
  });

  bgMusic.addEventListener('error', () => {
    console.error('❌ ФАЙЛ music.mp3 НЕ НАЙДЕН или повреждён.');
    console.error('   Проверь:');
    console.error('   1. Файл music.mp3 лежит рядом с index.html');
    console.error('   2. Имя ровно: music.mp3 (маленькими буквами)');
    console.error('   3. Файл открывается в плеере (двойной клик)');
    if (musicIcon) musicIcon.textContent = '⚠️';
    if (musicBtn) musicBtn.title = 'music.mp3 не найден';
  });
})();

/* ===================================================
   МУЗЫКА — ПЛАВНАЯ
   =================================================== */

function fadeVolume(target, duration = 1000) {
  return new Promise(resolve => {
    const start = bgMusic.volume;
    const diff = target - start;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      bgMusic.volume = Math.max(0, Math.min(1, start + diff * progress));
      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

async function startMusic() {
  if (!bgMusic || !musicEnabled || isMusicBusy) return;
  if (!bgMusic.paused && bgMusic.volume > 0) return;

  isMusicBusy = true;
  try {
    bgMusic.volume = 0;
    await bgMusic.play();
    musicStarted = true;
    musicIcon.textContent = '🔊';
    musicBtn.classList.add('playing');
    console.log('✅ Музыка играет');
    await fadeVolume(MUSIC_VOLUME, 1500);
  } catch (err) {
    console.error('❌ play() не сработал:', err.name, err.message);
    if (err.name === 'NotAllowedError') {
      console.error('👉 Браузер блокирует. Нажми ещё раз на кнопку.');
    }
    musicIcon.textContent = '⚠️';
  } finally {
    isMusicBusy = false;
  }
}

async function pauseMusic() {
  if (isMusicBusy) return;
  isMusicBusy = true;
  try {
    await fadeVolume(0, 600);
    bgMusic.pause();
    musicIcon.textContent = '🔇';
    musicBtn.classList.remove('playing');
    console.log('⏸ Пауза');
  } finally {
    isMusicBusy = false;
  }
}

async function toggleMusic() {
  if (isMusicBusy) return;
  if (!musicStarted) { musicEnabled = true; await startMusic(); return; }
  if (bgMusic.paused) { musicEnabled = true; await startMusic(); }
  else { musicEnabled = false; await pauseMusic(); }
}

if (musicBtn) {
  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMusic();
  });
}

/* ===================================================
   ВСТУПИТЕЛЬНЫЙ ЭКРАН
   =================================================== */

if (introBtn) {
  introBtn.addEventListener('click', () => {
    intro.classList.add('hide');
    if (!musicStarted && musicEnabled) startMusic();
    setTimeout(() => intro.remove(), 900);
  });
}

/* ===================================================
   ОЧЕРЕДЬ ФОТО — БЕЗ ПОВТОРОВ
   =================================================== */

let photoQueue = [];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextPhoto() {
  if (photoQueue.length === 0) photoQueue = shuffle(PHOTOS);
  return photoQueue.pop();
}

photoQueue = shuffle(PHOTOS);

/* ===================================================
   ЛЕТАЮЩИЕ ЭМОДЗИ
   =================================================== */

function spawnFloater() {
  if (isFinalShown) return;

  const el = document.createElement('div');
  el.className = 'floater';
  el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  el.style.left = Math.random() * 92 + 'vw';
  el.style.fontSize = (1.8 + Math.random() * 2.2) + 'rem';
  el.style.animationDuration = (11 + Math.random() * 9) + 's';
  el.style.animationDelay = (Math.random() * 2.5) + 's';

  const photo = nextPhoto();
  el.dataset.src = photo.src;
  el.dataset.caption = photo.caption;

  el.addEventListener('click', () => {
    openModal(el.dataset.src, el.dataset.caption);
    el.style.transition = 'transform 0.3s, opacity 0.3s';
    el.style.transform = 'scale(0)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  });

  playground.appendChild(el);
  setTimeout(() => el.remove(), 25000);
}

/* ===================================================
   МОДАЛКА
   =================================================== */

function openModal(src, caption) {
  if (!musicStarted && musicEnabled) startMusic();
  modalImg.src = src;
  modalCaption.textContent = caption;
  modal.classList.add('show');

  if (!modal.dataset.opened) modal.dataset.opened = '';
  if (!modal.dataset.opened.includes(src)) {
    modal.dataset.opened += '|' + src;
    openedCount++;
  }
}

function closeModal() {
  modal.classList.remove('show');
  modalImg.src = '';
  if (openedCount >= CLICKS_TO_FINAL && !isFinalShown) {
    setTimeout(showFinal, 500);
  }
}

/* ===================================================
   ФИНАЛ
   =================================================== */

function showFinal() {
  isFinalShown = true;
  finalScreen.classList.add('show');
  document.querySelectorAll('.floater').forEach(f => f.remove());
  if (musicStarted && !bgMusic.paused) {
    fadeVolume(Math.min(1, MUSIC_VOLUME + 0.2), 1500);
  }
}

restartBtn.addEventListener('click', () => {
  finalScreen.classList.remove('show');
  isFinalShown = false;
  openedCount = 0;
  modal.dataset.opened = '';
  photoQueue = shuffle(PHOTOS);
  if (musicStarted && !bgMusic.paused) fadeVolume(MUSIC_VOLUME, 1000);
  for (let i = 0; i < 6; i++) setTimeout(spawnFloater, i * 400);
});

/* ===================================================
   ОБРАБОТЧИКИ
   =================================================== */

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ===================================================
   ЗАПУСК
   =================================================== */

console.log('🚀 Сайт запущен. Фото в списке:', PHOTOS.length);

for (let i = 0; i < 8; i++) setTimeout(spawnFloater, i * 350);
setInterval(spawnFloater, 1200);