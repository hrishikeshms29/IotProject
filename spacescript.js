const socket = io('http://127.0.0.1:8000', { transports: ['websocket'] });

const spaceship = document.getElementById('spaceship');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const gameOverPopup = document.getElementById('game-over-popup');
const playAgainButton = document.getElementById('play-again');
const homeButton = document.getElementById('home');

let score = 0;
let spaceshipPosition = gameContainer.clientWidth / 2;
const spaceshipSpeed = 25;
const playerWidth = spaceship.clientWidth;
let gameRunning = true;

let asteroids = [];
let lasers = [];
let asteroidSpeed = 5; // Initial speed of the asteroids

socket.on('arduino:data', (data) => {
    let [xValue, yValue] = data.split(',').map(Number);
    movePlayer(xValue, yValue);
});

function movePlayer(xValue, yValue) {
    let gameWidth = gameContainer.clientWidth;
    let centerX = 512; // Adjust based on joystick calibration
    let centerY = 512; // Adjust based on joystick calibration

    if (xValue > 500) { // Right
        spaceshipPosition += spaceshipSpeed;
    } else if (xValue < 400) { // Left
        spaceshipPosition -= spaceshipSpeed;
    }

    if (yValue > 700) { // Up
        shootLaser();
    }

    spaceshipPosition = Math.max(0, Math.min(gameWidth - playerWidth, spaceshipPosition));
    spaceship.style.left = `${spaceshipPosition}px`;
}

function createAsteroid() {
    if (!gameRunning) return;
    const asteroid = document.createElement('div');
    asteroid.classList.add('asteroid');
    asteroid.style.left = `${Math.random() * (gameContainer.clientWidth - 40)}px`;
    gameContainer.appendChild(asteroid);
    asteroids.push(asteroid);
}

function moveAsteroids() {
    asteroids.forEach((asteroid, index) => {
        const top = asteroid.offsetTop + asteroidSpeed;
        if (top > gameContainer.clientHeight) {
            asteroid.remove();
            asteroids.splice(index, 1);
        } else {
            asteroid.style.top = `${top}px`;
        }
    });
}

function shootLaser() {
    if (!gameRunning) return;
    const laser = document.createElement('div');
    laser.classList.add('laser');
    laser.style.left = `${spaceshipPosition + spaceship.clientWidth / 2 - 2.5}px`;
    laser.style.top = `${spaceship.offsetTop}px`;
    gameContainer.appendChild(laser);
    lasers.push(laser);
}

function moveLasers() {
    lasers.forEach((laser, index) => {
        const top = laser.offsetTop - 10;
        if (top < 0) {
            laser.remove();
            lasers.splice(index, 1);
        } else {
            laser.style.top = `${top}px`;
        }
    });
}

function checkCollisions() {
    asteroids.forEach((asteroid, aIndex) => {
        lasers.forEach((laser, lIndex) => {
            if (
                laser.offsetTop < asteroid.offsetTop + asteroid.clientHeight &&
                laser.offsetLeft + laser.clientWidth > asteroid.offsetLeft &&
                laser.offsetLeft < asteroid.offsetLeft + asteroid.clientWidth
            ) {
                asteroid.remove();
                laser.remove();
                asteroids.splice(aIndex, 1);
                lasers.splice(lIndex, 1);
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
                adjustAsteroidSpeed();
            }
        });

        if (
            asteroid.offsetTop + asteroid.clientHeight > spaceship.offsetTop &&
            asteroid.offsetLeft + asteroid.clientWidth > spaceship.offsetLeft &&
            asteroid.offsetLeft < spaceship.offsetLeft + spaceship.clientWidth
        ) {
            gameOver();
        }
    });
}

function adjustAsteroidSpeed() {
    asteroidSpeed = 5 + Math.floor(score / 50); // Increase speed based on score
}

function gameOver() {
    gameRunning = false;
    gameOverPopup.classList.remove('hidden');
}

function resetGame() {
    gameRunning = true;
    score = 0;
    asteroidSpeed = 5; // Reset speed to initial value
    scoreElement.textContent = `Score: ${score}`;
    spaceshipPosition = gameContainer.clientWidth / 2;
    spaceship.style.left = `${spaceshipPosition}px`;

    asteroids.forEach(asteroid => asteroid.remove());
    lasers.forEach(laser => laser.remove());
    asteroids = [];
    lasers = [];

    gameOverPopup.classList.add('hidden');
}

playAgainButton.addEventListener('click', () => {
    resetGame();
});

homeButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // Redirect to home page
});

function gameLoop() {
    if (gameRunning) {
        moveAsteroids();
        moveLasers();
        checkCollisions();
    }
    requestAnimationFrame(gameLoop);
}

setInterval(createAsteroid, 1000);
gameLoop();
