let currentUsername = "";
let currentChallengeCode = null;

// Echte AdMob IDs aus deinem AdMob-Konto
const ADMOB_APP_ID = "ca-app-pub-8480998273721673~9196340457";
const ADMOB_REWARDED_ID = "ca-app-pub-8480998273721673/7092921292";

const puzzles = {
    beginner: [
        5, 3, 0, 0, 7, 8, 9, 1, 2,
        6, 7, 2, 1, 9, 5, 3, 0, 8,
        1, 9, 8, 3, 4, 2, 5, 6, 0,
        8, 5, 0, 7, 6, 1, 4, 2, 3,
        4, 2, 6, 8, 5, 3, 0, 9, 1,
        7, 1, 3, 9, 2, 0, 8, 5, 6,
        9, 6, 1, 5, 3, 7, 2, 8, 0,
        2, 0, 7, 4, 1, 9, 6, 3, 5,
        3, 4, 5, 2, 8, 0, 1, 7, 9
    ],
    easy: [
        5,3,0,0,7,0,0,0,0, 6,0,0,1,9,5,0,0,0, 0,9,8,0,0,0,0,6,0, 
        8,0,0,0,6,0,0,0,3, 4,0,0,8,0,3,0,0,1, 7,0,0,0,2,0,0,0,6, 
        0,6,0,0,0,0,2,8,0, 0,0,0,4,1,9,0,0,5, 0,0,0,0,8,0,0,7,9
    ],
    medium: [
        0,0,0,6,0,0,4,0,0, 7,0,0,0,0,3,6,0,0, 0,0,0,0,9,1,0,8,0, 
        0,0,0,0,0,0,0,0,0, 0,5,0,1,8,0,0,0,3, 0,0,0,3,0,6,0,4,5, 
        0,4,0,2,0,0,0,6,0, 9,0,3,0,0,0,0,0,0, 0,2,0,0,0,0,1,0,0
    ],
    hard: [
        0,0,0,0,0,0,0,1,2, 0,0,0,0,0,0,0,0,3, 0,0,2,3,0,0,4,0,0, 
        0,0,1,8,0,0,0,0,5, 0,6,0,0,7,0,8,0,0, 0,0,0,0,0,9,0,0,0, 
        0,0,8,5,0,0,0,0,0, 9,0,0,0,4,0,5,0,0, 4,7,0,0,0,6,0,0,0
    ]
};

const solutions = {
    beginner: [
        5, 3, 4, 6, 7, 8, 9, 1, 2,
        6, 7, 2, 1, 9, 5, 3, 4, 8,
        1, 9, 8, 3, 4, 2, 5, 6, 7,
        8, 5, 9, 7, 6, 1, 4, 2, 3,
        4, 2, 6, 8, 5, 3, 7, 9, 1,
        7, 1, 3, 9, 2, 4, 8, 5, 6,
        9, 6, 1, 5, 3, 7, 2, 8, 4,
        2, 8, 7, 4, 1, 9, 6, 3, 5,
        3, 4, 5, 2, 8, 6, 1, 7, 9
    ],
    easy: [
        5,3,4,6,7,8,9,1,2, 6,7,2,1,9,5,3,4,8, 1,9,8,3,4,2,5,6,7, 
        8,5,9,7,6,1,4,2,3, 4,2,6,8,5,3,7,9,1, 7,1,3,9,2,4,8,5,6, 
        9,6,1,5,3,7,2,8,4, 2,8,7,4,1,9,6,3,5, 3,4,5,2,8,6,1,7,9
    ],
    medium: [
        5,8,1,6,7,2,4,3,9, 7,9,2,8,4,3,6,5,1, 3,6,4,5,9,1,7,8,2, 
        4,3,8,9,5,7,2,1,6, 2,5,6,1,8,4,9,7,3, 1,7,9,3,2,6,8,4,5, 
        8,4,5,2,1,9,3,6,7, 9,1,3,7,6,5,8,2,4, 6,2,7,4,3,8,1,9,5
    ],
    hard: [
        6,3,4,7,9,5,8,1,2, 8,1,7,4,2,6,9,5,3, 5,9,2,3,8,1,4,7,6, 
        7,4,1,8,6,3,2,9,5, 3,6,9,2,7,4,8,1,0, 2,8,5,1,5,9,7,3,4, 
        1,2,8,5,3,7,6,4,9, 9,5,6,1,4,2,5,8,7, 4,7,3,9,1,6,2,5,8
    ]
};

let currentPuzzle = [], currentSolution = [], selectedCellIndex = null;
let isNotesMode = false, cellData = [], errorsCount = 0;
const maxErrors = 3;
let timerInterval, secondsPassed = 0, currentLevel = "beginner";

let activeHintData = null;
let currentHintStep = 1;

window.onload = function() {
    const savedName = localStorage.getItem("sudoku_username");
    if (savedName) {
        currentUsername = savedName;
        document.getElementById("player-name-text").innerText = currentUsername;
    } else {
        document.getElementById("name-modal").style.display = "flex";
    }
    checkURLChallenge();
};

function checkURLChallenge() {
    const urlParams = new URLSearchParams(window.location.search);
    const challengeParam = urlParams.get('challenge');
    const levelParam = urlParams.get('level');

    if (challengeParam && levelParam) {
        currentChallengeCode = challengeParam;
        if (puzzles[levelParam]) document.getElementById("difficulty").value = levelParam;
        setTimeout(() => {
            alert(`Du hast eine Herausforderung für "${levelParam.toUpperCase()}" angenommen!`);
            initGameEngine();
        }, 500);
    }
}

function saveUsername() {
    const input = document.getElementById("username-input").value.trim();
    if (input.length < 2) return alert("Mindestens 2 Zeichen eingeben.");
    currentUsername = input;
    localStorage.setItem("sudoku_username", currentUsername);
    document.getElementById("player-name-text").innerText = currentUsername;
    document.getElementById("name-modal").style.display = "none";
}

function resetUsername() {
    localStorage.removeItem("sudoku_username");
    document.getElementById("name-modal").style.display = "flex";
}

function startGame() { document.getElementById("challenge-modal").style.display = "flex"; }
function closeChallengeModal() { document.getElementById("challenge-modal").style.display = "none"; }
function confirmStartSolo() { closeChallengeModal(); initGameEngine(); }

function shareChallengeLink() {
    const level = document.getElementById("difficulty").value;
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const inviteUrl = `${window.location.origin}${window.location.pathname}?challenge=${randomCode}&level=${level}`;
    
    if (navigator.share) {
        navigator.share({ title: 'Sudoku Challenge', text: `Schlägst du meine Zeit?`, url: inviteUrl })
            .then(() => { closeChallengeModal(); initGameEngine(); });
    } else {
        navigator.clipboard.writeText(inviteUrl);
        alert(`Link kopiert:\n${inviteUrl}`);
        closeChallengeModal(); initGameEngine();
    }
}

function initGameEngine() {
    currentLevel = document.getElementById("difficulty").value;
    currentPuzzle = puzzles[currentLevel];
    currentSolution = solutions[currentLevel];

    errorsCount = 0; secondsPassed = 0;
    document.getElementById("error-count").innerText = `Fehler: ${errorsCount}/${maxErrors}`;
    document.getElementById("setup-menu").style.display = "none";
    document.getElementById("status-text").innerText = `Schwierigkeit: ${currentLevel.toUpperCase()}`;

    document.getElementById("status-bar").style.display = "flex";
    document.getElementById("sudoku-board").style.display = "grid";
    document.getElementById("controls").style.display = "flex";
    document.getElementById("numpad").style.display = "flex";

    startTimer();

    const board = document.getElementById("sudoku-board");
    board.innerHTML = "";

    for (let i = 0; i < 81; i++) {
        cellData[i] = { value: currentPuzzle[i], given: currentPuzzle[i] !== 0, isError: false, notes: [] };
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.id = "cell-" + i;

        const row = Math.floor(i / 9), col = i % 9;
        if (col === 2 || col === 5) cell.classList.add("border-right");
        if (row === 2 || row === 5) cell.classList.add("border-bottom");
        if (cellData[i].given) cell.classList.add("given");

        cell.addEventListener("click", () => selectCell(i));
        board.appendChild(cell);
    }
    renderBoard();
}

/* WERBUNG & TIPP-LOGIK */
function requestHintWithAd() {
    const hint = findHiddenSingleHint();
    if (!hint) {
        alert("Aktuell sind keine eindeutigen Tipps verfügbar. Fülle erst andere Felder aus!");
        return;
    }

    activeHintData = hint;

    // Prüft, ob echte App oder Browser in Koder
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
        const AdMob = window.Capacitor.Plugins.AdMob;
        AdMob.prepareRewardVideoAd({ adId: ADMOB_REWARDED_ID })
            .then(() => AdMob.showRewardVideoAd())
            .then(() => startInteractiveHint())
            .catch(err => runAdSimulation());
    } else {
        runAdSimulation();
    }
}

function runAdSimulation() {
    document.getElementById("ad-modal").style.display = "flex";
    let countdown = 3;
    document.getElementById("ad-timer-display").innerText = `${countdown} Sek.`;

    const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            document.getElementById("ad-timer-display").innerText = `${countdown} Sek.`;
        } else {
            clearInterval(interval);
            document.getElementById("ad-modal").style.display = "none";
            startInteractiveHint();
        }
    }, 1000);
}

function findHiddenSingleHint() {
    for (let i = 0; i < 81; i++) {
        if (cellData[i].value === 0) {
            const correctVal = currentSolution[i];
            const targetRow = Math.floor(i / 9);
            const targetCol = i % 9;
            const targetBlock = Math.floor(targetRow / 3) * 3 + Math.floor(targetCol / 3);

            let sources = [];
            let blockingCells = [];

            for (let j = 0; j < 81; j++) {
                if (cellData[j].value === correctVal) {
                    sources.push(j);
                    const r = Math.floor(j / 9), c = j % 9;
                    for (let b = 0; b < 81; b++) {
                        if (Math.floor(b / 9) === r || b % 9 === c) {
                            if (Math.floor(Math.floor(b / 9) / 3) * 3 + Math.floor((b % 9) / 3) === targetBlock) {
                                blockingCells.push(b);
                            }
                        }
                    }
                }
            }

            if (sources.length > 0) {
                return {
                    targetIndex: i,
                    number: correctVal,
                    sources: sources,
                    blockingCells: blockingCells,
                    targetBlock: targetBlock
                };
            }
        }
    }
    return null;
}

function startInteractiveHint() {
    currentHintStep = 1;
    document.getElementById("hint-explanation-modal").style.display = "block";
    updateHintUI();
}

function updateHintUI() {
    renderBoard();
    const h = activeHintData;
    const title = document.getElementById("hint-title");
    const text = document.getElementById("hint-text");
    const nextBtn = document.getElementById("hint-next-btn");

    if (currentHintStep === 1) {
        title.innerText = "Letzte Zelle";
        text.innerHTML = `Achte auf <span style="color: green; font-weight: bold;">diese Zahlen (${h.number})</span> und die hervorgehobenen Bereiche.`;
        nextBtn.innerText = "Weiter ▶️";

        h.sources.forEach(idx => document.getElementById("cell-" + idx).classList.add("hint-number-src"));
        h.blockingCells.forEach(idx => document.getElementById("cell-" + idx).classList.add("hint-block-bg"));

    } else if (currentHintStep === 2) {
        title.innerText = "Letzte Zelle";
        text.innerHTML = `In diesem <b>Block</b> gibt es nur noch eine Zelle, die die <b>${h.number}</b> enthalten kann.`;
        nextBtn.innerText = "Eintragen ▶️";

        h.sources.forEach(idx => document.getElementById("cell-" + idx).classList.add("hint-number-src"));
        h.blockingCells.forEach(idx => document.getElementById("cell-" + idx).classList.add("hint-block-bg"));

        for (let i = 0; i < 81; i++) {
            const r = Math.floor(i / 9), c = i % 9;
            if (Math.floor(r / 3) * 3 + Math.floor(c / 3) === h.targetBlock) {
                document.getElementById("cell-" + i).classList.add("hint-target-box");
            }
        }

    } else if (currentHintStep === 3) {
        title.innerText = "Erfolgreich!";
        text.innerText = `Die Zahl ${h.number} wurde eingetragen.`;
        
        cellData[h.targetIndex].value = h.number;
        cellData[h.targetIndex].given = true;
        renderBoard();
        
        document.getElementById("cell-" + h.targetIndex).classList.add("hint-target-cell");
        
        setTimeout(() => {
            document.getElementById("hint-explanation-modal").style.display = "none";
            renderBoard();
            checkGame();
        }, 1500);
    }
}

function nextHintStep() {
    if (currentHintStep < 3) {
        currentHintStep++;
        updateHintUI();
    }
}

function prevHintStep() {
    if (currentHintStep > 1) {
        currentHintStep--;
        updateHintUI();
    }
}

function pauseGame() { clearInterval(timerInterval); document.getElementById("pause-modal").style.display = "flex"; }
function resumeGame() { document.getElementById("pause-modal").style.display = "none"; startTimer(); }
function restartGame() { document.getElementById("pause-modal").style.display = "none"; initGameEngine(); }

function exitGame() {
    clearInterval(timerInterval);
    document.getElementById("pause-modal").style.display = "none";
    document.getElementById("status-bar").style.display = "none";
    document.getElementById("sudoku-board").style.display = "none";
    document.getElementById("controls").style.display = "none";
    document.getElementById("numpad").style.display = "none";
    document.getElementById("setup-menu").style.display = "block";
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsPassed++;
        const m = String(Math.floor(secondsPassed / 60)).padStart(2, '0');
        const s = String(secondsPassed % 60).padStart(2, '0');
        document.getElementById("timer").innerText = `Zeit: ${m}:${s}`;
    }, 1000);
}

function selectCell(index) { selectedCellIndex = index; renderBoard(); }

function toggleNotes() {
    isNotesMode = !isNotesMode;
    const btn = document.getElementById("notes-btn");
    btn.innerText = isNotesMode ? "Notizen: ON" : "Notizen: OFF";
    btn.classList.toggle("active", isNotesMode);
}

function pressNumber(num) {
    if (selectedCellIndex === null) return;
    const data = cellData[selectedCellIndex];
    if (data.given) return;

    if (isNotesMode) {
        const idx = data.notes.indexOf(num);
        if (idx > -1) data.notes.splice(idx, 1);
        else data.notes.push(num);
    } else {
        data.value = num;
        data.notes = [];

        if (num !== currentSolution[selectedCellIndex]) {
            data.isError = true;
            errorsCount++;
            document.getElementById("error-count").innerText = `Fehler: ${errorsCount}/${maxErrors}`;
            if (errorsCount >= maxErrors) {
                clearInterval(timerInterval);
                setTimeout(() => alert("Game Over! 3 Fehler erreicht."), 100);
            }
        } else {
            data.isError = false;
        }
    }
    renderBoard();
    checkGame();
}

function eraseCell() {
    if (selectedCellIndex === null || cellData[selectedCellIndex].given) return;
    cellData[selectedCellIndex].value = 0;
    cellData[selectedCellIndex].isError = false;
    cellData[selectedCellIndex].notes = [];
    renderBoard();
}

function renderBoard() {
    let selVal = selectedCellIndex !== null ? cellData[selectedCellIndex].value : 0;

    for (let i = 0; i < 81; i++) {
        const cell = document.getElementById("cell-" + i);
        const data = cellData[i];
        cell.className = "cell";

        const row = Math.floor(i / 9), col = i % 9;
        if (col === 2 || col === 5) cell.classList.add("border-right");
        if (row === 2 || row === 5) cell.classList.add("border-bottom");
        if (data.given) cell.classList.add("given");

        if (i === selectedCellIndex) cell.classList.add("selected");
        else if (selVal !== 0 && data.value === selVal) cell.classList.add("highlight-same");

        if (data.value !== 0) {
            cell.innerText = data.value;
            if (data.isError) cell.classList.add("error");
        } else if (data.notes.length > 0) {
            let gridHtml = '<div class="notes-grid">';
            for (let n = 1; n <= 9; n++) gridHtml += `<div class="note-num">${data.notes.includes(n) ? n : ''}</div>`;
            gridHtml += '</div>';
            cell.innerHTML = gridHtml;
        } else {
            cell.innerText = "";
        }
    }
}

function checkGame() {
    let complete = cellData.every((c, i) => c.value === currentSolution[i]);
    if (complete && errorsCount < maxErrors) {
        clearInterval(timerInterval);
        const t = document.getElementById("timer").innerText.replace("Zeit: ", "");
        saveScore(currentUsername, currentLevel, secondsPassed, t);
        alert(`Glückwunsch! Gelöst in ${t}`);
        showLeaderboard();
    }
}

function saveScore(name, level, seconds, formattedTime) {
    let scores = JSON.parse(localStorage.getItem("sudoku_scores")) || [];
    scores.push({ name: name, level: level.toUpperCase(), seconds: seconds, time: formattedTime });
    scores.sort((a, b) => a.seconds - b.seconds);
    localStorage.setItem("sudoku_scores", JSON.stringify(scores));
}

function showLeaderboard() {
    let scores = JSON.parse(localStorage.getItem("sudoku_scores")) || [];
    const container = document.getElementById("leaderboard-content");
    if (scores.length === 0) container.innerHTML = "<p>Keine Einträge vorhanden.</p>";
    else {
        let html = "";
        scores.forEach((s, idx) => {
            html += `<div class="lb-item"><span><b>#${idx + 1} ${s.name}</b> (${s.level})</span><span>⏱️ ${s.time}</span></div>`;
        });
        container.innerHTML = html;
    }
    document.getElementById("leaderboard-modal").style.display = "flex";
}

function closeLeaderboard() {
    document.getElementById("leaderboard-modal").style.display = "none";
    if (document.getElementById("sudoku-board").style.display === "grid") exitGame();
}
