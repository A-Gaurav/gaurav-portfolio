/* assets/main.js
   Shared behaviours: theme, nav active state, lightbox, blog modal, form validation
*/
(() => {
  const root = document.documentElement;
  const themeKey = 'gaurav-theme-v1';

  // Theme init + toggle
  const themeToggleButtons = document.querySelectorAll('[data-theme-toggle]');
  const stored = localStorage.getItem(themeKey);
  if(stored === 'light') root.classList.add('light-theme');
  else root.classList.remove('light-theme');
  function applyTheme(name){
    if(name === 'light') root.classList.add('light-theme');
    else root.classList.remove('light-theme');
    themeToggleButtons.forEach(btn => {
      btn.setAttribute('aria-pressed', String(name === 'light'));
      btn.textContent = name === 'light' ? '☀️' : '🌙';
    });
  }
  applyTheme(stored === 'light' ? 'light' : 'dark');

  themeToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = root.classList.toggle('light-theme');
      const name = isLight ? 'light' : 'dark';
      localStorage.setItem(themeKey, name);
      applyTheme(name);
    });
  });

  // set active nav link based on filename
  (function setActiveNav(){
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(a => {
      const href = a.getAttribute('href');
      if(!href) return;
      // treat index.html and '' as same
      const cleanHref = href.split('/').pop();
      if(cleanHref === path || (cleanHref === 'index.html' && path === '')) a.classList.add('active');
    });
  })();

  // Smooth internal link scrolling (respect reduced motion)
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const tgt = document.querySelector(a.getAttribute('href'));
        if(tgt){ e.preventDefault(); tgt.scrollIntoView({behavior:'smooth', block:'start'}); }
      });
    });
  }

  // Lightbox (shared)
  const lightbox = document.getElementById('lightbox');
  const lbContent = document.getElementById('lb-content');
  const lbClose = document.getElementById('lb-close');
  if(lightbox && lbContent && lbClose){
    document.querySelectorAll('.tile[data-img]').forEach(tile => {
      tile.addEventListener('click', () => openLightbox(tile.dataset.title || '', tile.dataset.img));
      tile.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') openLightbox(tile.dataset.title || '', tile.dataset.img); });
    });
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeLightbox(); });
  }
  function openLightbox(title, src){
    lbContent.innerHTML = '';
    if(!src){
      lbContent.innerHTML = `<div style="padding:24px;"><strong>${title}</strong></div>`;
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = title || 'Preview';
      lbContent.appendChild(img);
    }
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    lbClose.focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
  }

  // Blog modal (Read more)
  const blogModal = document.getElementById('blog-modal');
  const blogFrame = document.getElementById('blog-frame');
  const blogClose = document.getElementById('blog-close');
  if(blogModal && blogFrame && blogClose){
    document.querySelectorAll('[data-post]').forEach(btn => {
      btn.addEventListener('click', () => {
        // find containing .post element
        const post = btn.closest('.post');
        const title = post.querySelector('h3')?.innerText || 'Post';
        const full = post.querySelector('.excerpt-full')?.innerHTML || '<p>Content unavailable.</p>';
        blogFrame.innerHTML = `<h2 style="margin-top:0">${title}</h2>${full}`;
        blogModal.classList.add('open');
        blogModal.setAttribute('aria-hidden','false');
        blogClose.focus();
      });
    });
    blogClose.addEventListener('click', closeBlogModal);
    blogModal.addEventListener('click', e => { if(e.target === blogModal) closeBlogModal(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeBlogModal(); });
  }
  function closeBlogModal(){
    blogModal.classList.remove('open');
    blogModal.setAttribute('aria-hidden','true');
  }

  // Contact form(s) validation (client-only demo)
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    const status = form.querySelector('[data-form-status]') || form.querySelector('.form-status');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if(status) status.textContent = '';
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const msg = (fd.get('message') || '').toString().trim();
      if(!name){ if(status) status.textContent = 'Please enter your name.'; return; }
      if(!validateEmail(email)){ if(status) status.textContent = 'Please enter a valid email.'; return; }
      if(!msg){ if(status) status.textContent = 'Please include a message.'; return; }
      if(status) status.textContent = 'Sending…';
      setTimeout(() => {
        if(status) status.textContent = 'Thanks — your message was sent (demo).';
        form.reset();
      }, 700);
    });
  });

  function validateEmail(e){
    if(!e) return false;
    const at = e.indexOf('@');
    if(at <= 0) return false;
    const domain = e.slice(at+1);
    if(domain.indexOf('.') === -1) return false;
    if(e.length < 5) return false;
    return true;
  }

  // Accessibility: show focus outlines only when keyboard used
  (function(){
    function handleFirstTab(e){
      if(e.key === 'Tab'){
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
      }
    }
    window.addEventListener('keydown', handleFirstTab);
  })();

})();