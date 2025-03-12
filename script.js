// Initialize neural network background on load
document.addEventListener('DOMContentLoaded', function() {
    // Create neural network background
    createNeuralBackground();
    
    // Create neural network logo
    createLogoNetwork();
    
    // Create particles for hero section
    createParticles();
    
    // Create community circles
    createCommunityCircles();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize scroll to top button
    initScrollToTop();
    
    // Mobile menu toggle
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        document.querySelector('.nav-links').classList.toggle('active');
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        header.classList.toggle('scrolled', window.scrollY > 10);
    });
    
    // Coming Soon für Download Wallet Button
    const downloadButtons = document.querySelectorAll('a.btn:not(.btn-outline)');
    
    downloadButtons.forEach(button => {
        const originalText = button.textContent;
        
        // Hover-Effekt
        button.addEventListener('mouseenter', function() {
            button.textContent = 'Coming Soon';
        });
        
        button.addEventListener('mouseleave', function() {
            button.textContent = originalText;
        });
        
        // Klick-Effekt
        button.addEventListener('click', function(e) {
            e.preventDefault();
            button.textContent = 'Coming Soon';
            
            // Nach 2 Sekunden zurücksetzen
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        });
    });
});

// Create neural network background
function createNeuralBackground() {
    const neuralBg = document.getElementById('neural-bg');
    if (!neuralBg) return;
    
    const nodes = 40; // Number of nodes
    const nodeElements = [];
    const connectionElements = [];
    
    // Create nodes
    for (let i = 0; i < nodes; i++) {
        const node = document.createElement('div');
        node.className = 'node';
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        node.dataset.x = Math.random() * 100;
        node.dataset.y = Math.random() * 100;
        node.dataset.speedX = (Math.random() - 0.5) * 0.1;
        node.dataset.speedY = (Math.random() - 0.5) * 0.1;
        neuralBg.appendChild(node);
        nodeElements.push(node);
    }
    
    // Create connections between nodes
    for (let i = 0; i < nodes; i++) {
        for (let j = i + 1; j < nodes; j++) {
            if (Math.random() > 0.85) { // 15% chance to create a connection
                const connection = document.createElement('div');
                connection.className = 'connection';
                neuralBg.appendChild(connection);
                connection.dataset.from = i;
                connection.dataset.to = j;
                connectionElements.push(connection);
            }
        }
    }
    
    // Animate nodes and connections
    function animateNetwork() {
        // Update node positions
        nodeElements.forEach((node, index) => {
            let x = parseFloat(node.dataset.x);
            let y = parseFloat(node.dataset.y);
            let speedX = parseFloat(node.dataset.speedX);
            let speedY = parseFloat(node.dataset.speedY);
            
            // Update position
            x += speedX;
            y += speedY;
            
            // Boundary check
            if (x < 0 || x > 100) {
                speedX *= -1;
            }
            if (y < 0 || y > 100) {
                speedY *= -1;
            }
            
            // Save updated values
            node.dataset.x = x;
            node.dataset.y = y;
            node.dataset.speedX = speedX;
            node.dataset.speedY = speedY;
            
            // Apply position
            node.style.left = `${x}%`;
            node.style.top = `${y}%`;
        });
        
        // Update connections
        connectionElements.forEach(connection => {
            const fromNode = nodeElements[connection.dataset.from];
            const toNode = nodeElements[connection.dataset.to];
            
            const fromX = parseFloat(fromNode.dataset.x);
            const fromY = parseFloat(fromNode.dataset.y);
            const toX = parseFloat(toNode.dataset.x);
            const toY = parseFloat(toNode.dataset.y);
            
            // Calculate distance
            const dx = toX - fromX;
            const dy = toY - fromY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only show connections within a certain distance
            if (distance < 25) { // Visible threshold
                connection.style.opacity = 1 - (distance / 25);
                
                // Calculate connection position and length
                connection.style.width = `${distance}%`;
                connection.style.left = `${fromX}%`;
                connection.style.top = `${fromY}%`;
                
                // Calculate angle
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                connection.style.transform = `rotate(${angle}deg)`;
            } else {
                connection.style.opacity = 0;
            }
        });
        
        requestAnimationFrame(animateNetwork);
    }
    
    animateNetwork();

    // Create feature neural background
    const featureNeural = document.getElementById('feature-neural-bg');
    if (featureNeural) {
        // Clone the neural bg and adjust for features section
        featureNeural.innerHTML = neuralBg.innerHTML;
    }
}

// Create neural network logo
function createLogoNetwork() {
    const logoNeural = document.querySelector('.logo-neural');
    if (!logoNeural) return;
    
    const nodes = 7; // Number of nodes in logo
    const nodeElements = [];
    const connectionElements = [];
    
    // Create nodes in a circle around the phi symbol
    for (let i = 0; i < nodes; i++) {
        const node = document.createElement('div');
        node.className = 'logo-node';
        const angle = (i / nodes) * Math.PI * 2;
        const radius = 15; // Radius of the circle
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        node.style.left = `${x}%`;
        node.style.top = `${y}%`;
        logoNeural.appendChild(node);
        nodeElements.push(node);
    }
    
    // Create connections between nodes
    for (let i = 0; i < nodes; i++) {
        for (let j = (i + 1) % nodes; j < nodes; j++) {
            if (Math.random() > 0.5) { // 50% chance to create a connection
                const connection = document.createElement('div');
                connection.className = 'logo-connection';
                logoNeural.appendChild(connection);
                
                // Get positions
                const node1 = nodeElements[i];
                const node2 = nodeElements[j];
                const x1 = parseFloat(node1.style.left);
                const y1 = parseFloat(node1.style.top);
                const x2 = parseFloat(node2.style.left);
                const y2 = parseFloat(node2.style.top);
                
                // Calculate distance
                const dx = x2 - x1;
                const dy = y2 - y1;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Set connection position and length
                connection.style.width = `${distance}%`;
                connection.style.left = `${x1}%`;
                connection.style.top = `${y1}%`;
                
                // Calculate angle
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                connection.style.transform = `rotate(${angle}deg)`;
            }
        }
    }
}

// Create particles for hero section
function createParticles() {
    const particles = document.getElementById('particles');
    if (!particles) return;
    
    const count = 50; // Number of particles
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 2px and 8px
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        
        particles.appendChild(particle);
    }
}

// Create community circles
function createCommunityCircles() {
    const communityCircles = document.getElementById('community-circles');
    if (!communityCircles) return;
    
    const count = 12; // Number of circles
    
    for (let i = 0; i < count; i++) {
        const circle = document.createElement('div');
        circle.className = 'community-circle';
        
        // Random size between 100px and 300px
        const size = Math.random() * 200 + 100;
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;
        
        // Random position
        circle.style.left = `${Math.random() * 100}%`;
        circle.style.top = `${Math.random() * 100}%`;
        
        // Random animation
        circle.style.animation = `float ${Math.random() * 10 + 10}s infinite ease-in-out`;
        circle.style.animationDelay = `${Math.random() * 5}s`;
        
        communityCircles.appendChild(circle);
    }
}

// Initialize scroll animations
function initScrollAnimations() {
    const animationElements = [
        ...document.querySelectorAll('.feature-card'),
        ...document.querySelectorAll('.tokenomics-text'),
        ...document.querySelectorAll('.tokenomics-chart'),
        ...document.querySelectorAll('.counter-item'),
        ...document.querySelectorAll('.timeline-item'),
        ...document.querySelectorAll('.social-link')
    ];
    
    const animateOnScroll = () => {
        const windowHeight = window.innerHeight;
        
        animationElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementPosition < windowHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    };
    
    // Initial check
    animateOnScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', animateOnScroll);
}

// Initialize scroll to top button
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scroll-top');
    if (!scrollTopBtn) return;
    
    // Show button when scrolling down
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('active');
        } else {
            scrollTopBtn.classList.remove('active');
        }
    });
    
    // Scroll to top on click
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
