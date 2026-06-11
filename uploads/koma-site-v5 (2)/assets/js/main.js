/* ═══════════════════════════════════════════════════════════════
   KOMA EXPERTISE V3 — main.js
   ─ Navigation mobile + dropdown
   ─ Scroll reveal IntersectionObserver
   ─ Active link automatique
   ─ FAQ accordéon
   ─ Sticky CTA mobile (apparaît au scroll)
   ─ Compteur animé
   ─ Formulaire validation + pré-cochage radio pro
   ─ Animation cockpit (alertes pulsantes)
   ─────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ─── Navigation mobile ────────────────────────────────────
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.querySelector('.site-header');

  if (navToggle && header) {
    navToggle.addEventListener('click', () => {
      header.classList.toggle('nav-open');
      const expanded = header.classList.contains('nav-open');
      navToggle.setAttribute('aria-expanded', expanded);
    });
    // Refermer au clic sur un lien
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => header.classList.remove('nav-open'));
    });
    // Refermer si on agrandit la fenêtre
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1100) header.classList.remove('nav-open');
    });
  }

  // ─── Active link selon la page ────────────────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath) a.classList.add('active');
    if (currentPath === '' && href === 'index.html') a.classList.add('active');
  });

  // ─── Scroll reveal ────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  // ─── FAQ accordéon ────────────────────────────────────────
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Optionnel : fermer les autres pour effet "un seul ouvert"
      // document.querySelectorAll('.faq-item.open').forEach(i => {
      //   if (i !== item) i.classList.remove('open');
      // });
      item.classList.toggle('open', !isOpen);
      q.setAttribute('aria-expanded', !isOpen);
    });
  });

  // ─── Sticky CTA mobile (apparaît après 600px de scroll) ──
  const stickyCta = document.querySelector('.sticky-cta-mobile');
  if (stickyCta) {
    const checkScroll = () => {
      const scrolled = window.scrollY > 600;
      // Ne pas afficher si l'utilisateur est sur la page contact
      const onContact = currentPath === 'contact.html';
      if (scrolled && !onContact) stickyCta.classList.add('show');
      else stickyCta.classList.remove('show');
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  // ─── Compteurs animés ─────────────────────────────────────
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        if (isNaN(target)) return;
        const duration = 1400;
        let start = null;
        const step = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          // Easing : easeOutExpo
          const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          el.textContent = Math.floor(ease * target).toLocaleString('fr-FR');
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString('fr-FR');
        };
        requestAnimationFrame(step);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => counterObs.observe(c));
  }

  // ─── Formulaire onboarding multi-acteurs (6 profils) ──────
  const form = document.querySelector('form[data-koma-form]');
  if (form) {
    // Sélectionne TOUTES les sections d'onboarding (.onboarding-section + .form-section legacy)
    const sections = form.querySelectorAll('[data-form-section]');
    const radios = document.querySelectorAll('input[name="demande_type"]');

    // Mapping des champs *intentionnellement* requis par profil
    const REQUIRED_BY_PROFILE = {
      client: ['f-pays-projet', 'f-type-projet', 'f-avancement', 'f-msg-client'],
      amoa: ['f-amoa-entreprise', 'f-amoa-pays', 'f-amoa-specialite', 'f-amoa-msg'],
      moe: ['f-moe-entreprise', 'f-moe-metier', 'f-moe-pays', 'f-moe-msg'],
      moex: ['f-moex-entreprise', 'f-moex-metier', 'f-moex-pays', 'f-moex-msg'],
      supply: ['f-supply-entreprise', 'f-supply-categorie', 'f-supply-pays', 'f-supply-msg'],
      financier: ['f-fin-entreprise', 'f-fin-type', 'f-fin-pays', 'f-fin-msg'],
      // legacy fallback
      partenaire: ['f-entreprise', 'f-metier', 'f-pays-op', 'f-message-pro']
    };

    function updateRequiredFields(profile) {
      // Affiche la section correspondant au profil, cache les autres
      sections.forEach(s => {
        const visible = s.dataset.formSection === profile;
        s.hidden = !visible;
        // Désactive required sur tous les champs cachés (pour ne pas bloquer le submit)
        s.querySelectorAll('input,select,textarea').forEach(el => {
          if (!visible) {
            if (el.required) el.dataset.wasRequired = 'true';
            el.required = false;
          }
        });
      });
      // Active required sur les champs marqués comme tels pour ce profil
      (REQUIRED_BY_PROFILE[profile] || []).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.required = true;
      });
    }

    radios.forEach(r => {
      r.addEventListener('change', () => {
        if (r.checked) updateRequiredFields(r.value);
      });
    });

    // Pré-cochage via URL (?type=client|amoa|moe|moex|supply|financier|partenaire)
    const params = new URLSearchParams(window.location.search);
    const urlType = params.get('type');
    const validProfiles = ['client', 'amoa', 'moe', 'moex', 'supply', 'financier', 'partenaire'];
    if (urlType && validProfiles.includes(urlType)) {
      const targetRadio = document.querySelector(`input[name="demande_type"][value="${urlType}"]`);
      if (targetRadio) {
        targetRadio.checked = true;
        updateRequiredFields(urlType);
        setTimeout(() => {
          targetRadio.closest('.onboarding-selector, .form-card')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        updateRequiredFields('client');
      }
    } else {
      updateRequiredFields('client');
    }

    // Messages de succès personnalisés par profil
    const SUCCESS_MSG = {
      client: '✓ Votre demande a été enregistrée. Un membre de l\'équipe KOMA vous recontacte sous 48 h ouvrées pour un premier diagnostic.',
      amoa: '✓ Votre candidature AMOA a été enregistrée. L\'équipe KOMA vous recontacte sous 48 h ouvrées pour démarrer le processus de qualification.',
      moe: '✓ Votre candidature MOE a été enregistrée. L\'équipe KOMA examine votre profil et revient vers vous sous 48 h ouvrées.',
      moex: '✓ Votre candidature MOEX a été enregistrée. L\'équipe KOMA vous recontacte sous 48 h ouvrées pour le processus de qualification.',
      supply: '✓ Votre candidature fournisseur a été enregistrée. L\'équipe KOMA examine votre catalogue et revient vers vous sous 48 h ouvrées.',
      financier: '✓ Votre proposition de partenariat financier a été enregistrée. L\'équipe KOMA vous recontacte sous 48 h ouvrées.',
      partenaire: '✓ Votre candidature a été enregistrée. L\'équipe KOMA vous recontacte sous 48 h ouvrées pour le processus de qualification.'
    };

    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = form.querySelectorAll('[required]');
      let ok = true;
      required.forEach(el => {
        // Si l'élément est dans une section cachée, on saute (déjà déactivé mais sécurité)
        const section = el.closest('[data-form-section][hidden]');
        if (section) return;
        if (!el.value.trim() && el.type !== 'checkbox') {
          el.style.borderColor = 'var(--danger)';
          ok = false;
        } else if (el.type === 'checkbox' && !el.checked) {
          ok = false;
        } else {
          el.style.borderColor = '';
        }
      });
      if (!ok) {
        if (status) {
          status.textContent = '⚠ Merci de compléter les champs obligatoires et de cocher l\'acceptation des conditions.';
          status.style.color = 'var(--danger)';
        }
        return;
      }
      const checkedProfile = form.querySelector('input[name="demande_type"]:checked')?.value || 'client';
      if (status) {
        status.textContent = SUCCESS_MSG[checkedProfile] || SUCCESS_MSG.client;
        status.style.color = 'var(--success)';
      }
      form.reset();
      const defaultRadio = form.querySelector('input[name="demande_type"][value="client"]');
      if (defaultRadio) {
        defaultRadio.checked = true;
        updateRequiredFields('client');
      }
    });
  }

  // ─── Filtres situation (page Offres) ───────────────────────
  const filterButtons = document.querySelectorAll('.situation-filter');
  const offreCards = document.querySelectorAll('.offre-card');
  if (filterButtons.length && offreCards.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        // Active state
        filterButtons.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        // Apply filter
        offreCards.forEach(card => {
          const tags = (card.dataset.tags || '').split(/\s+/);
          const show = filter === 'all' || tags.includes(filter);
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  // ─── Header shadow au scroll ─────────────────────────────
  if (header) {
    const updateHeaderShadow = () => {
      if (window.scrollY > 12) {
        header.style.boxShadow = '0 4px 12px -8px rgba(0,0,0,.08)';
      } else {
        header.style.boxShadow = 'none';
      }
    };
    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
    updateHeaderShadow();
  }

})();

/* ═══════════════════════════════════════════════════════════════
   V4 — Filtres situation (offres), Parcours tabs, Contact toggle
   ─────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ─── Filtres situation sur la page Offres ────────────────
  const sitButtons = document.querySelectorAll('.situation-filter button');
  const services = document.querySelectorAll('.service-card');
  if (sitButtons.length && services.length) {
    sitButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const sit = btn.dataset.situation;
        sitButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        services.forEach(card => {
          if (sit === 'all') {
            card.classList.remove('hidden');
          } else {
            const tags = (card.dataset.situations || '').split(',');
            card.classList.toggle('hidden', !tags.includes(sit));
          }
        });
      });
    });
  }

  // ─── Onglets parcours par type de projet ─────────────────
  const tabs = document.querySelectorAll('.parcours-tabs button');
  const panels = document.querySelectorAll('.parcours-panel');
  if (tabs.length && panels.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.parcours;
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const targetPanel = document.querySelector(`.parcours-panel[data-panel="${target}"]`);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  // ─── Fin du module formulaire onboarding (géré au-dessus) ──

})();
