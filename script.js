// Sudoku Challenge - script.js

let board = Array(81).fill(0);
let solution = Array(81).fill(0);
let initialBoard = Array(81).fill(0);
let selectedCell = -1;
let mistakes = 0;
const maxMistakes = 3;
let timerInterval = null;
let seconds = 0;
let isPaused = false;
let notesMode = false;

// 1. Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    initBoardDOM();
    startNewGame();
    setupEventListeners();
});

function initBoardDOM() {
    const boardElement = document.getElementById('sudoku-board');
    if (!boardElement) return;
    boardElement.innerHTML = '';
    
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => selectCell(i));
        boardElement.appendChild(cell);
    }
}

function setupEventListeners() {
    // Nummern-Buttons (1-9)
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const num = parseInt(e.target.dataset.value || e.target.innerText);
            if (num >= 1 && num <= 9) {
                handleNumberInput(num);
            }
        });
    });

    // Löschen Button
    const eraseBtn = document.getElementById('erase-btn');
    if (eraseBtn) eraseBtn.addEventListener('click', eraseCell);

    // Notizen Button
    const notesBtn = document.getElementById('notes-btn');
    if (notesBtn) {
        notesBtn.addEventListener('click', () => {
            notesMode = !notesMode;
            notesBtn.innerText = `Notizen: ${notesMode ? 'ON' : 'OFF'}`;
            notesBtn.classList.toggle('active', notesMode);
        });
    }

    // Tipp (Ad) Button
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) hintBtn.addEventListener('click', showHintAd);
}

// 2. Spiel-Logik & Generierung
function startNewGame() {
    resetTimer();
    mistakes = 0;
    updateMistakesDisplay();
    selectedCell = -1;

    // Beispielsudoku (wird später dynamisch generiert)
    const sampleBoard = [
        5,3,0, 0,7,0, 0,0,0,
        6,0,0, 1,9,5, 0,0,0,
        0,9,8, 0,0,0, 0,6,0,

        8,0,0, 0,6,0, 0,0,3,
        4,0,0, 8,0,3, 0,0,1,
        7,0,0, 0,2,0, 0,0,6,

        0,6,0, 0,0,0, 2,8,0,
        0,0,0, 4,1,9, 0,0,5,
        0,0,0, 0,8,0, 0,7,9
    ];

    const sampleSolution = [
        5,3,4, 6,7,8, 9,1,2,
        6,7,2, 1,9,5, 3,4,8,
        1,9,8, 3,4,2, 5,6,7,

        8,5,9, 7,6,1, 4,2,3,
        4,2,6, 8,5,3, 7,9,1,
        7,1,3, 9,2,4, 8,5,6,

        9,6,1, 5,3,7, 2,8,4,
        2,8,7, 4,1,9, 6,3,5,
        3,4,5, 2,8,6, 1,7,9
    ];

    board = [...sampleBoard];
    initialBoard = [...sampleBoard];
    solution = [...sampleSolution];

    renderBoard();
    updateNumberButtons();
    startTimer();
}

function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, i) => {
        cell.classList.remove('selected', 'given', 'user-filled', 'error');
        cell.innerText = board[i] !== 0 ? board[i] : '';

        if (initialBoard[i] !== 0) {
            cell.classList.add('given');
        } else if (board[i] !== 0) {
            cell.classList.add('user-filled');
            if (board[i] !== solution[i]) {
                cell.classList.add('error');
            }
        }

        if (i === selectedCell) {
            cell.classList.add('selected');
        }
    });
}

function selectCell(index) {
    selectedCell = index;
    renderBoard();
}

function handleNumberInput(num) {
    if (selectedCell === -1 || initialBoard[selectedCell] !== 0 || isPaused) return;

    if (board[selectedCell] === num) return; // Bereits eingetragen

    board[selectedCell] = num;

    if (num !== solution[selectedCell]) {
        mistakes++;
        updateMistakesDisplay();
        if (mistakes >= maxMistakes) {
            alert("Game Over! Zu viele Fehler.");
            startNewGame();
            return;
        }
    }

    renderBoard();
    updateNumberButtons(); // Zählt die Zahlen durch und sperrt fertige Buttons
    checkWinCondition();
}

function eraseCell() {
    if (selectedCell === -1 || initialBoard[selectedCell] !== 0 || isPaused) return;
    board[selectedCell] = 0;
    renderBoard();
    updateNumberButtons();
}

// 3. Automatisches Deaktivieren/Ausgrauen der Nummern-Buttons
function updateNumberButtons() {
    const counts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};

    // Zähle korrekte Zahlen auf dem Feld
    board.forEach((val, index) => {
        if (val >= 1 && val <= 9 && val === solution[index]) {
            counts[val]++;
        }
    });

    // Aktualisiere die Buttons unten
    document.querySelectorAll('.num-btn').forEach(btn => {
        const val = parseInt(btn.dataset.value || btn.innerText);
        if (val >= 1 && val <= 9) {
            if (counts[val] >= 9) {
                btn.classList.add('disabled');
                btn.style.opacity = '0.2';
                btn.style.pointerEvents = 'none';
            } else {
                btn.classList.remove('disabled');
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        }
    });
}

// 4. Timer & UI Funktionen
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused) {
            seconds++;
            const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
            const secs = String(seconds % 60).padStart(2, '0');
            const timerEl = document.getElementById('timer');
            if (timerEl) timerEl.innerText = `${mins}:${secs}`;
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.innerText = '00:00';
}

function updateMistakesDisplay() {
    const mistakesEl = document.getElementById('mistakes');
    if (mistakesEl) mistakesEl.innerText = `${mistakes}/${maxMistakes}`;
}

function checkWinCondition() {
    const isComplete = board.every((val, i) => val === solution[i]);
    if (isComplete) {
        clearInterval(timerInterval);
        setTimeout(() => alert("Glückwunsch! Du hast das Sudoku gelöst! 🎉"), 200);
    }
}

// 5. AdMob / Banner & Tipp Simulation
function showHintAd() {
    if (selectedCell === -1 || initialBoard[selectedCell] !== 0) {
        alert("Bitte wähle zuerst ein leeres Feld aus!");
        return;
    }

    // Wenn nativer AdMob-Code vorhanden ist, hier aufrufen.
    // Ansonsten Web-Simulation nutzen:
    let countdown = 3;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); display: flex; align-items: center;
        justify-content: center; z-index: 9999; color: white; text-align: center;
    `;
    overlay.innerHTML = `
        <div style="background: white; color: #333; padding: 25px; border-radius: 15px; width: 80%; max-width: 320px;">
            <h3>📺 Werbung läuft...</h3>
            <p>Dein kostenloser Tipp wird vorbereitet.</p>
            <h2 id="ad-timer" style="color: #007aff;">${countdown} Sek.</h2>
        </div>
    `;
    document.body.appendChild(overlay);

    const timer = setInterval(() => {
        countdown--;
        const timerText = document.getElementById('ad-timer');
        if (timerText) timerText.innerText = `${countdown} Sek.`;

        if (countdown <= 0) {
            clearInterval(timer);
            document.body.removeChild(overlay);
            // Tipp eintragen
            board[selectedCell] = solution[selectedCell];
            renderBoard();
            updateNumberButtons();
            checkWinCondition();
        }
    }, 1000);
}
