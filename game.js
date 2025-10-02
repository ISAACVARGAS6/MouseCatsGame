// Mouse vs Cats Game - Motor de juego en JavaScript vanilla
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        
        // Configuración del juego
        this.gravity = 0.6;
        this.friction = 0.8;
        
        // Inicializar entidades
        this.player = new Mouse(50, 200);
        this.platforms = this.createPlatforms();
        this.enemies = this.createEnemies();
        
        // Controles
        this.keys = {};
        this.setupControls();
        
        // Iniciar bucle del juego
        this.gameLoop();
    }
    
    createPlatforms() {
        return [
            // Plataformas del suelo
            new Platform(0, 400, 150, 20),
            new Platform(200, 400, 100, 20),
            new Platform(350, 400, 120, 20),
            new Platform(520, 400, 100, 20),
            new Platform(670, 400, 130, 20),
            
            // Plataformas nivel medio
            new Platform(50, 350, 100, 20),
            new Platform(200, 320, 120, 20),
            new Platform(380, 350, 100, 20),
            new Platform(530, 320, 120, 20),
            new Platform(680, 350, 120, 20),
            
            // Plataformas nivel alto
            new Platform(100, 250, 120, 20),
            new Platform(280, 220, 100, 20),
            new Platform(430, 250, 120, 20),
            new Platform(600, 220, 100, 20),
            
            // Plataformas nivel superior
            new Platform(0, 150, 80, 20),
            new Platform(150, 120, 100, 20),
            new Platform(300, 150, 80, 20),
            new Platform(450, 120, 100, 20),
            new Platform(600, 150, 80, 20),
            new Platform(720, 120, 80, 20),
            
            // Plataformas flotantes
            new Platform(250, 80, 60, 20),
            new Platform(500, 80, 60, 20)
        ];
    }
    
    createEnemies() {
        return [
            // Enemigos en plataformas del suelo
            new Cat(120, 370, 1),
            new Cat(370, 370, -1),
            new Cat(690, 370, 1),
            
            // Enemigos en plataformas nivel medio
            new Cat(220, 300, -1),
            new Cat(550, 300, 1),
            
            // Enemigo en plataformas nivel alto
            new Cat(300, 200, -1),
            
            
            // Enemigo en plataformas nivel superior
            new Cat(470, 100, 1)
        ];
    }
    
    setupControls() {
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            e.preventDefault(); // Prevenir comportamiento por defecto
            this.keys[e.code] = true;
            
            // Ejecutar acciones inmediatamente
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.player.moveLeft();
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.player.moveRight();
            }
            if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
                this.player.jump();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Controles táctiles
        document.getElementById('leftBtn').addEventListener('mousedown', () => {
            this.player.moveLeft();
        });
        
        document.getElementById('rightBtn').addEventListener('mousedown', () => {
            this.player.moveRight();
        });
        
        document.getElementById('jumpBtn').addEventListener('mousedown', () => {
            this.player.jump();
        });
        
        // Controles táctiles con touch
        document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.moveLeft();
        });
        
        document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.moveRight();
        });
        
        document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.jump();
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Actualizar jugador
        this.player.update(this.keys);
        
        // Actualizar enemigos
        this.enemies.forEach(enemy => {
            enemy.update();
        });
        
        // Verificar colisiones
        this.checkCollisions();
        
        // Aplicar física
        this.applyPhysics();
    }
    
    applyPhysics() {
        // Gravedad para el jugador
        this.player.velocity.y += this.gravity;
        
        // Fricción horizontal solo si no hay input
        if (!this.keys['ArrowLeft'] && !this.keys['ArrowRight'] && !this.keys['KeyA'] && !this.keys['KeyD']) {
            this.player.velocity.x *= this.friction;
        }
        
        // Actualizar posición del jugador
        this.player.position.x += this.player.velocity.x;
        this.player.position.y += this.player.velocity.y;
        
        // Limitar velocidad máxima
        if (this.player.velocity.y > 15) {
            this.player.velocity.y = 15;
        }
        
        // Verificar límites de pantalla
        if (this.player.position.y > 600) {
            this.player.position.y = -50;
            this.player.position.x = 50;
            this.player.velocity.y = 0;
        }
        
        // Limitar movimiento horizontal
        if (this.player.position.x < 0) {
            this.player.position.x = 0;
        }
        if (this.player.position.x > 760) {
            this.player.position.x = 760;
        }
    }
    
    checkCollisions() {
        // Colisión con plataformas
        this.platforms.forEach(platform => {
            if (this.isColliding(this.player, platform)) {
                // Si el jugador está cayendo y toca una plataforma desde arriba
                if (this.player.velocity.y > 0 && this.player.position.y < platform.position.y) {
                    this.player.position.y = platform.position.y - this.player.size.height;
                    this.player.velocity.y = 0;
                    this.player.onGround = true;
                }
                // Si el jugador está subiendo y toca una plataforma desde abajo
                else if (this.player.velocity.y < 0 && this.player.position.y > platform.position.y) {
                    this.player.position.y = platform.position.y + platform.size.height;
                    this.player.velocity.y = 0;
                }
                // Si el jugador toca una plataforma desde los lados
                else if (this.player.velocity.x > 0 && this.player.position.x < platform.position.x) {
                    this.player.position.x = platform.position.x - this.player.size.width;
                    this.player.velocity.x = 0;
                }
                else if (this.player.velocity.x < 0 && this.player.position.x > platform.position.x) {
                    this.player.position.x = platform.position.x + platform.size.width;
                    this.player.velocity.x = 0;
                }
            }
        });
        
        // Colisión con enemigos
        this.enemies.forEach((enemy, index) => {
            if (this.isColliding(this.player, enemy)) {
                if (this.player.velocity.y > 0 && this.player.position.y < enemy.position.y) {
                    // Saltar sobre el enemigo
                    this.player.velocity.y = -15;
                    this.enemies.splice(index, 1);
                    this.score += 100;
                    document.getElementById('score').textContent = this.score;
                } else {
                    // Perder vida
                    this.gameOver();
                }
            }
        });
    }
    
    isColliding(entity1, entity2) {
        return (
            entity1.position.x < entity2.position.x + entity2.size.width &&
            entity1.position.x + entity1.size.width > entity2.position.x &&
            entity1.position.y < entity2.position.y + entity2.size.height &&
            entity1.position.y + entity1.size.height > entity2.position.y
        );
    }
    
    render() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar plataformas
        this.platforms.forEach(platform => {
            platform.render(this.ctx);
        });
        
        // Dibujar enemigos
        this.enemies.forEach(enemy => {
            enemy.render(this.ctx);
        });
        
        // Dibujar jugador
        this.player.render(this.ctx);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        this.ctx.fillText('Recarga la página para jugar de nuevo', this.canvas.width / 2, this.canvas.height / 2 + 100);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Clase del ratón (jugador)
class Mouse {
    constructor(x, y) {
        this.position = { x, y };
        this.size = { width: 40, height: 40 };
        this.velocity = { x: 0, y: 0 };
        this.onGround = false;
        this.color = '#8B4513'; // Color marrón para el ratón
    }
    
    update(keys) {
        this.onGround = false;
        
        // Controles de teclado - solo aplicar si la tecla está presionada
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.moveLeft();
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.moveRight();
        }
        // El salto se maneja en keydown, no aquí
    }
    
    moveLeft() {
        this.velocity.x = Math.max(this.velocity.x - 2, -8);
    }
    
    moveRight() {
        this.velocity.x = Math.min(this.velocity.x + 2, 8);
    }
    
    jump() {
        if (this.onGround) {
            this.velocity.y = -20;
            this.onGround = false;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        
        // Dibujar ratón
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐭', this.position.x + this.size.width / 2, this.position.y + this.size.height / 2 + 8);
    }
}

// Clase de plataforma
class Platform {
    constructor(x, y, width, height) {
        this.position = { x, y };
        this.size = { width, height };
        this.color = '#8B4513';
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        
        // Borde de la plataforma
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
}

// Clase de gato (enemigo)
class Cat {
    constructor(x, y, direction) {
        this.position = { x, y };
        this.size = { width: 30, height: 30 };
        this.velocity = { x: direction * 2, y: 0 };
        this.direction = direction;
        this.color = '#FF6B6B'; // Color rojo para los gatos enemigos
    }
    
    update() {
        // Movimiento horizontal
        this.position.x += this.velocity.x;
        
        // Cambiar dirección si llega a los bordes
        if (this.position.x <= 0 || this.position.x >= 770) {
            this.velocity.x *= -1;
            this.direction *= -1;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        
        // Dibujar gato estático
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐱', this.position.x + this.size.width / 2, this.position.y + this.size.height / 2 + 6);
    }
}

// Inicializar el juego cuando se carga la página
window.addEventListener('load', () => {
    new Game();
});
