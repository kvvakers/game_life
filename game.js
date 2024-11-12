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

// Очистить сетку (все клетки мертвые)
function clearGrid() {
    grid = createGrid();  // Обнуляем всю сетку
    drawGrid();  // Перерисовываем пустую сетку
}

// Нарисовать пустую сетку сразу
drawGrid();

// Обработчик кликов по клеткам для изменения их состояния
canvas.addEventListener('click', (event) => {
    if (isStarted) return;  // Если игра началась, нельзя менять клетки

    const x = Math.floor(event.offsetX / cellSize);
    const y = Math.floor(event.offsetY / cellSize);

    // Переключаем состояние клетки
    grid[y][x] = grid[y][x] === 1 ? 0 : 1;

    // Перерисовываем сетку после изменения
    drawGrid();
});

// Обработчик для кнопки запуска игры
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", () => {
    isStarted = true; // Игра начинается
    startAnimation(); // Запуск анимации
    startButton.disabled = true; // Делаем кнопку неактивной, чтобы нельзя было изменить поле
});

// Обработчик для кнопки паузы
const pauseButton = document.getElementById("pauseButton");
pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;  // Переключаем состояние паузы
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';  // Меняем текст на кнопке
});

// Обработчик для кнопки стопа
const stopButton = document.getElementById("stopButton");
stopButton.addEventListener("click", () => {
    stopAnimation();  // Останавливаем анимацию
    clearGrid();  // Очищаем поле
    startButton.disabled = false; // Включаем кнопку старта
    isStarted = false; // Игра еще не началась
});

// Валидация ввода размера сетки
function validateGridSize(inputValue) {
    const value = parseInt(inputValue, 10);
    return !isNaN(value) && value > 0;
}

// Обработчик для кнопки применения размера сетки
const applyButton = document.getElementById("applyButton");
applyButton.addEventListener("click", () => {
    const colsInput = document.getElementById("colsInput").value;
    const rowsInput = document.getElementById("rowsInput").value;

    if (validateGridSize(colsInput) && validateGridSize(rowsInput)) {
        cols = parseInt(colsInput, 10);
        rows = parseInt(rowsInput, 10);
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;
        grid = createGrid(); // Обновляем сетку
        drawGrid(); // Перерисовываем сетку с новыми размерами
        startButton.disabled = false; // Разрешаем запуск игры
    } else {
        alert("Please enter valid positive numbers greater than zero.");
    }
});

// Сохраняем состояние в историю
function saveState() {
    if (currentStep === history.length - 1) {
        history.push(JSON.parse(JSON.stringify(grid))); // Сохраняем копию текущего состояния
    } else {
        history = history.slice(0, currentStep + 1); // Отрезаем "будущие" состояния
        history.push(JSON.parse(JSON.stringify(grid)));
    }
    currentStep++; // Переходим на следующий шаг в истории
}

// Кнопка "Step Backward"
const stepBackwardButton = document.getElementById("stepBackwardButton");
stepBackwardButton.addEventListener("click", () => {
    if (currentStep > 0) { // Шагать назад можно только если не на самом первом шаге
        currentStep--;
        grid = JSON.parse(JSON.stringify(history[currentStep])); // Возвращаемся на шаг назад
        drawGrid();
    }
});

// Кнопка "Step Forward"
const stepForwardButton = document.getElementById("stepForwardButton");
stepForwardButton.addEventListener("click", () => {
    if (currentStep < history.length - 1) { // Шагать вперед можно только если не на самом последнем шаге
        currentStep++;
        grid = JSON.parse(JSON.stringify(history[currentStep])); // Шагаем вперед
        drawGrid();
    }
});

// Функция для случайного заполнения клеток
function randomFillGrid() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j] = Math.random() < 0.3 ? 1 : 0;  // 30% вероятности для живой клетки
        }
    }
    history = [JSON.parse(JSON.stringify(grid))]; // Очищаем историю после случайного заполнения
    currentStep = 0;
    drawGrid();
}

// Привязка кнопки случайного заполнения
const randomFillButton = document.getElementById("randomFillButton");
randomFillButton.addEventListener("click", randomFillGrid);

// Функция для проверки окончания игры
function checkGameOver() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                return false; // Есть хотя бы одна живая клетка
            }
        }
    }
    return true; // Все клетки мертвые
}
