/* ===================================================
   SOFTPRESS G9 – Main JavaScript
   =================================================== */

/* ---------- Tema dark/light ---------- */
const html        = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  localStorage.setItem('sg9-theme', theme);
}

// Carrega preferência salva ou do sistema
const saved = localStorage.getItem('sg9-theme')
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(saved);

themeToggle.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ---------- Navbar: sombra + link ativo ---------- */
const header   = document.getElementById('header');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

/* Cache das posições — lê o DOM uma única vez, não a cada scroll */
let sectionTops = [];
function cacheSectionTops() {
  sectionTops = [...sections].map(s => ({ id: s.id, top: s.offsetTop }));
}
cacheSectionTops();
window.addEventListener('resize', cacheSectionTops, { passive: true });

window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 40 ? '0 2px 18px rgba(0,0,0,0.55)' : '';

  let current = '';
  const scrollY = window.scrollY;
  sectionTops.forEach(({ id, top }) => {
    if (scrollY >= top - 100) current = id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}, { passive: true });

/* ---------- Menu mobile ---------- */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});
navLinks.forEach(link => link.addEventListener('click', () => {
  hamburger.classList.remove('open');
  navMenu.classList.remove('open');
}));

/* ---------- Smooth scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---------- Fade-in on scroll ---------- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ---------- Formulário → Web3Forms ---------- */
const form       = document.getElementById('contact-form');
const feedback   = document.getElementById('form-feedback');
const submitBtn  = document.getElementById('submit-btn');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const data     = Object.fromEntries(new FormData(form));
    const required = ['nome', 'email', 'assunto', 'mensagem'];
    const missing  = required.some(k => !data[k]?.trim());

    if (missing) {
      showFeedback('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = 'ENVIANDO...';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.success) {
        showFeedback('Mensagem enviada com sucesso! Em breve entraremos em contato.', 'success');
        form.reset();
      } else {
        throw new Error(json.message || 'Erro ao enviar');
      }
    } catch (err) {
      showFeedback('Ocorreu um erro ao enviar. Tente novamente ou ligue para (11) 5563-7999.', 'error');
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'ENVIAR';
    }
  });
}

function showFeedback(msg, type) {
  feedback.textContent = msg;
  feedback.className   = 'form-feedback ' + type;
  feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
