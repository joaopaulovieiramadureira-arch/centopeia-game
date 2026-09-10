const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const scoreDisplay = document.getElementById('score');
const lengthDisplay = document.getElementById('length');
const insectsDisplay = document.getElementById('insects');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const finalLengthDisplay = document.getElementById('finalLength');

// Configurações do jogo
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Estado do jogo
let gameRunning = false;
let gamePaused = false;
let score = 0;
let insectCount = 0;

// Centopeia
const centipede = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

// Inseto
let insect = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

// Controladores
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        pauseBtn.textContent = 'Pausar';
        gameOverScreen.classList.add('hidden');
        gameLoop();
    }
});

pauseBtn.addEventListener('click', () => {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? 'Retomar' : 'Pausar';
        if (!gamePaused) {
            gameLoop();
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
    }
});

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    // Atualizar direção
    direction = nextDirection;
    
    // Calcular nova cabeça
    const head = centipede[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // Verificar colisão com parede
    if (newHead.x < 0 || newHead.x >= tileCount || newHead.y < 0 || newHead.y >= tileCount) {
        endGame();
        return;
    }
    
    // Verificar colisão consigo mesma
    if (centipede.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return;
    }
    
    // Adicionar nova cabeça
    centipede.unshift(newHead);
    
    // Verificar se comeu inseto
    if (newHead.x === insect.x && newHead.y === insect.y) {
        score += 10 * centipede.length;
        insectCount++;
        // Gerar novo inseto
        spawnInsect();
        // Não remover cauda (centopeia cresce)
    } else {
        // Remover cauda se não comeu
        centipede.pop();
    }
    
    // Atualizar display
    updateDisplay();
    
    // Desenhar
    draw();
    
    // Próximo frame
    setTimeout(gameLoop, 100);
}

function spawnInsect() {
    let newInsect;
    let valid = false;
    
    while (!valid) {
        newInsect = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Verificar se não colide com a centopeia
        valid = !centipede.some(segment => segment.x === newInsect.x && segment.y === newInsect.y);
    }
    
    insect = newInsect;
}

function draw() {
    // Limpar canvas
    ctx.fillStyle = '#f5f7fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar grade
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Desenhar inseto
    drawInsect(insect.x, insect.y);
    
    // Desenhar centopeia
    centipede.forEach((segment, index) => {
        if (index === 0) {
            drawHead(segment.x, segment.y);
        } else {
            drawSegment(segment.x, segment.y, index);
        }
    });
    
    // Desenhar número de pernas
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    centipede.forEach((segment, index) => {
        if (index > 0) {
            ctx.fillText(`${index}`, segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2 + 5);
        }
    });
}

function drawHead(x, y) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 2;
    
    // Corpo principal
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Olhos
    ctx.fillStyle = 'white';
    const eyeRadius = 3;
    const eyeOffset = 4;
    
    if (direction.x !== 0 || direction.y !== 0) {
        const angle = Math.atan2(direction.y, direction.x);
        const eyeX1 = centerX + Math.cos(angle) * eyeOffset + Math.cos(angle + Math.PI / 3) * eyeOffset;
        const eyeY1 = centerY + Math.sin(angle) * eyeOffset + Math.sin(angle + Math.PI / 3) * eyeOffset;
        const eyeX2 = centerX + Math.cos(angle) * eyeOffset + Math.cos(angle - Math.PI / 3) * eyeOffset;
        const eyeY2 = centerY + Math.sin(angle) * eyeOffset + Math.sin(angle - Math.PI / 3) * eyeOffset;
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Antenas
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    const antennaLength = gridSize * 0.6;
    const angle = Math.atan2(direction.y, direction.x);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(angle - Math.PI / 3) * antennaLength,
        centerY + Math.sin(angle - Math.PI / 3) * antennaLength
    );
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(angle + Math.PI / 3) * antennaLength,
        centerY + Math.sin(angle + Math.PI / 3) * antennaLength
    );
    ctx.stroke();
}

function drawSegment(x, y, index) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    const size = gridSize / 2 - 2;
    
    // Variação de cor (gradiente)
    const hue = 20 + (index * 5) % 30;
    ctx.fillStyle = `hsl(${hue}, 85%, 50%)`;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Pernas (pequenas linhas saindo do corpo)
    ctx.strokeStyle = `hsl(${hue}, 85%, 40%)`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * i) / 2;
        const legLength = size * 1.2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * legLength,
            centerY + Math.sin(angle) * legLength
        );
        ctx.stroke();
    }
}

function drawInsect(x, y) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    const size = gridSize / 2.5;
    
    // Corpo do inseto (verde)
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size, size * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pernas
    ctx.strokeStyle = '#229954';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * i) / 3;
        const legLength = size * 1.2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * legLength,
            centerY + Math.sin(angle) * legLength
        );
        ctx.stroke();
    }
    
    // Antenas
    ctx.beginPath();
    ctx.moveTo(centerX - size / 2, centerY - size);
    ctx.lineTo(centerX - size / 2 - 5, centerY - size - 8);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX + size / 2, centerY - size);
    ctx.lineTo(centerX + size / 2 + 5, centerY - size - 8);
    ctx.stroke();
}

function updateDisplay() {
    scoreDisplay.textContent = score;
    lengthDisplay.textContent = centipede.length;
    insectsDisplay.textContent = insectCount;
}

function endGame() {
    gameRunning = false;
    finalScoreDisplay.textContent = score;
    finalLengthDisplay.textContent = centipede.length;
    gameOverScreen.classList.remove('hidden');
}

// Iniciar desenho do jogo vazio
draw();