// Dobivanje reference na canvas i postavljanje konteksta
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Postavljanje veličine canvasa
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Inicijalne postavke igre
const ballRadius = 10; // Radijus loptice
const paddleHeight = 20; // Visina palice
const paddleWidth = canvas.width / 8; // Širina palice, dinamično postavljena na 1/8 širine ekrana
const brickRowCount = 5; // Broj redova cigli
const brickColumnCount = 8; // Broj stupaca cigli
const brickWidth = canvas.width / 9; // Širina cigle, manje od 1/8 za postavljanje unutar prozora
const brickHeight = 20; // Visina svake cigle
const brickPadding = 10; // Prostor između cigli
const brickOffsetTop = 30; // Gornji odmak cigli
const brickOffsetLeft = 70; // Lijevi odmak cigli
let score = 0; // Početni rezultat
let highScore = parseInt(localStorage.getItem('highScore')) || 0; // Učitavanje najboljeg rezultata iz lokalne pohrane
let x, y, dx, dy, paddleX, rightPressed, leftPressed;

// Inicijalizacija loptice, palice i stanja igre
function init() {
    score = 0;
    x = canvas.width / 2;
    y = canvas.height - 30;

    // Generiranje slučajnog početnog kuta za lopticu
    let angle = Math.random() * Math.PI / 3 + Math.PI / 3; // Ograničava kut između 60 i 120 stupnjeva
    dx = 15 * Math.cos(angle); // Brzina loptice na x-osi
    dy = -15 * Math.sin(angle); // Brzina loptice na y-osi

    paddleX = (canvas.width - paddleWidth) / 2; // Postavljanje palice na središte
    rightPressed = false;
    leftPressed = false;
    for(let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for(let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 }; // Postavljanje cigli sa statusom 1 (aktivno)
        }
    }
    draw();  // Početak igre
}


// Spremanje cigli u array
const bricks = [];

let isGameOver = false;  // Kontrola rada igre

// Slušanje događaja tipkovnice
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
    if(e.key == 'Right' || e.key == 'ArrowRight') {
        rightPressed = true;
    }
    else if(e.key == 'Left' || e.key == 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (isGameOver) {
        document.location.reload(); // Ako je igra gotova, ponovno pokreni igru
        return;
    }
    if(e.key == 'Right' || e.key == 'ArrowRight') {
        rightPressed = false;
    }
    else if(e.key == 'Left' || e.key == 'ArrowLeft') {
        leftPressed = false;
    }
}

// Crtanje loptice
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// Crtanje palice
function drawPaddle() {
    ctx.beginPath();
    ctx.shadowBlur = 5;  // Dodano sjenčanje
    ctx.shadowColor = "white";  // Boja sjene
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;  // Resetiranje sjenčanja nakon crtanja
}

// Crtanje cigli
function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0095DD';
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Detekcija sudara
function collisionDetection() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status == 1) {
                if(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if(score == brickRowCount * brickColumnCount) {
                        winGame();  // Poziva funkciju koja prikazuje poruku pobjede
                    }
                }
            }
        }
    }
}

function gameOver() {
    isGameOver = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Očisti platno prije prikaza poruke za završetak igre
    ctx.font = '48px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = '24px Arial';
    ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 60);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

function winGame() {
    isGameOver = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Očisti platno prije prikaza poruke za pobjedu igre
    ctx.font = '48px Arial';
    ctx.fillStyle = 'green';
    ctx.textAlign = 'center';
    ctx.fillText('Congratulations! You win!', canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = '24px Arial';
    ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 60);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

// Prikaz rezultata
function drawScore() {
    const totalBricks = brickRowCount * brickColumnCount; // Ukupan broj cigli
    ctx.font = '24px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.textAlign = 'right'; // Tekst poravnan desno

    // Prikaz trenutnog rezultata i maksimalnog rezultata te rekordnog rezultata
    ctx.fillText('Score/Max Score: ' + score + '/' + totalBricks + '     High Score: ' + highScore, canvas.width - 10, 20);

}


// Ažuriranje igre, crtanje elemenata i provjera stanja igre
function draw() {
    // Provjerava je li igra završila. Ako je, zaustavlja izvršavanje funkcije i prekida animaciju.
    if (isGameOver) {
        return;
    }

    // Briše cijeli canvas kako bi se mogli iscrtati novi frameovi bez tragova prethodnih.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Poziva funkcije za crtanje cigli, loptice, palice i rezultata.
    drawBricks();  // Crtanje cigli na platnu
    drawBall();    // Crtanje loptice
    drawPaddle();  // Crtanje palice
    drawScore();   // Prikaz trenutnog rezultata i najvišeg rezultata

    // Poziva funkciju za detekciju sudara.
    collisionDetection();

    // Provjera kolizije loptice s rubovima canvasa.
    // Ako loptica dodirne lijevi ili desni rub, mijenja smjer na x-osi.
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    // Ako loptica dodirne gornji rub, mijenja smjer na y-osi.
    if (y + dy < ballRadius) {
        dy = -dy;
    } 
    // Ako loptica padne ispod donjeg ruba i ne udari u palicu, igra završava.
    else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy; // Ako loptica udari u palicu, mijenja smjer na y-osi
        } else {
            gameOver(); // Poziva funkciju koja završava igru
        }
    }

    // Upravljanje kretanjem palice pomoću tipkovnice.
    // Ako je desna tipka pritisnuta i palica nije na desnom rubu, pomakni palicu desno.
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 15;
    }
    // Ako je lijeva tipka pritisnuta i palica nije na lijevom rubu, pomakni palicu lijevo.
    else if (leftPressed && paddleX > 0) {
        paddleX -= 15;
    }

    // Ažuriranje pozicije loptice za njezinu brzinu na x i y osi.
    x += dx;
    y += dy;

    // Rekurzivni poziv funkcije draw() pomoću requestAnimationFrame kako bi se nastavila animacija igre.
    requestAnimationFrame(draw);
}

init();  // Inicijalizacija igre