const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const liveColorPicker = document.getElementById("liveColor");
const deadColorPicker = document.getElementById("deadColor");

let cols = 50; 
let rows = 50;
const cellSize = 10;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let grid = createGrid();
let history = []; 
let currentStep = -1; 
let isStarted = false; 
let isPaused = false;

function createGrid() {
    const grid = new Array(rows);
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols).fill(0);
    }
    return grid;
}

function drawGrid() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            ctx.fillStyle = grid[i][j] === 1 ? liveColorPicker.value : deadColorPicker.value;
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize); // Сетка
        }
    }
}

function updateGrid() {
    const newGrid = createGrid();

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const neighbors = countNeighbors(i, j);

            if (grid[i][j] === 1) {
                if (neighbors < 2 || neighbors > 3) {
                    newGrid[i][j] = 0;
                } else {
                    newGrid[i][j] = 1;
                }
            } else {
                if (neighbors === 3) {
                    newGrid[i][j] = 1;
                }
            }
        }
    }

    grid = newGrid;
    saveState(); 

    if (checkGameOver()) {
        stopAnimation();
        clearGrid();
        alert("Game Over");
    }
}

function countNeighbors(x, y) {
    let count = 0;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const ni = x + i;
            const nj = y + j;

            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                count += grid[ni][nj];
            }
        }
    }
    return count;
}

const frameRate = 200;
let animationInterval;

function startAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
    }

    animationInterval = setInterval(() => {
        if (!isPaused) {
            drawGrid();
            updateGrid();
        }
    }, frameRate);
}

function stopAnimation() {
    clearInterval(animationInterval);
}

function clearGrid() {
    grid = createGrid(); 
    drawGrid();  
}

drawGrid();

canvas.addEventListener('click', (event) => {
    if (isStarted) return;  

    const x = Math.floor(event.offsetX / cellSize);
    const y = Math.floor(event.offsetY / cellSize);

    grid[y][x] = grid[y][x] === 1 ? 0 : 1;

    drawGrid();
});

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", () => {
    isStarted = true; 
    startAnimation(); 
    startButton.disabled = true; 
});

const pauseButton = document.getElementById("pauseButton");
pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;  
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause'; 
});


const stopButton = document.getElementById("stopButton");
stopButton.addEventListener("click", () => {
    stopAnimation(); 
    clearGrid();  
    startButton.disabled = false; 
    isStarted = false; 
});


function validateGridSize(inputValue) {
    const value = parseInt(inputValue, 10);
    return !isNaN(value) && value > 0;
}


const applyButton = document.getElementById("applyButton");
applyButton.addEventListener("click", () => {
    const colsInput = document.getElementById("colsInput").value;
    const rowsInput = document.getElementById("rowsInput").value;

    if (validateGridSize(colsInput) && validateGridSize(rowsInput)) {
        cols = parseInt(colsInput, 10);
        rows = parseInt(rowsInput, 10);
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;
        grid = createGrid(); 
        drawGrid();
        startButton.disabled = false; 
    } else {
        alert("Please enter valid positive numbers greater than zero.");
    }
});

function saveState() {
    if (currentStep === history.length - 1) {
        history.push(JSON.parse(JSON.stringify(grid))); 
    } else {
        history = history.slice(0, currentStep + 1); 
        history.push(JSON.parse(JSON.stringify(grid)));
    }
    currentStep++;
}

const stepBackwardButton = document.getElementById("stepBackwardButton");
stepBackwardButton.addEventListener("click", () => {
    if (currentStep > 0) { 
        currentStep--;
        grid = JSON.parse(JSON.stringify(history[currentStep]));
        drawGrid();
    }
});

const stepForwardButton = document.getElementById("stepForwardButton");
stepForwardButton.addEventListener("click", () => {
    if (currentStep < history.length - 1) { 
        currentStep++;
        grid = JSON.parse(JSON.stringify(history[currentStep])); 
        drawGrid();
    }
});

function randomFillGrid() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j] = Math.random() < 0.3 ? 1 : 0;  
        }
    }
    history = [JSON.parse(JSON.stringify(grid))]; 
    currentStep = 0;
    drawGrid();
}

const randomFillButton = document.getElementById("randomFillButton");
randomFillButton.addEventListener("click", randomFillGrid);

function checkGameOver() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                return false; 
            }
        }
    }
    return true; 
}
