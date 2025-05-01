// Main JavaScript for Samuel Hernandez Portfolio

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize loading screen
    setTimeout(function() {
        document.querySelector('.loading-overlay').classList.add('hidden');
        
        // Start typing effect after loading is complete
        setTimeout(function() {
            const typingElement = document.getElementById('typing-title');
            if (typingElement) {
                typingElement.classList.add('start-typing');
            }
        }, 500); // Small delay after loading screen fades out
    }, 1500);

    // Navigation variables
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('header');
    const backToTop = document.querySelector('.back-to-top');
    const themeSwitch = document.querySelector('.theme-switch');
    const themeSwitchIcon = document.querySelector('.theme-switch i');
    const animatedElements = document.querySelectorAll('.animate');
    const progressBars = document.querySelectorAll('.progress');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Scroll event listener for various effects
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // Header shadow on scroll
        if (scrollPosition > 50) {
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
            backToTop.classList.add('visible');
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            backToTop.classList.remove('visible');
        }
        
        // Animate elements when they come into view
        animateOnScroll();
        
        // Update active nav link based on scroll position
        updateActiveNavLink();
    });

    // Theme switcher
    themeSwitch.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            themeSwitchIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            themeSwitchIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeSwitchIcon.className = 'fas fa-sun';
    }

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission (would be replaced with actual API call)
            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(function() {
                const inputs = contactForm.querySelectorAll('.form-control');
                inputs.forEach(input => input.value = '');
                
                submitBtn.textContent = 'Message Sent!';
                
                setTimeout(function() {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }, 1500);
        });
    }

    // Back to top button
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Function to animate elements on scroll
    function animateOnScroll() {
        animatedElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animated');
                
                // Animate progress bars if they're in view
                if (element.closest('.skill-category')) {
                    const progressBars = element.querySelectorAll('.progress');
                    progressBars.forEach(bar => {
                        const width = bar.getAttribute('data-width');
                        bar.style.width = width;
                    });
                }
            }
        });
    }

    // Function to update active nav link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 100)) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
            
            // Home link special case
            if (currentSection === '' && link.getAttribute('href') === '#') {
                link.classList.add('active');
            }
        });
    }

    // Initialize animations
    animateOnScroll();
    
    // Initialize progress bars for visible elements
    document.querySelectorAll('.skill-category.animated .progress').forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width;
    });
});