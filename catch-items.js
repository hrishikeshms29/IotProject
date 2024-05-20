const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const gameOverPopup = document.getElementById('game-over-popup');
const finalScore = document.getElementById('final-score');
let score = 0;
let playerPosition = gameContainer.clientWidth / 2;
const playerSpeed = 10;
let gameInterval;
let gameTimeout;
let playerWidth = player.clientWidth; // Track player's width
let playerHeight = player.clientHeight; // Track player's height

// document.addEventListener('keydown', event => {
//   if (event.key === 'ArrowLeft') {
//     playerPosition -= playerSpeed;
//   } else if (event.key === 'ArrowRight') {
//     playerPosition += playerSpeed;
//   }
//   playerPosition = Math.max(0, Math.min(gameContainer.clientWidth - playerWidth, playerPosition));
//   player.style.left = `${playerPosition}px`;
// });

var socket=io('http://127.0.0.1:8000',{ transports : ['websocket'] })
   socket.on('arduino:data',(data)=>{
    console.log(data);
   })

// var socket = io('http://127.0.0.1:8000', { transports: ['websocket'] });
socket.on('arduino:data', (data) => {
    let [xValue, yValue] = data.split(',').map(Number);
    movePlayer(xValue, yValue);
});

function End() {
    socket.emit('end:game');
}

function movePlayer(xValue, yValue) {
    let gameWidth = gameContainer.clientWidth;
    let gameHeight = gameContainer.clientHeight;
    let centerX = 512; // Adjust based on joystick calibration
    let centerY = 512; // Adjust based on joystick calibration

    if (xValue > centerX + 100) { // Right
        playerPosition += playerSpeed;
    } else if (xValue < centerX - 100) { // Left
        playerPosition -= playerSpeed;
    }

    playerPosition = Math.max(0, Math.min(gameWidth - playerWidth, playerPosition));
    player.style.left = `${playerPosition}px`;
}

function createItem() {
  const item = document.createElement('div');
  item.classList.add('item');
  item.style.left = `${Math.random() * (gameContainer.clientWidth - 20)}px`;
  gameContainer.appendChild(item);
  moveItem(item);
}

function moveItem(item) {
  let itemInterval = setInterval(() => {
    const itemTop = item.offsetTop + 5;
    if (itemTop > gameContainer.clientHeight) {
      clearInterval(itemInterval);
      item.remove();
    } else if (itemTop + item.clientHeight > player.offsetTop &&
               item.offsetLeft + item.clientWidth > player.offsetLeft &&
               item.offsetLeft < player.offsetLeft + playerWidth) {
      clearInterval(itemInterval);
      item.remove();
      score += 10;
      scoreElement.textContent = `Score: ${score}`;
      
      // Increase player size by 25%
      playerWidth *= 1.05;
      playerHeight *= 1.05;
      player.style.width = `${playerWidth}px`;
      player.style.height = `${playerHeight}px`;

    } else {
      item.style.top = `${itemTop}px`;
    }
  }, 20);
}

function startGame() {
  score = 0;
  playerWidth = player.clientWidth; // Reset player width
  playerHeight = player.clientHeight; // Reset player height
  player.style.width = `${playerWidth}px`; // Apply reset width
  player.style.height = `${playerHeight}px`; // Apply reset height
  scoreElement.textContent = `Score: ${score}`;
  gameInterval = setInterval(createItem, 1000);
  gameTimeout = setTimeout(gameOver, 60000); // End game after 1 minute (60000 milliseconds)
}

function gameOver() {
  clearInterval(gameInterval);
  clearTimeout(gameTimeout);
  document.querySelectorAll('.item').forEach(item => item.remove());
  finalScore.textContent = `Your score: ${score}`;
  gameOverPopup.style.display = 'block';
}

document.getElementById('play-again').addEventListener('click', () => {
  gameOverPopup.style.display = 'none';
  startGame();
});

document.getElementById('home').addEventListener('click', () => {
  gameOverPopup.style.display = 'none';
  window.location.href = 'home.html'; // Redirect to home page
});

startGame();
