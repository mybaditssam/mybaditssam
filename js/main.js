// Main JavaScript for Samuel Hernandez Portfolio

document.addEventListener('DOMContentLoaded', function() {
    // Loading overlay + typing
    setTimeout(function() {
      const overlay = document.querySelector('.loading-overlay');
      if (overlay) overlay.classList.add('hidden');
  
      setTimeout(function() {
        const typingElement = document.getElementById('typing-title');
        if (typingElement) typingElement.classList.add('start-typing');
      }, 500);
    }, 1500);
  
    // Navigation variables
    const hamburger   = document.querySelector('.hamburger');
    const navMenu     = document.querySelector('.nav-menu');
    const navLinks    = document.querySelectorAll('.nav-link');
    const header      = document.querySelector('header');
    const backToTop   = document.querySelector('.back-to-top');
    const themeSwitch = document.querySelector('.theme-switch');
    const themeIcon   = themeSwitch ? themeSwitch.querySelector('i') : null;
    const animatedEls = document.querySelectorAll('.animate');
  
    // Mobile menu toggle
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
      });
    }
  
    // Close mobile menu on link click + set active
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (hamburger && navMenu) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        }
        navLinks.forEach(n => n.classList.remove('active'));
        this.classList.add('active');
      });
    });
  
    // Scroll effects
    window.addEventListener('scroll', function() {
      const y = window.scrollY;
  
      // Header shadow & back-to-top
      if (header) {
        header.style.boxShadow = y > 50
          ? '0 5px 20px rgba(0, 0, 0, 0.1)'
          : '0 2px 10px rgba(0, 0, 0, 0.1)';
      }
      if (backToTop) {
        backToTop.classList.toggle('visible', y > 50);
      }
  
      // Animations & active nav
      animateOnScroll();
      updateActiveNavLink();
    });
  
    // Theme switcher
    if (themeSwitch) {
      themeSwitch.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        if (themeIcon) themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      });
    }
  
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      if (themeIcon) themeIcon.className = 'fas fa-sun';
    }
  
    // Contact form (demo)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('.btn-submit');
        if (!submitBtn) return;
  
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
  
        setTimeout(() => {
          this.querySelectorAll('.form-control').forEach(inp => inp.value = '');
          submitBtn.textContent = 'Message Sent!';
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }, 2000);
        }, 1500);
      });
    }
  
    // Back to top
    if (backToTop) {
      backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  
    // --- Helpers ---
  
    // Map tiers → widths (for animating bars)
    const LEVEL_WIDTH = {
      working:    '60%',
      proficient: '80%',
      advanced:   '95%'
    };
  
    function animateOnScroll() {
      animatedEls.forEach(el => {
        const rectTop = el.getBoundingClientRect().top;
        const winH = window.innerHeight;
  
        if (rectTop < winH - 50) {
          el.classList.add('animated');
  
          // Animate any progress bars within this element
          el.querySelectorAll('.progress').forEach(bar => {
            const level = bar.getAttribute('data-level');   // working|proficient|advanced
            const pct   = bar.getAttribute('data-width');   // e.g., "85%"
            const width = level ? LEVEL_WIDTH[level.toLowerCase()] : pct;
  
            if (width) {
              // Trigger CSS transition by setting width next frame
              requestAnimationFrame(() => { bar.style.width = width; });
            }
          });
        }
      });
    }
  
    function updateActiveNavLink() {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
  
      sections.forEach(sec => {
        const top = sec.offsetTop;
        if (window.scrollY >= top - 100) current = sec.id;
      });
  
      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === '#' + current || (current === '' && href === '#')) {
          link.classList.add('active');
        }
      });
    }
  
    // Init
    animateOnScroll();
  
    // Initialize progress bars already in view on load
    document.querySelectorAll('.skill-category.animated .progress').forEach(bar => {
      const level = bar.getAttribute('data-level');
      const pct   = bar.getAttribute('data-width');
      const width = level ? LEVEL_WIDTH[level.toLowerCase()] : pct;
      if (width) bar.style.width = width;
    });
  });
  