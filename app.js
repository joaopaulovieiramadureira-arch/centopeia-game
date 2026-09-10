const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const scoreDisplay = document.getElementById('score');
const lengthDisplay = document.getElementById('length');
const insectsDisplay = document.getElementById('insects');
const wallsDisplay = document.getElementById('walls');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const finalLengthDisplay = document.getElementById('finalLength');
const finalWallsDisplay = document.getElementById('finalWalls');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let gameRunning = false;
let gamePaused = false;
let score = 0;
let insectCount = 0;
let wallCount = 0;

// Centopeia reduzida
const centipede = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 }
];

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

const INSECT_TYPES = {
    MOSQUITO: 'mosquito',
    ABELHA: 'abelha',
    ARANHA: 'aranha'
};

const INSECT_DATA = {
    mosquito: { points: 1, chance: 45, color: '#3498db' },
    abelha: { points: 2, chance: 40, color: '#f39c12' },
    aranha: { points: 3, chance: 15, color: '#e74c3c' }
};

let insect = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
    type: generateInsectType()
};

let walls = [];
let wallPattern = ['meio', 'esquerda', 'direita', 'meio', 'direita', 'esquerda'];
let wallPatternIndex = 0;

function generateInsectType() {
    const rand = Math.random() * 100;
    if (rand < 45) return INSECT_TYPES.MOSQUITO;
    if (rand < 85) return INSECT_TYPES.ABELHA;
    return INSECT_TYPES.ARANHA;
}

function getRandomWallPosition(pattern, excludeAreas = []) {
    let validPosition = false;
    let wallPos = {};

    while (!validPosition) {
        if (pattern === 'meio') {
            wallPos = {
                x: Math.floor(tileCount / 2) + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2),
                y: Math.floor(Math.random() * tileCount)
            };
        } else if (pattern === 'esquerda') {
            wallPos = {
                x: Math.floor(tileCount / 4) + Math.floor(Math.random() * 3),
                y: Math.floor(Math.random() * tileCount)
            };
        } else if (pattern === 'direita') {
            wallPos = {
                x: Math.floor(tileCount * 3 / 4) + Math.floor(Math.random() * 3),
                y: Math.floor(Math.random() * tileCount)
            };
        } else if (pattern === 'aleatorio') {
            wallPos = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        }

        // Verificar se não colide com centopeia ou outras paredes
        validPosition = !centipede.some(seg => seg.x === wallPos.x && seg.y === wallPos.y) &&
                       !walls.some(w => w.x === wallPos.x && w.y === wallPos.y) &&
                       !(wallPos.x === insect.x && wallPos.y === insect.y) &&
                       wallPos.x >= 0 && wallPos.x < tileCount &&
                       wallPos.y >= 0 && wallPos.y < tileCount;
    }

    return wallPos;
}

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
    
    let handled = false;
    
    switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            handled = true;
            break;
        case 's':
        case 'arrowdown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            handled = true;
            break;
        case 'a':
        case 'arrowleft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            handled = true;
            break;
        case 'd':
        case 'arrowright':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            handled = true;
            break;
    }
    
    if (handled) {
        e.preventDefault();
    }
});

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    direction = nextDirection;
    
    const head = centipede[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    if (newHead.x < 0 || newHead.x >= tileCount || newHead.y < 0 || newHead.y >= tileCount) {
        endGame();
        return;
    }
    
    if (centipede.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return;
    }
    
    if (walls.some(wall => wall.x === newHead.x && wall.y === newHead.y)) {
        endGame();
        return;
    }
    
    centipede.unshift(newHead);
    
    if (newHead.x === insect.x && newHead.y === insect.y) {
        const points = INSECT_DATA[insect.type].points;
        score += points;
        insectCount++;
        
        // Sistema progressivo de paredes
        let wallsToAdd = 0;
        if (score >= 60) {
            if (insectCount % 2 === 0) wallsToAdd = 3;
        } else if (score >= 30) {
            if (insectCount % 2 === 0) wallsToAdd = 2;
        } else if (score >= 10) {
            if (insectCount % 2 === 0) wallsToAdd = 1;
        }
        
        // Adicionar paredes seguindo o padrão
        for (let i = 0; i < wallsToAdd; i++) {
            const pattern = wallPattern[wallPatternIndex % wallPattern.length];
            addWall(pattern);
            wallPatternIndex++;
        }
        
        // Gerar novo inseto com restrição de 7 quadrados
        spawnInsect();
    } else {
        centipede.pop();
    }
    
    updateDisplay();
    draw();
    
    setTimeout(gameLoop, 100);
}

function addWall(pattern) {
    let newWall;
    let valid = false;
    let attempts = 0;
    
    while (!valid && attempts < 50) {
        if (pattern === 'meio') {
            newWall = {
                x: Math.floor(tileCount / 2) + Math.floor((Math.random() - 0.5) * 4),
                y: Math.floor(Math.random() * tileCount)
            };
        } else if (pattern === 'esquerda') {
            newWall = {
                x: Math.floor(Math.random() * (tileCount / 2)),
                y: Math.floor(Math.random() * tileCount)
            };
        } else if (pattern === 'direita') {
            newWall = {
                x: Math.floor(tileCount / 2) + Math.floor(Math.random() * (tileCount / 2)),
                y: Math.floor(Math.random() * tileCount)
            };
        } else {
            newWall = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        }
        
        valid = !centipede.some(segment => segment.x === newWall.x && segment.y === newWall.y) &&
                !(newWall.x === insect.x && newWall.y === insect.y) &&
                !walls.some(w => w.x === newWall.x && w.y === newWall.y) &&
                newWall.x >= 0 && newWall.x < tileCount &&
                newWall.y >= 0 && newWall.y < tileCount;
        
        attempts++;
    }
    
    if (valid) {
        walls.push(newWall);
        wallCount++;
    }
}

function spawnInsect() {
    let newInsect;
    let valid = false;
    let attempts = 0;
    
    while (!valid && attempts < 100) {
        newInsect = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
            type: generateInsectType()
        };
        
        // Verificar distância de 7 quadrados da centopeia
        const head = centipede[0];
        const distanceFromHead = Math.max(Math.abs(newInsect.x - head.x), Math.abs(newInsect.y - head.y));
        
        valid = distanceFromHead > 7 &&
                !centipede.some(segment => segment.x === newInsect.x && segment.y === newInsect.y) &&
                !walls.some(wall => wall.x === newInsect.x && wall.y === newInsect.y);
        
        attempts++;
    }
    
    if (valid) {
        insect = newInsect;
    }
}

function draw() {
    ctx.fillStyle = '#f5f7fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
    
    walls.forEach(wall => {
        drawWall(wall.x, wall.y);
    });
    
    drawInsect(insect.x, insect.y, insect.type);
    
    centipede.forEach((segment, index) => {
        if (index === 0) {
            drawHead(segment.x, segment.y);
        } else {
            drawSegment(segment.x, segment.y, index);
        }
    });
    
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    centipede.forEach((segment, index) => {
        if (index > 0) {
            ctx.fillText(`${index}`, segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2 + 5);
        }
    });
}

function drawWall(x, y) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(x * gridSize + 2, y * gridSize + 2, gridSize - 4, gridSize - 4);
    
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * gridSize + 2, y * gridSize + 2, gridSize - 4, gridSize - 4);
    
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, y * gridSize + 2);
    ctx.lineTo(centerX, y * gridSize + gridSize - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x * gridSize + 2, centerY);
    ctx.lineTo(x * gridSize + gridSize - 2, centerY);
    ctx.stroke();
}

function drawHead(x, y) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    const radius = gridSize / 2.2;
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
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
    
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    const antennaLength = gridSize * 0.8;
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
    const size = gridSize / 2.4;
    
    const hue = 20 + (index * 5) % 30;
    ctx.fillStyle = `hsl(${hue}, 85%, 50%)`;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = `hsl(${hue}, 85%, 30%)`;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.strokeStyle = `hsl(${hue}, 85%, 40%)`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const legLength = size * 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * legLength,
            centerY + Math.sin(angle) * legLength
        );
        ctx.stroke();
    }
}

function drawInsect(x, y, type) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    
    if (type === INSECT_TYPES.MOSQUITO) {
        drawMosquito(centerX, centerY);
    } else if (type === INSECT_TYPES.ABELHA) {
        drawAbelha(centerX, centerY);
    } else if (type === INSECT_TYPES.ARANHA) {
        drawAranha(centerX, centerY);
    }
}

function drawMosquito(centerX, centerY) {
    const size = gridSize / 3;
    
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size / 1.5, size * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(centerX, centerY - size * 1.2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * i) / 3 - Math.PI / 2;
        const legLength = size * 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * legLength,
            centerY + Math.sin(angle) * legLength
        );
        ctx.stroke();
    }
    
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 1.2);
    ctx.lineTo(centerX, centerY - size * 1.8);
    ctx.stroke();
}

function drawAbelha(centerX, centerY) {
    const size = gridSize / 2.5;
    
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size * 0.8, size * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.8, centerY - size * 0.4);
    ctx.lineTo(centerX + size * 0.8, centerY - size * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.8, centerY);
    ctx.lineTo(centerX + size * 0.8, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.8, centerY + size * 0.4);
    ctx.lineTo(centerX + size * 0.8, centerY + size * 0.4);
    ctx.stroke();
    
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(centerX, centerY - size * 1.2, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(200, 220, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.3, centerY - size * 0.5);
    ctx.lineTo(centerX - size * 0.8, centerY - size * 1);
    ctx.lineTo(centerX - size * 0.5, centerY);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(centerX + size * 0.3, centerY - size * 0.5);
    ctx.lineTo(centerX + size * 0.8, centerY - size * 1);
    ctx.lineTo(centerX + size * 0.5, centerY);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1.5;
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
    
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.3, centerY - size * 1.5);
    ctx.lineTo(centerX - size * 0.5, centerY - size * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX + size * 0.3, centerY - size * 1.5);
    ctx.lineTo(centerX + size * 0.5, centerY - size * 2);
    ctx.stroke();
}

function drawAranha(centerX, centerY) {
    const size = gridSize / 2;
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size * 0.7, size * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(centerX, centerY - size * 1, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    const eyeRadius = 1.5;
    const eyeRow1Y = centerY - size * 1;
    const eyeRow2Y = centerY - size * 0.8;
    
    for (let i = 0; i < 4; i++) {
        const x = centerX - size * 0.3 + (i * size * 0.15);
        ctx.beginPath();
        ctx.arc(x, eyeRow1Y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    for (let i = 0; i < 4; i++) {
        const x = centerX - size * 0.3 + (i * size * 0.15);
        ctx.beginPath();
        ctx.arc(x, eyeRow2Y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const legLength = size * 1.8;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * legLength,
            centerY + Math.sin(angle) * legLength
        );
        ctx.stroke();
    }
    
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.2, centerY - size * 0.8);
    ctx.lineTo(centerX - size * 0.35, centerY - size * 0.6);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX + size * 0.2, centerY - size * 0.8);
    ctx.lineTo(centerX + size * 0.35, centerY - size * 0.6);
    ctx.stroke();
}

function updateDisplay() {
    scoreDisplay.textContent = score;
    lengthDisplay.textContent = centipede.length;
    insectsDisplay.textContent = insectCount;
    wallsDisplay.textContent = wallCount;
}

function endGame() {
    gameRunning = false;
    finalScoreDisplay.textContent = score;
    finalLengthDisplay.textContent = centipede.length;
    finalWallsDisplay.textContent = wallCount;
    gameOverScreen.classList.remove('hidden');
}

draw();