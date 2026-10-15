// ABACUS AI — shared front-end behaviors (static prototype, no backend)
document.addEventListener('DOMContentLoaded', function () {

  // ---------- Sidebar toggle (mobile) ----------
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');
  document.querySelectorAll('[data-toggle="sidebar"]').forEach(btn => {
    btn.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      backdrop?.classList.toggle('show');
    });
  });
  backdrop?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    backdrop.classList.remove('show');
  });

  // ---------- Upload drop preview ----------
  document.querySelectorAll('.upload-drop').forEach(drop => {
    const input = drop.querySelector('input[type="file"]');
    if (!input) return;
    drop.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      if (input.files && input.files[0]) {
        const nameEl = drop.querySelector('.file-name');
        const icon = drop.querySelector('i');
        if (nameEl) nameEl.textContent = input.files[0].name;
        drop.classList.add('selected');
        if (icon) { icon.classList.remove('bi-cloud-arrow-up'); icon.classList.add('bi-check-circle-fill'); icon.style.color = '#4ade8e'; }
      }
    });
    ['dragover','dragleave','drop'].forEach(evt => {
      drop.addEventListener(evt, e => e.preventDefault());
    });
    drop.addEventListener('drop', e => {
      if (e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  });

  // ---------- Chip choice selection (single or multi) ----------
  document.querySelectorAll('.chip-choice').forEach(chip => {
    chip.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const input = chip.querySelector('input');
      if (!input) return;
      if (input.type === 'radio') {
        document.querySelectorAll(`input[name="${input.name}"]`).forEach(i => {
          i.closest('.chip-choice')?.classList.remove('selected');
        });
        input.checked = true;
        chip.classList.add('selected');
      } else {
        input.checked = !input.checked;
        chip.classList.toggle('selected', input.checked);
      }
    });
  });

  // ---------- Copy-to-clipboard for referral links ----------
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard?.writeText(text).catch(()=>{});
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check2"></i> Copied';
      setTimeout(() => btn.innerHTML = original, 1600);
    });
  });

  // ---------- Range slider live label (blended question source) ----------
  document.querySelectorAll('input[type="range"][data-live-label]').forEach(range => {
    const out = document.querySelector(range.getAttribute('data-live-label'));
    const update = () => {
      if (out) out.textContent = range.value + '%';
    };
    range.addEventListener('input', update);
    update();
  });

  // ---------- Select-all checkbox for tables ----------
  document.querySelectorAll('[data-select-all]').forEach(master => {
    const scope = document.querySelector(master.getAttribute('data-select-all'));
    master.addEventListener('change', () => {
      scope?.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = master.checked);
    });
  });

  // ---------- Simple onboarding stepper (data-step-form) ----------
  document.querySelectorAll('[data-step-form]').forEach(form => {
    const panes = Array.from(form.querySelectorAll('.step-pane'));
    const items = Array.from(form.querySelectorAll('.step-item'));
    let current = 0;

    function render() {
      panes.forEach((p, i) => p.classList.toggle('d-none', i !== current));
      items.forEach((it, i) => {
        it.classList.toggle('done', i < current);
        it.classList.toggle('active', i === current);
      });
      form.querySelectorAll('[data-step-prev]').forEach(b => b.style.visibility = current === 0 ? 'hidden' : 'visible');
      form.querySelectorAll('[data-step-next]').forEach(b => {
        b.textContent = current === panes.length - 1 ? (b.dataset.finalLabel || 'Submit') : (b.dataset.nextLabel || 'Continue');
      });
      const bar = form.querySelector('.progress-slim .bar');
      if (bar) bar.style.width = ((current) / (panes.length - 1) * 100) + '%';
    }

    form.querySelectorAll('[data-step-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (current < panes.length - 1) { current++; render(); window.scrollTo({top:0, behavior:'smooth'}); }
        else if (form.dataset.completeRedirect) { window.location.href = form.dataset.completeRedirect; }
      });
    });
    form.querySelectorAll('[data-step-prev]').forEach(btn => {
      btn.addEventListener('click', () => { if (current > 0) { current--; render(); } });
    });
    items.forEach((it, i) => {
      it.addEventListener('click', () => { if (i <= current) { current = i; render(); } });
    });
    render();
  });

  // ---------- Interview: camera / identity check simulation ----------
  const camBtn = document.querySelector('[data-sim-camera]');
  if (camBtn) {
    camBtn.addEventListener('click', () => {
      const frame = document.querySelector('.camera-frame');
      const status = document.querySelector('[data-camera-status]');
      camBtn.disabled = true;
      camBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Verifying identity…';
      frame?.classList.add('scanning');
      setTimeout(() => {
        if (status) {
          status.innerHTML = '<i class="bi bi-patch-check-fill text-success me-2"></i>Identity matched — 98.4% confidence';
        }
        camBtn.innerHTML = '<i class="bi bi-arrow-right-circle me-2"></i> Enter Interview Room';
        camBtn.disabled = false;
        camBtn.setAttribute('href', camBtn.dataset.simCamera);
        camBtn.classList.add('btn-gold');
      }, 1800);
    });
  }

  // ---------- Interview: mock recording timer ----------
  const timerEl = document.querySelector('[data-rec-timer]');
  if (timerEl) {
    let secs = 0;
    setInterval(() => {
      secs++;
      const m = String(Math.floor(secs/60)).padStart(2,'0');
      const s = String(secs%60).padStart(2,'0');
      timerEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  // ---------- Interview questions progress ----------
  const qNext = document.querySelector('[data-next-question]');
  if (qNext) {
    const total = parseInt(qNext.dataset.total || '8', 10);
    let idx = parseInt(qNext.dataset.current || '1', 10);
    qNext.addEventListener('click', () => {
      idx = Math.min(idx + 1, total);
      const bar = document.querySelector('.progress-slim .bar');
      if (bar) bar.style.width = (idx/total*100) + '%';
      const label = document.querySelector('[data-question-count]');
      if (label) label.textContent = `Question ${idx} of ${total}`;
      if (idx === total) {
        qNext.textContent = 'Finish Interview';
        qNext.href = 'interview-complete.html';
      }
    });
  }

  // ---------- Tooltips ----------
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    if (window.bootstrap) new bootstrap.Tooltip(el);
  });

  // ---------- Auth role toggle ----------
  document.querySelectorAll('.role-toggle').forEach(toggle => {
    toggle.querySelectorAll('.rtab').forEach(tab => {
      tab.addEventListener('click', () => {
        toggle.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.target;
        document.querySelectorAll('.role-panel').forEach(p => p.classList.add('d-none'));
        if (target) document.querySelector(target)?.classList.remove('d-none');
      });
    });
  });

});
