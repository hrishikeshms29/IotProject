const socket = io('http://127.0.0.1:8000', { transports: ['websocket'] });

const gameContainer = document.getElementById('game-container');
const car = document.getElementById('car');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const gameOverModal = document.getElementById('game-over-modal');
const closeBtn = document.getElementById('close-btn');
const finalScore = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again-btn');
const homeBtn = document.getElementById('home-btn');

let carPosition = { x: (gameContainer.clientWidth / 2) * 0.5, y: gameContainer.clientHeight - 120 };
const carSpeed = 20;
let obstacles = [];
let timeAdders = [];
let coins = [];
let gameRunning = true;
let score = 0;
let timeLeft = 60;

socket.on('arduino:data', (data) => {
    let [xValue, yValue] = data.split(',').map(Number);
    movePlayer(xValue, yValue);
});

closeBtn.onclick = () => {
    gameOverModal.style.display = "none";
    location.reload();
}

playAgainBtn.onclick = () => {
    gameOverModal.style.display = "none";
    location.reload();
}

homeBtn.onclick = () => {
    // Redirect to home page
    window.location.href = "home.html";
}

window.onclick = (event) => {
    if (event.target === gameOverModal) {
        gameOverModal.style.display = "none";
        location.reload();
    }
}

function movePlayer(xValue, yValue) {
    if (!gameRunning) return;
    if (xValue > 550) { // Right
        carPosition.x += carSpeed;
    } else if (xValue < 400) { // Left
        carPosition.x -= carSpeed;
    }
    if (yValue > 700) { // Up
        carPosition.y -= carSpeed;
    } else if (yValue < 300) { // Down
        carPosition.y += carSpeed;
    }

    carPosition.x = Math.max(0, Math.min(gameContainer.clientWidth * 0.5 - car.clientWidth, carPosition.x));
    carPosition.y = Math.max(0, Math.min(gameContainer.clientHeight - car.clientHeight, carPosition.y));

    car.style.left = `${carPosition.x}px`;
    car.style.top = `${carPosition.y}px`;
}

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.left = `${Math.random() * (gameContainer.clientWidth * 0.5 - 50)}px`;
    obstacle.style.top = `-100px`;
    obstacle.style.backgroundImage = 'url("ocars.png")';
    document.querySelector('#center-track').appendChild(obstacle);
    obstacles.push(obstacle);
}

function createTimeAdder() {
    const timeAdder = document.createElement('div');
    timeAdder.classList.add('timeAdder');
    timeAdder.style.left = `${Math.random() * (gameContainer.clientWidth * 0.5 - 30)}px`;
    timeAdder.style.top = `-30px`;
    document.querySelector('#center-track').appendChild(timeAdder);
    timeAdders.push(timeAdder);
}

function createCoin() {
    const coin = document.createElement('div');
    coin.classList.add('coin');
    coin.style.left = `${Math.random() * (gameContainer.clientWidth * 0.5 - 30)}px`;
    coin.style.top = `-30px`;
    document.querySelector('#center-track').appendChild(coin);
    coins.push(coin);
}

function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
        const top = obstacle.offsetTop + 5;
        if (top > gameContainer.clientHeight) {
            obstacle.remove();
            obstacles.splice(index, 1);
            score += 10;
            scoreElement.textContent = `Score: ${score}`;
        } else {
            obstacle.style.top = `${top}px`;
        }
    });
}

function moveTimeAdders() {
    timeAdders.forEach((timeAdder, index) => {
        const top = timeAdder.offsetTop + 5;
        if (top > gameContainer.clientHeight) {
            timeAdder.remove();
            timeAdders.splice(index, 1);
        } else {
            timeAdder.style.top = `${top}px`;
        }
    });
}

function moveCoins() {
    coins.forEach((coin, index) => {
        const top = coin.offsetTop + 5;
        if (top > gameContainer.clientHeight) {
            coin.remove();
            coins.splice(index, 1);
        } else {
            coin.style.top = `${top}px`;
        }
    });
}

function checkCollisions() {
    obstacles.forEach(obstacle => {
        const carCollisionBox = car.getBoundingClientRect();
        const obstacleCollisionBox = obstacle.getBoundingClientRect();
    
        if (
            carCollisionBox.top < obstacleCollisionBox.bottom &&
            carCollisionBox.bottom > obstacleCollisionBox.top &&
            carCollisionBox.left < obstacleCollisionBox.right &&
            carCollisionBox.right > obstacleCollisionBox.left
        ) {
            setTimeout(() => {
                gameOver();
            }, 200);
        }
    });

    timeAdders.forEach((timeAdder, index) => {
        if (
            carPosition.y < timeAdder.offsetTop + timeAdder.clientHeight &&
            carPosition.y + car.clientHeight > timeAdder.offsetTop &&
            carPosition.x < timeAdder.offsetLeft + timeAdder.clientWidth &&
            carPosition.x + car.clientWidth > timeAdder.offsetLeft
        ) {
            timeAdder.remove();
            timeAdders.splice(index, 1);
            timeLeft += 5;
        }
    });

    coins.forEach((coin, index) => {
        if (
            carPosition.y < coin.offsetTop + coin.clientHeight &&
            carPosition.y + car.clientHeight > coin.offsetTop &&
            carPosition.x < coin.offsetLeft + coin.clientWidth &&
            carPosition.x + car.clientWidth > coin.offsetLeft
        ) {
            coin.remove();
            coins.splice(index, 1);
            score += 100;
            scoreElement.textContent = `Score: ${score}`;
        }
    });
}

function gameOver() {
    gameRunning = false;
    finalScore.textContent = `Final Score: ${score}`;
    gameOverModal.style.display = "block";
}

function gameLoop() {
    if (gameRunning) {
        moveObstacles();
        moveTimeAdders();
        moveCoins();
        checkCollisions();
    }
    requestAnimationFrame(gameLoop);
}

function updateTimer() {
    if (gameRunning) {
        if (timeLeft <= 0) {
            gameOver();
        } else {
            timeLeft--;
            timerElement.textContent = `Time: ${timeLeft}`;
        }
    }
}

setInterval(createObstacle, 2000);
setInterval(createTimeAdder, 10000); // Create a timeAdder every 10 seconds
setInterval(createCoin, 5000); // Create a coin every 5 seconds
setInterval(updateTimer, 1000); // Update the timer every second
gameLoop();
