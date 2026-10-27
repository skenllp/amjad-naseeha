(function () {
  'use strict';

  // ---- Wedding date: 21 December 2026 (00:00 India time; no start time supplied) ----
  var weddingTime = new Date('2026-12-21T00:00:00+05:30').getTime();
  var labels = ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'];

  // ---- Falling petals ----
  var petals = document.getElementById('petals');
  for (var i = 0; i < 14; i++) {
    var p = document.createElement('span');
    p.style.left = ((i * 37 + 16) % 100) + '%';
    p.style.width = (9 + (i % 9)) + 'px';
    p.style.height = (6 + (i % 5)) + 'px';
    p.style.animationDelay = ((i * 1.7) % 12) + 's';
    p.style.animationDuration = (15 + (i % 12)) + 's';
    petals.appendChild(p);
  }

  // ---- Countdown ----
  var countdown = document.getElementById('countdown');
  var tiles = labels.map(function (label) {
    var unit = document.createElement('div');
    unit.className = 'count-unit';
    var tile = document.createElement('div');
    tile.className = 'count-tile';
    var num = document.createElement('span');
    num.textContent = '00';
    tile.appendChild(num);
    var lab = document.createElement('span');
    lab.className = 'count-label';
    lab.textContent = label;
    unit.appendChild(tile);
    unit.appendChild(lab);
    countdown.appendChild(unit);
    return num;
  });
  var last = [];
  function tick() {
    var s = Math.max(0, Math.floor((weddingTime - Date.now()) / 1000));
    var t = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
    t.forEach(function (v, i) {
      if (v !== last[i]) {
        last[i] = v;
        var el = tiles[i];
        el.textContent = String(v).padStart(2, '0');
        el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
      }
    });
  }
  tick();
  setInterval(tick, 1000);

  // ---- Envelope reveal on scroll ----
  var envelope = document.getElementById('envelope');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { envelope.classList.add('revealed'); io.disconnect(); }
    }, { threshold: 0.18 });
    io.observe(envelope);
  } else {
    envelope.classList.add('revealed');
  }

  // ---- Wishes dialog ----
  var modal = document.getElementById('wishes-modal');
  var openBtn = document.getElementById('open-wishes');
  var form = document.getElementById('wishes-form');
  var success = document.getElementById('wishes-success');
  var title = document.getElementById('wishes-title');
  var desc = document.getElementById('wishes-desc');
  var errorEl = document.getElementById('form-error');

  function showForm() {
    form.hidden = false; success.hidden = true; errorEl.hidden = true;
    title.textContent = 'Send Your Wishes';
    desc.textContent = 'A blessing from you means the world to us.';
  }
  function openModal() {
    showForm();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { document.getElementById('full-name').focus(); }, 50);
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    openBtn.focus();
  }
  openBtn.addEventListener('click', openModal);
  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.full_name.value.trim();
    var wishes = form.elements.wishes.value.trim();
    if (!name || !wishes) {
      errorEl.textContent = 'Please enter your name and wishes.';
      errorEl.hidden = false;
      return;
    }
    try {
      var entries = JSON.parse(localStorage.getItem('amjad-naseeha-wishes') || '[]');
      entries.push({ name: name, wishes: wishes, createdAt: new Date().toISOString() });
      localStorage.setItem('amjad-naseeha-wishes', JSON.stringify(entries));
    } catch (err) {}
    var message = '*Wedding Wishes for Amjad Sha & Naseeha Noushad* 💍✨\n\n*From:* ' + name + '\n\n*Wishes:* ' + wishes;
    // No phone number supplied: WhatsApp lets the guest choose the contact.
    // To send straight to the couple, use 'https://wa.me/91XXXXXXXXXX?text='
    window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank');
    form.reset();
    form.hidden = true; success.hidden = false; errorEl.hidden = true;
    title.textContent = 'Thank You for Your Wishes';
    desc.textContent = 'Your blessing is ready to share on WhatsApp.';
  });

  // ---- Background Music (Autoplay & Loop) ----
  var audio = document.getElementById('bg-music');
  var musicBtn = document.getElementById('music-toggle');

  if (audio && musicBtn) {
    function updateBtnState(playing) {
      if (playing) {
        musicBtn.classList.add('playing');
        musicBtn.setAttribute('aria-label', 'Pause background music');
        musicBtn.setAttribute('title', 'Pause background music');
      } else {
        musicBtn.classList.remove('playing');
        musicBtn.setAttribute('aria-label', 'Play background music');
        musicBtn.setAttribute('title', 'Play background music');
      }
    }

    function playAudio() {
      var promise = audio.play();
      if (promise !== undefined) {
        promise.then(function () {
          updateBtnState(true);
          cleanupAutoplayListeners();
        }).catch(function () {
          // Autoplay was blocked by browser policy; wait for first interaction
          updateBtnState(false);
        });
      }
    }

    var interactionEvents = ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown', 'scroll'];
    function onFirstInteraction() {
      if (audio.paused) {
        playAudio();
      }
      cleanupAutoplayListeners();
    }

    function cleanupAutoplayListeners() {
      interactionEvents.forEach(function (event) {
        window.removeEventListener(event, onFirstInteraction, { capture: true });
        document.removeEventListener(event, onFirstInteraction, { capture: true });
      });
    }

    // Try playing immediately on open
    playAudio();

    // If browser policy blocks autoplay without gesture, trigger on first tap/scroll anywhere
    interactionEvents.forEach(function (event) {
      window.addEventListener(event, onFirstInteraction, { capture: true, once: true });
      document.addEventListener(event, onFirstInteraction, { capture: true, once: true });
    });

    // Toggle button handler
    musicBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (audio.paused) {
        audio.play().then(function () {
          updateBtnState(true);
        }).catch(function (err) {
          console.error('Audio play error:', err);
        });
      } else {
        audio.pause();
        updateBtnState(false);
      }
    });

    audio.addEventListener('play', function () { updateBtnState(true); });
    audio.addEventListener('pause', function () { updateBtnState(false); });
  }
})();

