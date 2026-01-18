// ===== Full-Viewport Particle Network Background (MANDATORY) =====
(function() {
    'use strict';
    
    let canvas, ctx;
    let particles = [];
    let animationId = null;
    let width = 0, height = 0;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    
    const maxConnectionDistance = 150;
    const particleCount = 100;

    // Particle class
    class Particle {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = 2 + Math.random() * 2; // 2-4px
            this.colorIndex = Math.floor(Math.random() * 3);
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce
            if (this.x < 0 || this.x > width) this.vx *= -0.9;
            if (this.y < 0 || this.y > height) this.vy *= -0.9;
            
            this.x = Math.max(0, Math.min(width, this.x));
            this.y = Math.max(0, Math.min(height, this.y));

            // Mouse attraction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200 && dist > 0) {
                this.vx += (dx / dist) * 0.01;
                this.vy += (dy / dist) * 0.01;
            }
        }

        draw() {
            const colors = ['#00f0ff', '#0066ff', '#b026ff'];
            const color = colors[this.colorIndex];
            
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function init() {
        canvas = document.getElementById('neural-network-bg');
        if (!canvas) {
            setTimeout(init, 100);
            return;
        }

        ctx = canvas.getContext('2d');
        if (!ctx) {
            setTimeout(init, 100);
            return;
        }

        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        canvas.style.backgroundColor = 'transparent';

        // Create particles AFTER width/height are set
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(width, height));
        }
        
        console.log('Particles created:', particles.length, 'Width:', width, 'Height:', height);

        // Mouse tracking
        document.addEventListener('mousemove', function(e) {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        });

        // Start animation
        console.log('Starting animation...');
        animate();
        console.log('Particle network started with', particles.length, 'particles');
    }


    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxConnectionDistance) {
                    const opacity = (1 - dist / maxConnectionDistance) * 0.4;
                    const gradient = ctx.createLinearGradient(
                        particles[i].x, particles[i].y,
                        particles[j].x, particles[j].y
                    );
                    gradient.addColorStop(0, `rgba(0, 240, 255, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(0, 102, 255, ${opacity})`);
                    gradient.addColorStop(1, `rgba(176, 38, 255, ${opacity})`);
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }


    function animate() {
        if (!canvas || !ctx || particles.length === 0) {
            console.error('Animation stopped: canvas, ctx, or particles missing');
            animationId = null;
            return;
        }
        
        // Clear with fade - makes particles visible
        ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
        ctx.fillRect(0, 0, width, height);

        // Mouse interpolation
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        drawConnections();

        // Continue animation
        animationId = requestAnimationFrame(animate);
    }

    // Resize handler
    window.addEventListener('resize', function() {
        if (canvas && ctx) {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles.forEach(p => {
                p.x = Math.min(p.x, width);
                p.y = Math.min(p.y, height);
            });
        }
    });

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Backup init
    window.addEventListener('load', function() {
        if (!animationId) {
            setTimeout(init, 100);
        }
    });
})();

// ===== Avatar Generation with Glasses (MANDATORY) =====
(function() {
    'use strict';
    
    function generateAvatar() {
        const canvas = document.getElementById('avatar-canvas');
        if (!canvas) {
            setTimeout(generateAvatar, 50);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setTimeout(generateAvatar, 50);
            return;
        }
        
        // Set canvas size - ensure it matches container
        const size = 272; // Slightly smaller than ring (280px - 8px padding)
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        canvas.style.display = 'block';
        
        // Hide canvas fallback if image is loaded
        const avatarImage = document.getElementById('avatar-image');
        const canvasFallback = document.getElementById('avatar-canvas');
        const svgFallback = document.getElementById('avatar-svg-fallback');
        
        if (avatarImage && avatarImage.complete && avatarImage.naturalHeight !== 0) {
            // Image is loaded, hide canvas and SVG fallbacks
            if (canvasFallback) canvasFallback.style.display = 'none';
            if (svgFallback) svgFallback.style.display = 'none';
            return; // Don't generate canvas avatar if image exists
        }
        
        // If image fails to load, show canvas fallback
        if (avatarImage) {
            avatarImage.onerror = function() {
                this.style.display = 'none';
                if (canvasFallback) canvasFallback.style.display = 'block';
            };
        }
        
        // Hide SVG fallback if canvas renders
        if (svgFallback) {
            svgFallback.style.display = 'none';
        }
        
        // Clear canvas with soft gradient background
        const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.5);
        bgGradient.addColorStop(0, '#2a2a3a');
        bgGradient.addColorStop(1, '#1a1a2a');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, size, size);
        
        const centerX = size / 2;
        const centerY = size / 2;
        
        // === FACE ===
        // Face base (fair to medium skin tone)
        const faceGradient = ctx.createRadialGradient(
            centerX, centerY - size * 0.1, 0,
            centerX, centerY, size * 0.45
        );
        faceGradient.addColorStop(0, '#f4d4b8');
        faceGradient.addColorStop(0.5, '#e8c5a3');
        faceGradient.addColorStop(1, '#d4b08a');
        ctx.fillStyle = faceGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, size * 0.38, size * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Face highlight (soft)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - size * 0.12, size * 0.32, size * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // === HAIR === (Stylish spiky techie look)
        ctx.fillStyle = '#2a1f1a';
        ctx.beginPath();
        // Top spikes
        ctx.moveTo(centerX - size * 0.25, centerY - size * 0.25);
        ctx.lineTo(centerX - size * 0.15, centerY - size * 0.35);
        ctx.lineTo(centerX - size * 0.05, centerY - size * 0.38);
        ctx.lineTo(centerX + size * 0.05, centerY - size * 0.38);
        ctx.lineTo(centerX + size * 0.15, centerY - size * 0.35);
        ctx.lineTo(centerX + size * 0.25, centerY - size * 0.25);
        // Sides
        ctx.arc(centerX, centerY - size * 0.15, size * 0.35, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        
        // Hair texture (subtle)
        ctx.fillStyle = '#1a1510';
        ctx.beginPath();
        ctx.arc(centerX - size * 0.1, centerY - size * 0.3, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + size * 0.1, centerY - size * 0.3, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // === EYES === (Before glasses)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(centerX - size * 0.14, centerY - size * 0.02, size * 0.06, size * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + size * 0.14, centerY - size * 0.02, size * 0.06, size * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(centerX - size * 0.14, centerY - size * 0.01, size * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + size * 0.14, centerY - size * 0.01, size * 0.03, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX - size * 0.145, centerY - size * 0.025, size * 0.01, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + size * 0.135, centerY - size * 0.025, size * 0.01, 0, Math.PI * 2);
        ctx.fill();
        
        // === GLASSES === (Modern thin frame, slightly rounded rectangular)
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Helper function for rounded rectangle
        function drawRoundedRect(x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }
        
        // Left lens frame (rounded rectangle)
        drawRoundedRect(centerX - size * 0.28, centerY - size * 0.08, size * 0.18, size * 0.16, size * 0.03);
        ctx.stroke();
        
        // Right lens frame
        drawRoundedRect(centerX + size * 0.10, centerY - size * 0.08, size * 0.18, size * 0.16, size * 0.03);
        ctx.stroke();
        
        // Bridge between lenses
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.10, centerY - size * 0.02);
        ctx.lineTo(centerX + size * 0.10, centerY - size * 0.02);
        ctx.stroke();
        
        // Temples (sides)
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.28, centerY);
        ctx.lineTo(centerX - size * 0.35, centerY + size * 0.05);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX + size * 0.28, centerY);
        ctx.lineTo(centerX + size * 0.35, centerY + size * 0.05);
        ctx.stroke();
        
        // === NOSE === (Subtle)
        ctx.strokeStyle = 'rgba(196, 160, 120, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + size * 0.08);
        ctx.quadraticCurveTo(centerX - size * 0.02, centerY + size * 0.15, centerX, centerY + size * 0.18);
        ctx.stroke();
        
        // === MOUTH === (Soft smile)
        ctx.strokeStyle = '#c49a78';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY + size * 0.22, size * 0.08, 0.2, Math.PI - 0.2, false);
        ctx.stroke();
        
        // === CLOTHING === (Casual professional - sweater/shirt)
        // Neck/shoulders
        ctx.fillStyle = '#3a3a4a';
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.25, centerY + size * 0.28);
        ctx.lineTo(centerX - size * 0.18, centerY + size * 0.32);
        ctx.lineTo(centerX + size * 0.18, centerY + size * 0.32);
        ctx.lineTo(centerX + size * 0.25, centerY + size * 0.28);
        ctx.lineTo(centerX + size * 0.30, centerY + size * 0.40);
        ctx.lineTo(centerX - size * 0.30, centerY + size * 0.40);
        ctx.closePath();
        ctx.fill();
        
        // Shirt/sweater body
        ctx.fillStyle = '#4a4a5a';
        ctx.beginPath();
        ctx.rect(centerX - size * 0.30, centerY + size * 0.32, size * 0.60, size * 0.20);
        ctx.fill();
        
        // Collar detail
        ctx.strokeStyle = '#5a5a6a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.15, centerY + size * 0.32);
        ctx.lineTo(centerX, centerY + size * 0.36);
        ctx.lineTo(centerX + size * 0.15, centerY + size * 0.32);
        ctx.stroke();
        
        // Verify avatar was drawn
        const imageData = ctx.getImageData(0, 0, size, size);
        const hasContent = imageData.data.some((val, idx) => idx % 4 !== 3 && val !== 0);
        
        if (!hasContent) {
            // Canvas failed, show SVG fallback
            const fallback = document.getElementById('avatar-svg-fallback');
            if (fallback) {
                canvas.style.display = 'none';
                fallback.style.display = 'block';
            }
        }
    }
    
    // Initialize avatar when DOM is ready - multiple attempts
    function initAvatar() {
        generateAvatar();
        // Backup initialization
        setTimeout(() => {
            const canvas = document.getElementById('avatar-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx && canvas.width === 0) {
                    generateAvatar();
                }
            }
        }, 200);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvatar);
    } else {
        initAvatar();
    }
    
    // Force render on window load as fallback
    window.addEventListener('load', () => {
        const canvas = document.getElementById('avatar-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx && canvas.width === 0) {
                generateAvatar();
            }
        }
    });
})();

// ===== Project Icon Gradient Animation =====
(function() {
    'use strict';
    
    function initIconAnimations() {
        const projectCards = document.querySelectorAll('.project__card');
        
        projectCards.forEach(card => {
            const icon = card.querySelector('.project__icon');
            if (!icon) return;
            
            const svg = icon.querySelector('svg');
            if (!svg) return;
            
            const gradient = svg.querySelector('linearGradient');
            if (!gradient) return;
            
            // Store original gradient coordinates
            const originalX1 = gradient.getAttribute('x1') || '0%';
            const originalY1 = gradient.getAttribute('y1') || '0%';
            const originalX2 = gradient.getAttribute('x2') || '100%';
            const originalY2 = gradient.getAttribute('y2') || '100%';
            
            card.addEventListener('mouseenter', () => {
                // Shift gradient direction slightly
                gradient.setAttribute('x1', '10%');
                gradient.setAttribute('y1', '10%');
                gradient.setAttribute('x2', '90%');
                gradient.setAttribute('y2', '90%');
            });
            
            card.addEventListener('mouseleave', () => {
                // Restore original gradient
                gradient.setAttribute('x1', originalX1);
                gradient.setAttribute('y1', originalY1);
                gradient.setAttribute('x2', originalX2);
                gradient.setAttribute('y2', originalY2);
            });
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIconAnimations);
    } else {
        initIconAnimations();
    }
})();

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        observer.observe(card);
    });
});

// ===== Mobile Menu Toggle =====
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
    const icon = navToggle.querySelector('i');
    if (navMenu.classList.contains('show')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav__link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        const icon = navToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Active Navigation Link on Scroll (Improved) =====
(function() {
    'use strict';
    
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav__link');
    
    // Throttle scroll events for better performance
    let ticking = false;
    
    function updateActiveNav() {
        let current = '';
        const scrollPosition = window.pageYOffset + 120; // Offset for better detection
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            // Check if section is in viewport
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = sectionId;
            }
        });
        
        // Handle home section (at top of page)
        if (window.pageYOffset < 200) {
            current = 'home';
        }
        
        // Update active state
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}` || (current === 'home' && href === '#home')) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial check
    updateActiveNav();
    
    // Update on hash change (when clicking nav links)
    window.addEventListener('hashchange', updateActiveNav);
})();

// ===== Header Scroll Effect =====
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// ===== Contact Form Handling =====
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Create mailto link
    const subject = encodeURIComponent(`Portfolio Contact: ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailtoLink = `mailto:23cseb38.kishore.ts@gmail.com?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    showNotification('Thank you! Your email client should open shortly.');
    
    // Reset form
    contactForm.reset();
});

// ===== Notification Function =====
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.skill__card, .project__card, .experience__card, .education__card, .about__card, .resume__card, .contact__card');
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// ===== Scroll to Top Button (Optional Enhancement) =====
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.className = 'scroll-top';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--accent-color);
    color: white;
    border: none;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 999;
    transition: all 0.3s ease;
    font-size: 1.2rem;
`;

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

scrollTopBtn.addEventListener('mouseenter', () => {
    scrollTopBtn.style.transform = 'translateY(-5px)';
    scrollTopBtn.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
});

scrollTopBtn.addEventListener('mouseleave', () => {
    scrollTopBtn.style.transform = 'translateY(0)';
    scrollTopBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
});

document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'flex';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

