//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardwidth = tileSize * columns;
let boardheight = tileSize * rows;
let context;

//ship
let shipwidth = tileSize*2;
let shipheight = tileSize*2;
let shipx = tileSize * columns/2 - tileSize;
let shipy = tileSize * rows - tileSize*2;

let ship = {
    x : shipx,
    y : shipy,
    width : shipwidth,
    height : shipheight
}

let shipimg;
let shipVelocityX = tileSize;

//aliens
let alienArray = [];
let alienwidth = tileSize + 10;
let alienheight = tileSize + 5;
let alienx = tileSize;
let alieny = tileSize;
let alienimg;

let alienrows = 2;
let aliencolumns = 3;
let aliencount = 0;  // keep track of how many aliens are left
let alienVelocityx = 1;

//bullets
let bulletArray = [];  // unified naming of the array
let bulletVelocityY = -10;

//score
let score = 0;
let gameOver= false;



window.onload = function() {
    board = document.getElementById("board")
    board.width = boardwidth;
    board.height = boardheight;
    context = board.getContext("2d");

    shipimg = new Image();
    shipimg.src ="assets/SPCI_Ship.png";
    shipimg.onload = function() {
        context.drawImage(shipimg, ship.x, ship.y, ship.width, ship.height);
    }   

    alienimg = new Image();
    alienimg.src = "assets/SPCI_enemy.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip); //hold for move/ or tap
    document.addEventListener("keyup", shootBullet); //rapid fire
}

function update() {
    requestAnimationFrame(update);
    
    //game over
    if (gameOver){
        return;
    }

    context.clearRect(0, 0, boardwidth, boardheight);

    //ship
    context.drawImage(shipimg, ship.x, ship.y, ship.width, ship.height);

    //aliens
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityx;

            //alien touches border
            if (alien.x + alien.width >= boardwidth || alien.x <= 0) {
                alienVelocityx *= -1;
                alien.x += alienVelocityx*2;

                //move one down
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienheight;
                }
            }
            context.drawImage(alienimg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
        
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "red";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet hits alien
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                aliencount--;  // reduce alien count
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    //next level
    if (aliencount == 0) {
        //increase number of aliens
        aliencolumns = Math.min(aliencolumns + 1, columns / 2 - 2);
        alienrows = Math.min(alienrows + 1, rows - 4);
        alienVelocityx -= 0.2; //speed up the aliens
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //score
    context.fillStyle = "red";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

function moveShip(e) {

    if(gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= boardwidth) {
        ship.x += shipVelocityX;
    }   
}

function createAliens() {
    for (let c = 0; c < alienrows; c++) {
        for (let r = 0; r < aliencolumns; r++) {
            let alien = {
                img: alienimg,
                x: alienx + c * alienwidth,
                y: alieny + r * alienheight,
                width: alienwidth,
                height: alienheight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    aliencount = alienArray.length;  // reset alien count based on new aliens
}

function shootBullet(e) {

    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        let bullet = {
            x: ship.x + ship.width * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        }
        bulletArray.push(bullet);
    }

}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

//disable spacebar scrolling
window.onkeydown = function(e) { 
    return !(e.keyCode == 32);
};
