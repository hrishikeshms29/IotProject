const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const gameOverPopup = document.getElementById('game-over-popup');
const finalScore = document.getElementById('final-score');
let score = 0;
let playerPosition = gameContainer.clientWidth / 2;
const playerSpeed = 10;
let gameInterval;

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    playerPosition -= playerSpeed;
  } else if (event.key === 'ArrowRight') {
    playerPosition += playerSpeed;
  }
  playerPosition = Math.max(0, Math.min(gameContainer.clientWidth - player.clientWidth, playerPosition));
  player.style.left = `${playerPosition}px`;
});

function createObstacle() {
  const obstacle = document.createElement('div');
  obstacle.classList.add('item');
  obstacle.style.left = `${Math.random() * (gameContainer.clientWidth - 20)}px`;
  gameContainer.appendChild(obstacle);
  moveObstacle(obstacle);
}

function moveObstacle(obstacle) {
  let obstacleInterval = setInterval(() => {
    const obstacleTop = obstacle.offsetTop + 5;
    if (obstacleTop > gameContainer.clientHeight) {
      clearInterval(obstacleInterval);
      obstacle.remove();
      score += 10;
      scoreElement.textContent = `Score: ${score}`;
    } else if (obstacleTop + obstacle.clientHeight > player.offsetTop &&
               obstacle.offsetLeft + obstacle.clientWidth > player.offsetLeft &&
               obstacle.offsetLeft < player.offsetLeft + player.clientWidth) {
      clearInterval(obstacleInterval);
      gameOver();
    } else {
      obstacle.style.top = `${obstacleTop}px`;
    }
  }, 20);
}

function startGame() {
  score = 0;
  scoreElement.textContent = `Score: ${score}`;
  gameInterval = setInterval(createObstacle, 1000);
}

function gameOver() {
  clearInterval(gameInterval);
  document.querySelectorAll('.item').forEach(obstacle => obstacle.remove());
  finalScore.textContent = `Your score: ${score}`;
  gameOverPopup.style.display = 'block';
}

document.getElementById('play-again').addEventListener('click', () => {
  gameOverPopup.style.display = 'none';
  startGame();
});

document.getElementById('home').addEventListener('click', () => {
  gameOverPopup.style.display = 'none';
  window.location.href = 'index.html'; // Redirect to home page
});

startGame();
