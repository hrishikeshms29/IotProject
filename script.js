// const player = document.getElementById('player');
// const gameContainer = document.getElementById('game-container');
// const scoreElement = document.getElementById('score');
// const gameOverPopup = document.getElementById('game-over-popup');
// const finalScore = document.getElementById('final-score');
// let score = 0;
// let playerPosition = gameContainer.clientWidth / 2;
// const playerSpeed = 10;
// let gameInterval;
// let gameTimeout;
// let playerWidth = player.clientWidth; // Track player's width
// let playerHeight = player.clientHeight; // Track player's height

// document.addEventListener('keydown', event => {
//   if (event.key === 'ArrowLeft') {
//     playerPosition -= playerSpeed;
//   } else if (event.key === 'ArrowRight') {
//     playerPosition += playerSpeed;
//   }
//   playerPosition = Math.max(0, Math.min(gameContainer.clientWidth - playerWidth, playerPosition));
//   player.style.left = `${playerPosition}px`;
// });

// function createBall() {
//   const ball = document.createElement('div');
//   ball.classList.add('ball');
//   ball.style.left = `${Math.random() * (gameContainer.clientWidth - 20)}px`;
//   gameContainer.appendChild(ball);
//   moveBall(ball);
// }

// function moveBall(ball) {
//   let ballInterval = setInterval(() => {
//     const ballTop = ball.offsetTop + 5;
//     if (ballTop > gameContainer.clientHeight) {
//       clearInterval(ballInterval);
//       ball.remove();
//       score += 10;
//       scoreElement.textContent = `Score: ${score}`;
      
//       // Increase player size by 25%
//       playerWidth *= 1.05;
//       playerHeight *= 1.05;
//       player.style.width = `${playerWidth}px`;
//       player.style.height = `${playerHeight}px`;

//     } else if (ballTop + ball.clientHeight > player.offsetTop &&
//                ball.offsetLeft + ball.clientWidth > player.offsetLeft &&
//                ball.offsetLeft < player.offsetLeft + playerWidth) {
//       clearInterval(ballInterval);
//       gameOver();
//     } else {
//       ball.style.top = `${ballTop}px`;
//     }
//   }, 20);
// }

// function startGame() {
//   score = 0;
//   scoreElement.textContent = `Score: ${score}`;
//   gameInterval = setInterval(createBall, 1000);
//   gameTimeout = setTimeout(gameOver, 60000); // End game after 1 minute (60000 milliseconds)
// }

// function gameOver() {
//   clearInterval(gameInterval);
//   clearTimeout(gameTimeout);
//   document.querySelectorAll('.ball').forEach(ball => ball.remove());
//   finalScore.textContent = `Your score: ${score}`;
//   gameOverPopup.style.display = 'block';
// }

// document.getElementById('play-again').addEventListener('click', () => {
//   gameOverPopup.style.display = 'none';
//   startGame();
// });

// document.getElementById('home').addEventListener('click', () => {
//   gameOverPopup.style.display = 'none';
//   window.location.href = 'home.html'; // Redirect to home page
// });

// startGame();
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
let playerWidth = player.clientWidth;
let playerHeight = player.clientHeight;
var socket=io('http://127.0.0.1:8000',{ transports : ['websocket'] })
   socket.on('arduino:data',(data)=>{
    console.log(data);
   })

var socket = io('http://127.0.0.1:8000', { transports: ['websocket'] });
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

    if (xValue > centerX + 450) { // Right
        playerPosition += playerSpeed;
    } else if (xValue < centerX - 450) { // Left
        playerPosition -= playerSpeed;
    }

    playerPosition = Math.max(0, Math.min(gameWidth - playerWidth, playerPosition));
    player.style.left = `${playerPosition}px`;
}

function createBall() {
    const ball = document.createElement('div');
    ball.classList.add('ball');
    ball.style.left = `${Math.random() * (gameContainer.clientWidth - 20)}px`;
    gameContainer.appendChild(ball);
    moveBall(ball);
}

function moveBall(ball) {
    let ballInterval = setInterval(() => {
        const ballTop = ball.offsetTop + 5;
        if (ballTop > gameContainer.clientHeight) {
            clearInterval(ballInterval);
            ball.remove();
            score += 10;
            scoreElement.textContent = `Score: ${score}`;

            playerWidth *= 1.05;
            playerHeight *= 1.05;
            player.style.width = `${playerWidth}px`;
            player.style.height = `${playerHeight}px`;

        } else if (ballTop + ball.clientHeight > player.offsetTop &&
                   ball.offsetLeft + ball.clientWidth > player.offsetLeft &&
                   ball.offsetLeft < player.offsetLeft + playerWidth) {
            clearInterval(ballInterval);
            gameOver();
        } else {
            ball.style.top = `${ballTop}px`;
        }
    }, 20);
}

function startGame() {
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameInterval = setInterval(createBall, 1000);
    gameTimeout = setTimeout(gameOver, 60000);
}


function gameOver() {
    clearInterval(gameInterval);
    clearTimeout(gameTimeout);
    document.querySelectorAll('.ball').forEach(ball => ball.remove());
    finalScore.textContent = `Your score: ${score}`;
    gameOverPopup.style.display = 'block';
}

document.getElementById('play-again').addEventListener('click', () => {
    gameOverPopup.style.display = 'none';
    startGame();
});

document.getElementById('home').addEventListener('click', () => {
    gameOverPopup.style.display = 'none';
    window.location.href = 'home.html';
});

startGame();
