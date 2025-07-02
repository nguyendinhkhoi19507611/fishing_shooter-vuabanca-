class FishingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Game state
        this.gameState = {
            coins: 1000,
            score: 0,
            bullets: [],
            fish: [],
            particles: [],
            bubbles: []
        };

        // Weapon configuration
        this.weapon = {
            name: 'Cannon',
            cost: 25,
            damage: 60,
            speed: 10,
            size: 8
        };

        // Cannon animation
        this.cannon = {
            currentFrame: 0,
            totalFrames: 5,
            frameHeight: 0, // Will be calculated when image loads
            animationSpeed: 8, // frames per animation frame
            animationCounter: 0,
            isAnimating: false,
            animationDuration: 40 // total animation frames
        };

        // Fish types
        this.fishTypes = [
            { size: 25, speed: 1.2, hp: 40, reward: 30, color: '#FF6B6B', emoji: '🐠' },
            { size: 35, speed: 0.9, hp: 80, reward: 60, color: '#4ECDC4', emoji: '🐟' },
            { size: 30, speed: 1.0, hp: 60, reward: 45, color: '#45B7D1', emoji: '🐡' },
            { size: 45, speed: 0.7, hp: 120, reward: 100, color: '#96CEB4', emoji: '🐠' },
            { size: 65, speed: 0.5, hp: 250, reward: 250, color: '#FFEAA7', emoji: '🦈' }
        ];

        // Game variables
        this.mouse = { x: 0, y: 0 };
        this.lastSpawnTime = 0;
        this.lastBubbleTime = 0;

        // Load images
        this.images = {};
        this.loadImages();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    loadImages() {
        this.images.cannon = new Image();
        this.images.cannon.src = 'images/cannon7.png';
        
        this.images.bullet = new Image();
        this.images.bullet.src = 'images/bullet7.png';

        this.images.background = new Image();
        this.images.background.src = 'images/background.png';

        this.imagesLoaded = 0;
        this.totalImages = 3; // Updated to 3 images
        
        this.images.cannon.onload = () => {
            // Calculate frame height for sprite sheet (5 frames vertically)
            this.cannon.frameHeight = this.images.cannon.height / this.cannon.totalFrames;
            this.imagesLoaded++;
            if (this.imagesLoaded === this.totalImages) {
                this.init();
            }
        };
        
        this.images.bullet.onload = () => {
            this.imagesLoaded++;
            if (this.imagesLoaded === this.totalImages) {
                this.init();
            }
        };

        this.images.background.onload = () => {
            this.imagesLoaded++;
            if (this.imagesLoaded === this.totalImages) {
                this.init();
            }
        };

        // Handle image load errors
        this.images.cannon.onerror = () => {
            console.warn('Failed to load cannon image, using fallback');
            this.cannon.frameHeight = 40; // fallback frame height
            this.imagesLoaded++;
            if (this.imagesLoaded === this.totalImages) {
                this.init();
            }
        };

        this.images.bullet.onerror = () => {
            console.warn('Failed to load bullet image, using fallback');
            this.imagesLoaded++;
            if (this.imagesLoaded === this.totalImages) {
                this.init();
            }
        };

        this.images.background.onerror = () => {
            console.warn('Failed to load background image, using fallback');
            this.imagesLoaded++;
            if (this.imagesLoaded === this.totalImages) {
                this.init();
            }
        };
    }

    init() {
        this.setupEventListeners();
        this.spawnInitialFish();
        this.gameLoop();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('click', (e) => {
            this.shoot(e);
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
            
            const touchEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            this.shoot(touchEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
        });
    }

    shoot(e) {
        if (this.gameState.coins < this.weapon.cost) {
            this.showNotification('Không đủ coin!', '#FF4444');
            return;
        }

        this.gameState.coins -= this.weapon.cost;

        const rect = this.canvas.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;

        const startX = this.canvas.width / 2;
        const startY = this.canvas.height - 50;

        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const bullet = {
            x: startX,
            y: startY,
            vx: (dx / distance) * this.weapon.speed,
            vy: (dy / distance) * this.weapon.speed,
            damage: this.weapon.damage,
            size: this.weapon.size,
            life: 100,
            angle: angle + Math.PI / 2 // Adjust bullet rotation (add 90 degrees)
        };

        this.gameState.bullets.push(bullet);
        
        // Start cannon animation
        this.startCannonAnimation();
        
        this.updateUI();
    }

    startCannonAnimation() {
        this.cannon.isAnimating = true;
        this.cannon.currentFrame = 0;
        this.cannon.animationCounter = 0;
    }

    updateCannonAnimation() {
        if (this.cannon.isAnimating) {
            this.cannon.animationCounter++;
            
            if (this.cannon.animationCounter >= this.cannon.animationSpeed) {
                this.cannon.currentFrame++;
                this.cannon.animationCounter = 0;
                
                if (this.cannon.currentFrame >= this.cannon.totalFrames) {
                    this.cannon.currentFrame = this.cannon.totalFrames - 1;
                    this.cannon.isAnimating = false;
                }
            }
        } else {
            // Return to idle state (frame 0)
            if (this.cannon.currentFrame > 0) {
                this.cannon.animationCounter++;
                if (this.cannon.animationCounter >= this.cannon.animationSpeed * 2) {
                    this.cannon.currentFrame--;
                    this.cannon.animationCounter = 0;
                }
            }
        }
    }

    spawnInitialFish() {
        for (let i = 0; i < 8; i++) {
            this.spawnFish();
        }
    }

    spawnFish() {
        const fishType = this.fishTypes[Math.floor(Math.random() * this.fishTypes.length)];
        const side = Math.random() < 0.5 ? 'left' : 'right';
        
        const fish = {
            ...fishType,
            x: side === 'left' ? -fishType.size : this.canvas.width + fishType.size,
            y: Math.random() * (this.canvas.height - 200) + 50,
            vx: side === 'left' ? fishType.speed : -fishType.speed,
            vy: (Math.random() - 0.5) * 0.5,
            angle: 0,
            currentHp: fishType.hp,
            id: Date.now() + Math.random()
        };

        this.gameState.fish.push(fish);
    }

    updateBullets() {
        this.gameState.bullets = this.gameState.bullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life--;

            return bullet.life > 0 && 
                   bullet.x > -50 && bullet.x < this.canvas.width + 50 &&
                   bullet.y > -50 && bullet.y < this.canvas.height + 50;
        });
    }

    updateFish() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastSpawnTime > 3000) {
            this.spawnFish();
            this.lastSpawnTime = currentTime;
        }

        this.gameState.fish = this.gameState.fish.filter(fish => {
            fish.x += fish.vx;
            fish.y += fish.vy;
            fish.angle += 0.02;

            if (Math.abs(fish.vy) < 0.1) {
                fish.vy += (Math.random() - 0.5) * 0.1;
            }

            if (fish.y < 50) fish.vy = Math.abs(fish.vy);
            if (fish.y > this.canvas.height - 150) fish.vy = -Math.abs(fish.vy);

            return fish.x > -fish.size - 100 && fish.x < this.canvas.width + fish.size + 100 &&
                   fish.currentHp > 0;
        });
    }

    checkCollisions() {
        for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
            const bullet = this.gameState.bullets[i];
            
            for (let j = this.gameState.fish.length - 1; j >= 0; j--) {
                const fish = this.gameState.fish[j];
                
                const dx = bullet.x - fish.x;
                const dy = bullet.y - fish.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < fish.size + bullet.size) {
                    fish.currentHp -= bullet.damage;
                    
                    this.createParticles(bullet.x, bullet.y, '#FFD700');
                    this.gameState.bullets.splice(i, 1);

                    if (fish.currentHp <= 0) {
                        this.gameState.coins += fish.reward;
                        this.gameState.score += fish.reward;
                        this.createParticles(fish.x, fish.y, fish.color, 15);
                        this.gameState.fish.splice(j, 1);
                        this.showNotification(`+${fish.reward} coin!`, '#00FF00');
                    }
                    break;
                }
            }
        }
    }

    createParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            this.gameState.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: color,
                life: 30,
                size: Math.random() * 4 + 2
            });
        }
    }

    updateParticles() {
        this.gameState.particles = this.gameState.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2;
            particle.life--;
            particle.size *= 0.98;
            
            return particle.life > 0;
        });
    }

    createBubbles() {
        const currentTime = Date.now();
        if (currentTime - this.lastBubbleTime > 2000) {
            for (let i = 0; i < 3; i++) {
                this.gameState.bubbles.push({
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height + 50,
                    size: Math.random() * 20 + 10,
                    speed: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
            this.lastBubbleTime = currentTime;
        }
    }

    updateBubbles() {
        this.gameState.bubbles = this.gameState.bubbles.filter(bubble => {
            bubble.y -= bubble.speed;
            bubble.x += Math.sin(bubble.y * 0.01) * 0.5;
            return bubble.y > -100;
        });
    }

    render() {
        // Clear canvas and draw background
        if (this.images.background && this.images.background.complete) {
            // Draw background image, scaled to fit canvas
            this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback ocean gradient if background image fails to load
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.5, '#4682B4');
            gradient.addColorStop(1, '#191970');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Render bubbles
        this.gameState.bubbles.forEach(bubble => {
            this.ctx.save();
            this.ctx.globalAlpha = bubble.opacity;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Render fish
        this.gameState.fish.forEach(fish => {
            this.ctx.save();
            this.ctx.translate(fish.x, fish.y);
            
            // Fish body
            this.ctx.fillStyle = fish.color;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, fish.size, fish.size * 0.7, fish.angle, 0, Math.PI * 2);
            this.ctx.fill();

            // Fish emoji
            this.ctx.font = `${fish.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(fish.emoji, 0, fish.size * 0.3);

            // HP bar
            if (fish.currentHp < fish.hp) {
                const barWidth = fish.size * 1.5;
                const barHeight = 4;
                const hpPercent = fish.currentHp / fish.hp;
                
                this.ctx.fillStyle = '#FF0000';
                this.ctx.fillRect(-barWidth/2, -fish.size - 10, barWidth, barHeight);
                
                this.ctx.fillStyle = '#00FF00';
                this.ctx.fillRect(-barWidth/2, -fish.size - 10, barWidth * hpPercent, barHeight);
            }

            this.ctx.restore();
        });

        // Render bullets with rotation
        this.gameState.bullets.forEach(bullet => {
            this.ctx.save();
            this.ctx.translate(bullet.x, bullet.y);
            this.ctx.rotate(bullet.angle); // Rotate bullet according to flight direction
            
            // If bullet image is loaded, use it, otherwise fallback to circle
            if (this.images.bullet && this.images.bullet.complete) {
                this.ctx.drawImage(
                    this.images.bullet, 
                    -bullet.size, 
                    -bullet.size, 
                    bullet.size * 2, 
                    bullet.size * 2
                );
            } else {
                // Fallback circle
                const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, bullet.size);
                gradient.addColorStop(0, '#FFFF00');
                gradient.addColorStop(1, '#FFA500');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, bullet.size, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });

        // Render particles
        this.gameState.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Render cannon
        this.renderCannon();
    }

    renderCannon() {
        const cannonX = this.canvas.width / 2;
        const cannonY = this.canvas.height - 50;
        
        // Cannon direction
        const dx = this.mouse.x - cannonX;
        const dy = this.mouse.y - cannonY;
        const angle = Math.atan2(dy, dx) + Math.PI / 2; // Add 90 degrees instead of subtract
        
        this.ctx.save();
        this.ctx.translate(cannonX, cannonY);
        this.ctx.rotate(angle);
        
        // If cannon image is loaded, use sprite animation
        if (this.images.cannon && this.images.cannon.complete) {
            const frameWidth = this.images.cannon.width;
            const frameHeight = this.cannon.frameHeight;
            const sourceY = this.cannon.currentFrame * frameHeight;
            
            // Position cannon so the bottom (tail) is at the center (cannon base)
            this.ctx.drawImage(
                this.images.cannon,
                0, sourceY, frameWidth, frameHeight, // Source rectangle
                -frameWidth/2, -frameHeight, frameWidth, frameHeight // Move cannon up so bottom is at center
            );
        } else {
            // Fallback cannon barrel (pointing upward when not rotated)
            this.ctx.fillStyle = '#444444';
            this.ctx.fillRect(-8, -50, 16, 50); // Move rectangle up so bottom is at center
        }
        
        // Cannon base (draw after cannon so it appears on top)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    showNotification(text, color) {
        const notification = document.createElement('div');
        notification.textContent = text;
        notification.className = 'notification';
        notification.style.background = color;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 2000);
    }

    updateUI() {
        document.getElementById('coinDisplay').textContent = this.gameState.coins;
        document.getElementById('scoreDisplay').textContent = this.gameState.score;
        document.getElementById('bulletCost').textContent = this.weapon.cost;
    }

    gameLoop() {
        this.updateCannonAnimation(); // Update cannon animation
        this.updateBullets();
        this.updateFish();
        this.updateParticles();
        this.createBubbles();
        this.updateBubbles();
        this.checkCollisions();
        this.render();
        this.updateUI();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new FishingGame();
});