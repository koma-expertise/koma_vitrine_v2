/* KOMA — Interactions communes */
(function () {
  'use strict';

  /* ── Header : ombre au scroll + menu mobile ── */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var toggle = header.querySelector('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = header.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  /* ── Lien actif ── */
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

  /* ── Reveal au scroll ── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Barres de progression (data-width) ── */
  var bars = document.querySelectorAll('[data-width]');
  if (bars.length) {
    var ioBars = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.width = e.target.getAttribute('data-width');
          ioBars.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (el) { ioBars.observe(el); });
  }

  /* ── Compteurs (data-counter) ── */
  var counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    var ioCnt = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        ioCnt.unobserve(e.target);
        var el = e.target;
        var target = parseInt(el.getAttribute('data-counter'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var t0 = null;
        var dur = 1400;
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { ioCnt.observe(el); });
  }

  /* ── FAQ accordéon ── */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (answer) {
        answer.style.maxHeight = expanded ? '0px' : answer.scrollHeight + 'px';
      }
    });
  });

  /* ── Services : filtres de situation ── */
  var filters = document.querySelectorAll('.situation-filter');
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        var f = btn.getAttribute('data-filter');
        document.querySelectorAll('.offre-card').forEach(function (card) {
          var tags = (card.getAttribute('data-tags') || '').split(' ');
          var hidden = f !== 'all' && tags.indexOf(f) === -1;
          card.classList.remove('dimmed');
          if (hidden) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(function () { card.style.display = 'none'; }, 250);
          } else {
            card.style.display = '';
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
              });
            });
          }
        });
      });
    });
  }

  /* ── Contact : toggle Client / Entreprise ── */
  var profileToggle = document.querySelector('.profile-toggle');
  if (profileToggle) {
    var toggleBtns = profileToggle.querySelectorAll('.profile-toggle-btn');
    var rolesClient = document.getElementById('roles-client');
    var rolesEntreprise = document.getElementById('roles-entreprise');

    function switchProfile(profile) {
      profileToggle.setAttribute('data-active', profile);
      toggleBtns.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-profile') === profile);
      });
      if (profile === 'client') {
        rolesClient.hidden = false;
        rolesEntreprise.hidden = true;
        var clientInput = rolesClient.querySelector('input[type="radio"]');
        if (clientInput) { clientInput.checked = true; clientInput.dispatchEvent(new Event('change')); }
      } else {
        rolesClient.hidden = true;
        rolesEntreprise.hidden = false;
        var firstEntreprise = rolesEntreprise.querySelector('input[type="radio"]');
        if (firstEntreprise) { firstEntreprise.checked = true; firstEntreprise.dispatchEvent(new Event('change')); }
      }
    }

    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { switchProfile(btn.getAttribute('data-profile')); });
    });

    /* Pré-sélection via URL ?type=partenaire déjà géré ci-dessous — on expose switchProfile */
    window._komaProfileSwitch = switchProfile;
  }

  /* ── Contact : bascule des sections par profil ── */
  var roleInputs = document.querySelectorAll('input[name="demande_type"]');
  if (roleInputs.length) {
    function showSection(value) {
      document.querySelectorAll('[data-form-section]').forEach(function (sec) {
        sec.hidden = sec.getAttribute('data-form-section') !== value;
      });
    }
    roleInputs.forEach(function (input) {
      input.addEventListener('change', function () { showSection(input.value); });
    });
    var params = new URLSearchParams(location.search);
    if (params.get('type') === 'partenaire') {
      if (window._komaProfileSwitch) window._komaProfileSwitch('entreprise');
      var moex = document.querySelector('input[name="demande_type"][value="moex"]');
      if (moex) { moex.checked = true; showSection('moex'); }
    } else {
      var checked = document.querySelector('input[name="demande_type"]:checked');
      if (checked) showSection(checked.value);
    }
  }

  /* ── Formulaire : feedback de démonstration ── */
  document.querySelectorAll('form[data-koma-form]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var status = form.querySelector('.form-status');
      if (status) {
        status.textContent = '✓ Demande bien reçue — nous revenons vers vous sous 48 h ouvrées.';
        status.classList.add('show');
      }
    });
  });
})();
