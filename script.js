
(() => {
  // ==========================================
  // 1. DRAGGABLE DESK STICKERS
  // ==========================================

  let topZ = 30;

  const draggables = document.querySelectorAll('[data-draggable]');

  draggables.forEach((el) => {
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let moved = false;

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      dragging = true;
      moved = false;

      topZ += 1;
      el.style.zIndex = String(topZ);

      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);

      startX = e.clientX - offsetX;
      startY = e.clientY - offsetY;
    });

    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;

      const nextX = e.clientX - startX;
      const nextY = e.clientY - startY;

      if (
        Math.abs(nextX - offsetX) > 3 ||
        Math.abs(nextY - offsetY) > 3
      ) {
        moved = true;
      }

      offsetX = nextX;
      offsetY = nextY;

      const rot = el.style.getPropertyValue('--rot') || '0deg';

      el.style.transform =
        `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rot})`;
    });

    const finishDrag = (e) => {
      if (!dragging) return;

      dragging = false;
      el.classList.remove('is-dragging');

      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }

      if (moved) {
        el.dataset.justDragged = 'true';

        setTimeout(() => {
          delete el.dataset.justDragged;
        }, 60);
      }
    };

    el.addEventListener('pointerup', finishDrag);
    el.addEventListener('pointercancel', finishDrag);
  });


  // ==========================================
  // 2. VINYL MUSIC PLAYER
  // ==========================================

  // Use a relative path to your actual audio file.

  audio.loop = true;
  audio.volume = 0.6;

  let isPlaying = false;

 function setVinylVisualState(playing) {
  const rotor = document.getElementById('vinyl-disc-rotor');
  const badge = document.getElementById('vinyl-status-badge');
  const mobileIcon = document.getElementById('mobile-vinyl-icon');
  const mobileLabel = document.getElementById('mobile-vinyl-label');

  if (rotor) {
    rotor.classList.toggle('animate-spin-disc', playing);
  }
  if (badge) {
    badge.classList.toggle('hidden', !playing);
    badge.textContent = playing ? '♪ PLAYING' : '';
  }
  if (mobileIcon) {
    mobileIcon.classList.toggle('animate-spin-disc', playing);
    mobileIcon.textContent = playing ? '♫' : '●';
  }
  if (mobileLabel) {
    mobileLabel.textContent = playing ? 'Playing • Stop' : 'Click to Play';
  }
}
  async function startMusic() {
    try {
      await audio.play();

      isPlaying = true;
      setVinylVisualState(true);

      return true;
    } catch (err) {
      isPlaying = false;
      setVinylVisualState(false);

      return false;
    }
  }

  function stopMusic() {
    audio.pause();

    isPlaying = false;

    setVinylVisualState(false);
  }

  async function toggleVinylMusic() {
    if (!isPlaying) {
      await startMusic();
    } else {
      stopMusic();
    }
  }

  // Desktop vinyl click
  document.querySelectorAll('[data-vinyl-toggle]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (card.dataset.justDragged === 'true') return;

      e.preventDefault();
      toggleVinylMusic();
    });
  });

  // Autoplay attempt with browser fallback
  async function initializeMusic() {
    const started = await startMusic();

    if (!started) {
      const unlockOnce = async () => {
        if (!isPlaying) {
          await startMusic();
        }

        document.removeEventListener('pointerdown', unlockOnce);
        document.removeEventListener('keydown', unlockOnce);
      };

      document.addEventListener('pointerdown', unlockOnce, {
        once: true
      });

      document.addEventListener('keydown', unlockOnce, {
        once: true
      });
    }
  }

  initializeMusic();


  // ==========================================
  // 3. ACTIVE NAVIGATION ON SCROLL
  // ==========================================

  const sections = ['home', 'work', 'experience', 'stack']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navLinks = document.querySelectorAll('.nav-link');

  function updateNavigation() {
    const scrollPos = window.scrollY + 140;

    let currentId = 'home';

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const hrefId = (link.getAttribute('href') || '').replace('#', '');

      link.classList.toggle('active', hrefId === currentId);
    });
  }

  window.addEventListener('scroll', updateNavigation, {
    passive: true
  });

  updateNavigation();


  // ==========================================
  // 4. EMAIL COPY & TOAST NOTIFICATION
  // ==========================================

  let toastTimeout;

  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 2600);
  }

  function fallbackCopy(text, successMsg) {
    const input = document.createElement('input');

    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';

    document.body.appendChild(input);

    input.select();

    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast(text);
    }

    document.body.removeChild(input);
  }

  window.copyText = function (text, successMsg) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => showToast(successMsg))
        .catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  };


  // ==========================================
  // 5. CURRENT YEAR
  // ==========================================

  const year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

})();
