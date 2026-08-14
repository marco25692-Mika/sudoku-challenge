let board = Array(81).fill(0);
let solution = Array(81).fill(0);
let initialBoard = Array(81).fill(0);
let notes = Array.from({ length: 81 }, () => []);

let selectedCell = -1;
let isNotesMode = false;
let mistakes = 0;
const maxMistakes = 3;
let timerInterval = null;
let seconds = 0;
let currentDifficulty = 'hard';
let selectedStatsDiff = 'hard';
let currentRankingCategory = 'friends';
let currentRankingDiff = 'hard';

let stats = JSON.parse(localStorage.getItem('sudoku_stats_v2')) || {
    easy: { played: 0, won: 0, perfect: 0 },
    medium: { played: 0, won: 0, perfect: 0 },
    hard: { played: 0, won: 0, perfect: 0 },
    expert: { played: 0, won: 0, perfect: 0 }
};

let playerName = localStorage.getItem('sudoku_player') || 'MH7';

// Ranglisten-Datenstruktur aufgeteilt nach Schwierigkeitsgraden
let friendRanking = JSON.parse(localStorage.getItem('sudoku_friend_ranking_v2')) || {
    easy: [
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' },
        { name: 'Alex', wins: 4, bestTime: '01:10' }
    ],
    medium: [
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' },
        { name: 'Sarah', wins: 3, bestTime: '02:05' }
    ],
    hard: [
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' },
        { name: 'Alex', wins: 2, bestTime: '02:15' },
        { name: 'Sarah', wins: 1, bestTime: '03:40' },
        { name: 'Julian', wins: 0, bestTime: '--:--' }
    ],
    expert: [
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' },
        { name: 'Julian', wins: 1, bestTime: '05:12' }
    ]
};

let germanyRanking = {
    easy: [
        { name: 'BavarianSolver', wins: 240, bestTime: '00:45' },
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' }
    ],
    medium: [
        { name: 'SudokuKing_DE', wins: 190, bestTime: '01:00' },
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' }
    ],
    hard: [
        { name: 'BavarianSolver', wins: 142, bestTime: '01:12' },
        { name: 'SudokuKing_DE', wins: 128, bestTime: '01:19' },
        { name: 'BerlinBrain', wins: 115, bestTime: '01:25' },
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' },
        { name: 'LogicQueen', wins: 94, bestTime: '01:30' }
    ],
    expert: [
        { name: 'BerlinBrain', wins: 75, bestTime: '02:40' },
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' }
    ]
};

let globalRanking = {
    easy: [
        { name: 'SpeedSolver_99', wins: 600, bestTime: '00:30' },
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' }
    ],
    medium: [
        { name: 'ZenMaster', wins: 510, bestTime: '00:42' },
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' }
    ],
    hard: [
        { name: 'SpeedSolver_99', wins: 410, bestTime: '00:54' },
        { name: 'ZenMaster', wins: 385, bestTime: '00:58' },
        { name: 'NihonSudoku', wins: 350, bestTime: '01:02' },
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' },
        { name: 'GridWizard', wins: 312, bestTime: '01:05' }
    ],
    expert: [
        { name: 'ZenMaster', wins: 180, bestTime: '02:10' },
        { name: 'MH7 (Du)', wins: 0, bestTime: '--:--' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    updatePlayerUI();
    initBoardDOM();
    setupEventListeners();
    updateStatsUI('hard');
    updateRankingUI();

    const urlParams = new URLSearchParams(window.location.search);
    const duellCode = urlParams.get('duell');
    const urlDiff = urlParams.get('diff');
    
    if (duellCode) {
        if (urlDiff && ['easy', 'medium', 'hard', 'expert'].includes(urlDiff)) {
            currentDifficulty = urlDiff;
            const diffSelect = document.getElementById('difficulty');
            if (diffSelect) diffSelect.value = urlDiff;
        }
        startGameDirectly();
    }
});

function getDifficultyName(diff) {
    const names = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer', expert: 'Experte' };
    return names[diff] || 'Leicht';
}

function updatePlayerUI() {
    const el = document.getElementById('player-display');
    if (el) el.innerText = playerName;

    ['easy', 'medium', 'hard', 'expert'].forEach(diff => {
        let selfEntry = friendRanking[diff].find(f => f.name.includes('(Du)'));
        if (selfEntry) {
            selfEntry.name = `${playerName} (Du)`;
        } else {
            friendRanking[diff].unshift({ name: `${playerName} (Du)`, wins: 0, bestTime: '--:--' });
        }
        
        germanyRanking[diff].forEach(item => {
            if (item.name.includes('(Du)')) item.name = `${playerName} (Du)`;
        });
        globalRanking[diff].forEach(item => {
            if (item.name.includes('(Du)')) item.name = `${playerName} (Du)`;
        });
    });

    saveFriendRanking();
}

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
    document.getElementById('edit-name-btn')?.addEventListener('click', () => {
        const newName = prompt('Spielername eingeben:', playerName);
        if (newName && newName.trim()) {
            playerName = newName.trim();
            localStorage.setItem('sudoku_player', playerName);
            updatePlayerUI();
        }
    });

    document.getElementById('start-btn')?.addEventListener('click', () => {
        const diffSelect = document.getElementById('difficulty');
        if (diffSelect) currentDifficulty = diffSelect.value;
        startGameWithPrompt();
    });

    document.getElementById('btn-open-settings')?.addEventListener('click', () => {
        document.getElementById('sub-settings').style.display = 'block';
    });

    document.getElementById('btn-open-stats')?.addEventListener('click', () => {
        updateStatsUI(selectedStatsDiff);
        document.getElementById('sub-stats').style.display = 'block';
    });

    document.getElementById('btn-open-awards')?.addEventListener('click', () => {
        document.getElementById('sub-awards').style.display = 'block';
    });

    document.getElementById('btn-open-howtoplay')?.addEventListener('click', () => {
        document.getElementById('sub-howtoplay').style.display = 'block';
    });

    document.getElementById('btn-open-rules')?.addEventListener('click', () => {
        document.getElementById('sub-rules').style.display = 'block';
    });

    document.getElementById('theme-btn')?.addEventListener('click', () => {
        const pop = document.getElementById('theme-popover');
        pop.style.display = pop.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('brightness-slider')?.addEventListener('input', (e) => {
        document.getElementById('app-root').style.filter = `brightness(${e.target.value}%)`;
    });

    document.getElementById('start-daily-btn')?.addEventListener('click', () => {
        currentDifficulty = 'easy';
        startGameDirectly();
    });

    document.getElementById('back-to-menu-btn')?.addEventListener('click', () => {
        showGameMenuOverlay();
    });

    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = parseInt(e.target.dataset.value || e.target.innerText);
            if (val >= 1 && val <= 9) handleNumberInput(val);
        });
    });

    document.getElementById('erase-btn')?.addEventListener('click', eraseCell);
    document.getElementById('notes-btn')?.addEventListener('click', toggleNotesMode);
    document.getElementById('hint-btn')?.addEventListener('click', showSmartHint);
}

// Neues Verhalten: Startet direkt das Spiel, pausiert sofort und fragt nach Duell-Link
function startGameWithPrompt() {
    startGameDirectly();
    
    // Kurz pausieren und Abfrage-Overlay öffnen
    clearInterval(timerInterval);
    showGameModeSelectionOverlay(currentDifficulty);
}

function showGameModeSelectionOverlay(diff) {
    let existingOverlay = document.getElementById('gamemode-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gamemode-overlay';
    overlay.className = 'ad-overlay';
    overlay.style.display = 'flex';

    const diffText = getDifficultyName(diff);

    overlay.innerHTML = `
        <div class="ad-container" style="max-width: 340px; text-align: center; position: relative; padding: 24px;">
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 8px;">Freunde herausfordern?</h3>
            <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">Möchtest du dieses Spiel (Schwierigkeit: <strong>${diffText}</strong>) per Link teilen?</p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button id="mode-friend" class="btn" style="background-color: #25D366; color: white; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer;">💬 Link senden & Weiterspielen</button>
                <button id="mode-resume" class="btn btn-primary" style="padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer;">Nein, alleine spielen</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#mode-friend').addEventListener('click', () => {
        overlay.remove();
        triggerWhatsAppInvite(diff);
        startTimer(); // Timer nach Teilen fortsetzen
    });

    overlay.querySelector('#mode-resume').addEventListener('click', () => {
        overlay.remove();
        startTimer(); // Timer fortsetzen
    });
}

function triggerWhatsAppInvite(diff) {
    const randomCode = 'SUDOKU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const shareUrl = `${window.location.origin}${window.location.pathname}?duell=${randomCode}&diff=${diff}`;
    const diffText = getDifficultyName(diff);
    const shareText = `🧩 Fordere dich zu einer Sudoku Challenge heraus! Schwierigkeit: *${diffText}*. Spiele exakt dasselbe Rätsel und lass uns vergleichen, wer schneller ist:\n\n${shareUrl}`;

    if (navigator.share) {
        navigator.share({
            title: 'Sudoku Challenge Duell',
            text: shareText,
            url: shareUrl,
        }).catch(() => {
            openWhatsAppFallback(shareText);
        });
    } else {
        openWhatsAppFallback(shareText);
    }
}

function openWhatsAppFallback(text) {
    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    const win = window.open(whatsappUrl, '_blank');
    if (!win) {
        window.location.href = whatsappUrl;
    }
}

function showGameMenuOverlay() {
    let existingOverlay = document.getElementById('game-menu-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'game-menu-overlay';
    overlay.className = 'ad-overlay';
    overlay.style.display = 'flex';

    overlay.innerHTML = `
        <div class="ad-container" style="max-width: 320px; text-align: center; position: relative; padding: 20px;">
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 20px;">Spiel-Menü</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="menu-resume" class="btn" style="background: #e5e5ea; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">Weiterspielen</button>
                <button id="menu-pause" class="btn" style="background: #e5e5ea; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">Pausieren</button>
                <button id="menu-restart" class="btn" style="background: #e5e5ea; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">Neustart</button>
                <button id="menu-quit" class="btn" style="background: #ff3b30; color: white; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">Beenden (Menü)</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#menu-resume').addEventListener('click', () => {
        overlay.remove();
    });

    overlay.querySelector('#menu-pause').addEventListener('click', () => {
        overlay.remove();
        alert("Spiel pausiert. Klicke auf OK, um fortzufahren.");
    });

    overlay.querySelector('#menu-restart').addEventListener('click', () => {
        overlay.remove();
        runAdFlow(() => {
            startGameDirectly();
        });
    });

    overlay.querySelector('#menu-quit').addEventListener('click', () => {
        overlay.remove();
        runAdFlow(() => {
            document.getElementById('game-screen').style.display = 'none';
        });
    });
}

function switchTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    document.getElementById(tabId)?.classList.add('active');
    btnElement.classList.add('active');
}

function closeSubScreen(id) {
    document.getElementById(id).style.display = 'none';
}

function setTheme(theme) {
    const root = document.getElementById('app-root');
    root.classList.remove('theme-white', 'theme-cream', 'theme-dark');
    root.classList.add(`theme-${theme}`);
    
    document.querySelectorAll('.theme-circle').forEach(c => c.classList.remove('active'));
    document.querySelector(`.theme-circle.${theme}`)?.classList.add('active');
}

function toggleNotesMode() {
    isNotesMode = !isNotesMode;
    const btn = document.getElementById('notes-btn');
    if (btn) {
        if (isNotesMode) {
            btn.innerText = 'Notizen: ON';
            btn.classList.add('active');
        } else {
            btn.innerText = 'Notizen: OFF';
            btn.classList.remove('active');
        }
    }
}

function startGameDirectly() {
    stats[currentDifficulty].played++;
    saveStats();

    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('theme-popover').style.display = 'none';
    
    // Schwierigkeit oben im Spiel-Header aktualisieren
    const diffBadge = document.getElementById('game-diff-badge');
    if (diffBadge) diffBadge.innerText = getDifficultyName(currentDifficulty);

    resetTimer();
    mistakes = 0;
    updateMistakesDisplay();
    selectedCell = -1;
    isNotesMode = false;
    
    const notesBtn = document.getElementById('notes-btn');
    if (notesBtn) {
        notesBtn.innerText = 'Notizen: OFF';
        notesBtn.classList.remove('active');
    }

    notes = Array.from({ length: 81 }, () => []);

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
    const selectedValue = (selectedCell !== -1) ? board[selectedCell] : 0;

    cells.forEach((cell, i) => {
        cell.className = 'cell';
        cell.innerHTML = '';

        if (board[i] !== 0) {
            cell.innerText = board[i];
            if (initialBoard[i] !== 0) cell.classList.add('given');
            else {
                cell.classList.add('user-filled');
                if (board[i] !== solution[i]) cell.classList.add('error');
            }
        } else if (notes[i] && notes[i].length > 0) {
            const notesGrid = document.createElement('div');
            notesGrid.classList.add('notes-grid');
            for (let num = 1; num <= 9; num++) {
                const noteItem = document.createElement('div');
                noteItem.classList.add('note-num');
                if (notes[i].includes(num)) {
                    noteItem.innerText = num;
                }
                notesGrid.appendChild(noteItem);
            }
            cell.appendChild(notesGrid);
        }

        if (selectedValue !== 0 && board[i] === selectedValue) {
            cell.classList.add('highlight-same');
        }

        if (i === selectedCell) {
            cell.classList.add('selected');
        }
    });
}

function selectCell(i) {
    selectedCell = i;
    renderBoard();
}

function handleNumberInput(num) {
    if (selectedCell === -1 || initialBoard[selectedCell] !== 0) return;

    if (isNotesMode) {
        if (board[selectedCell] === 0) {
            const index = notes[selectedCell].indexOf(num);
            if (index > -1) {
                notes[selectedCell].splice(index, 1);
            } else {
                notes[selectedCell].push(num);
                notes[selectedCell].sort((a, b) => a - b);
            }
            renderBoard();
        }
        return;
    }

    if (board[selectedCell] === num) return;

    board[selectedCell] = num;
    notes[selectedCell] = [];

    const targetRow = Math.floor(selectedCell / 9);
    const targetCol = selectedCell % 9;
    const targetBoxRow = Math.floor(targetRow / 3);
    const targetBoxCol = Math.floor(targetCol / 3);

    for (let i = 0; i < 81; i++) {
        const r = Math.floor(i / 9);
        const c = i % 9;
        const bRow = Math.floor(r / 3);
        const bCol = Math.floor(c / 3);

        if (r === targetRow || c === targetCol || (bRow === targetBoxRow && bCol === targetBoxCol)) {
            const noteIndex = notes[i].indexOf(num);
            if (noteIndex > -1) {
                notes[i].splice(noteIndex, 1);
            }
        }
    }

    if (num !== solution[selectedCell]) {
        mistakes++;
        updateMistakesDisplay();
        if (mistakes >= maxMistakes) {
            alert("Game Over! Zu viele Fehler.");
            endGameAndShowAd(() => {
                document.getElementById('game-screen').style.display = 'none';
            });
            return;
        }
    }

    renderBoard();
    updateNumberButtons();
    checkWinCondition();
}

function eraseCell() {
    if (selectedCell === -1 || initialBoard[selectedCell] !== 0) return;
    board[selectedCell] = 0;
    notes[selectedCell] = [];
    renderBoard();
    updateNumberButtons();
}

function updateNumberButtons() {
    const counts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};
    board.forEach((val, i) => {
        if (val >= 1 && val <= 9 && val === solution[i]) counts[val]++;
    });

    document.querySelectorAll('.num-btn').forEach(btn => {
        const val = parseInt(btn.dataset.value || btn.innerText);
        if (counts[val] >= 9) btn.classList.add('disabled');
        else btn.classList.remove('disabled');
    });
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.innerText = `${mins}:${secs}`;
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.innerText = '00:00';
}

function updateMistakesDisplay() {
    const el = document.getElementById('mistakes');
    if (el) el.innerText = `${mistakes}/${maxMistakes}`;
}

function checkWinCondition() {
    if (board.every((val, i) => val === solution[i])) {
        clearInterval(timerInterval);
        stats[currentDifficulty].won++;
        if (mistakes === 0) stats[currentDifficulty].perfect++;
        
        const selfEntry = friendRanking[currentDifficulty].find(f => f.name.includes('(Du)'));
        if (selfEntry) {
            selfEntry.wins++;
            const currentMins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const currentSecs = (seconds % 60).toString().padStart(2, '0');
            const timeStr = `${currentMins}:${currentSecs}`;
            if (selfEntry.bestTime === '--:--' || timeStr < selfEntry.bestTime) {
                selfEntry.bestTime = timeStr;
            }
        }
        saveFriendRanking();
        saveStats();

        setTimeout(() => {
            alert(`Glückwunsch ${playerName}! Du hast gewonnen! 🎉\nZeit: ${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`);
            
            updateRankingUI();
            
            const rankingTabBtn = document.querySelector('.bottom-nav button:nth-child(3)');
            if (rankingTabBtn) switchTab('tab-ranking', rankingTabBtn);

            endGameAndShowAd(() => {
                document.getElementById('game-screen').style.display = 'none';
            });
        }, 200);
    }
}

function runAdFlow(onComplete) {
    const adScreen = document.getElementById('ad-screen');
    const adTextEl = document.querySelector('.ad-timer-text');
    let adContainer = adScreen.querySelector('.ad-container');
    
    if (!adContainer) {
        adContainer = adScreen.querySelector('div') || adScreen;
    }
    adContainer.style.position = 'relative';
    
    let xBtn = adContainer.querySelector('.ad-x-close');
    if (!xBtn) {
        xBtn = document.createElement('button');
        xBtn.className = 'ad-x-close';
        xBtn.innerHTML = '✕';
        adContainer.appendChild(xBtn);
    }
    
    xBtn.style.cssText = 'position: absolute !important; top: 10px !important; right: 15px !important; background: none !important; border: none !important; font-size: 1.4rem !important; font-weight: bold !important; cursor: pointer !important; z-index: 99999 !important; color: #000 !important; padding: 5px !important; display: none !important;';

    let timeLeft = 3;
    xBtn.style.display = 'none';
    adScreen.style.display = 'flex';
    if (adTextEl) adTextEl.innerHTML = `Schließen in <span id="ad-countdown">${timeLeft}</span>s...`;

    const adInterval = setInterval(() => {
        timeLeft--;
        const countdownEl = document.getElementById('ad-countdown');
        if (countdownEl) countdownEl.innerText = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(adInterval);
            xBtn.style.display = 'block';
            if (adTextEl) adTextEl.innerText = "Werbung abgeschlossen.";
        }
    }, 1000);

    const newXBtn = xBtn.cloneNode(true);
    xBtn.parentNode.replaceChild(newXBtn, xBtn);

    const finishAd = () => {
        clearInterval(adInterval);
        adScreen.style.display = 'none';
        if (onComplete) onComplete();
    };

    newXBtn.style.display = 'block';
    
    document.addEventListener('click', function handleAdClick(e) {
        if (e.target.classList.contains('ad-x-close') || e.target.closest('.ad-x-close')) {
            if (adScreen.style.display === 'flex' && timeLeft <= 0) {
                document.removeEventListener('click', handleAdClick);
                finishAd();
            }
        }
    });
    
    const checkTimerDone = setInterval(() => {
        if (timeLeft <= 0) {
            newXBtn.style.display = 'block';
        }
    }, 200);

    window._currentAdFinisher = () => {
        clearInterval(adInterval);
        clearInterval(checkTimerDone);
        adScreen.style.display = 'none';
        if (onComplete) onComplete();
    };
    
    newXBtn.onclick = () => {
        if (timeLeft <= 0) {
            window._currentAdFinisher();
        }
    };
}

function endGameAndShowAd(callback) {
    clearInterval(timerInterval);
    runAdFlow(callback);
}

function showSmartHint() {
    let targetIndex = selectedCell;

    if (targetIndex === -1 || (board[targetIndex] !== 0 && board[targetIndex] === solution[targetIndex])) {
        targetIndex = board.findIndex((val, idx) => val !== solution[idx]);
    }

    if (targetIndex === -1) {
        alert("Das Spielfeld ist bereits vollkommen richtig ausgefüllt!");
        return;
    }

    runAdFlow(() => {
        showTutorialOverlay(targetIndex);
    });
}

function showTutorialOverlay(targetIndex) {
    let existingOverlay = document.getElementById('tutorial-overlay');
    if (existingOverlay) existingOverlay.remove();

    const correctValue = solution[targetIndex];

    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'ad-overlay';
    overlay.style.display = 'flex';

    overlay.innerHTML = `
        <div class="ad-container" style="max-width: 380px; text-align: left; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0;">Letzte Zelle</h3>
                <button id="tut-close" style="background:none; border:none; font-size: 1.2rem; cursor:pointer;">✕</button>
            </div>
            
            <div id="tut-text" style="font-size: 0.95rem; color: #2c2c2e; margin-bottom: 20px; min-height: 50px; line-height: 1.4;">
                Achte auf <b>diese Zellen</b> und die hervorgehobenen Bereiche.
            </div>

            <div style="display: flex; justify-content: center; gap: 6px; margin-bottom: 15px;">
                <span class="tut-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #007aff;"></span>
                <span class="tut-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #d1d1d6;"></span>
                <span class="tut-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #d1d1d6;"></span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button id="tut-prev" class="btn" style="width: 40px; height: 40px; padding: 0; border-radius: 50%; background: #e5e5ea; display: flex; align-items: center; justify-content: center;">❮</button>
                <button id="tut-next" class="btn btn-primary" style="width: 40px; height: 40px; padding: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center;">❯</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    let step = 0;
    const steps = [
        `Achte auf <b>diese Zellen</b> und die hervorgehobenen Bereiche.`,
        `In <b>diesem Block</b> gibt es nur noch eine Zelle, die die Zahl enthalten kann.`,
        `Da es die einzige Möglichkeit ist, muss in diese Zelle die <b>${correctValue}</b> eingetragen werden.`
    ];

    const textEl = overlay.querySelector('#tut-text');
    const dots = overlay.querySelectorAll('.tut-dot');

    function updateStep() {
        textEl.innerHTML = steps[step];
        dots.forEach((d, idx) => {
            d.style.background = idx === step ? '#007aff' : '#d1d1d6';
        });

        if (step === 2) {
            selectedCell = targetIndex;
            board[targetIndex] = correctValue;
            notes[targetIndex] = [];
            renderBoard();
            updateNumberButtons();
        }
    }

    overlay.querySelector('#tut-next').addEventListener('click', () => {
        if (step < 2) {
            step++;
            updateStep();
        } else {
            overlay.remove();
            checkWinCondition();
        }
    });

    overlay.querySelector('#tut-prev').addEventListener('click', () => {
        if (step > 0) {
            step--;
            updateStep();
        }
    });

    overlay.querySelector('#tut-close').addEventListener('click', () => {
        overlay.remove();
    });
}

function saveStats() {
    localStorage.setItem('sudoku_stats_v2', JSON.stringify(stats));
}

function saveFriendRanking() {
    localStorage.setItem('sudoku_friend_ranking_v2', JSON.stringify(friendRanking));
}

function switchRankingCategory(category, btn) {
    currentRankingCategory = category;
    
    // Aktiven Button in der ersten Zeile setzen
    const parentContainer = btn.parentElement;
    parentContainer.querySelectorAll('.diff-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const descEl = document.getElementById('ranking-desc');
    if (category === 'friends') {
        descEl.innerText = 'Vergleiche deine Siege und besten Zeiten mit deinen Freunden aus Duellen.';
    } else if (category === 'germany') {
        descEl.innerText = 'Die besten Spieler im nationalen Vergleich (Deutschland).';
    } else if (category === 'global') {
        descEl.innerText = 'Die weltbesten Sudoku-Spieler in der Bestenliste.';
    }

    updateRankingUI();
}

function switchRankingDiff(diff, btn) {
    currentRankingDiff = diff;
    
    // Aktiven Button in der Schwierigkeits-Zeile setzen
    const parentContainer = btn.parentElement;
    parentContainer.querySelectorAll('.diff-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    updateRankingUI();
}

function updateRankingUI() {
    const container = document.getElementById('ranking-list-container');
    if (!container) return;

    let datasetSource = friendRanking;
    if (currentRankingCategory === 'germany') datasetSource = germanyRanking;
    if (currentRankingCategory === 'global') datasetSource = globalRanking;

    let dataset = datasetSource[currentRankingDiff] || [];

    dataset.forEach(item => {
        if (item.name.includes('(Du)')) {
            item.name = `${playerName} (Du)`;
        }
    });

    // Nach Siegen sortieren
    dataset.sort((a, b) => b.wins - a.wins);

    container.innerHTML = '';
    
    if (dataset.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #8e8e93; padding: 15px;">Keine Einträge vorhanden.</div>`;
        return;
    }

    dataset.forEach((entry, index) => {
        const row = document.createElement('div');
        row.className = 'stat-row';
        if (entry.name.includes('(Du)')) {
            row.style.background = 'rgba(0, 122, 255, 0.08)';
            row.style.borderRadius = '8px';
            row.style.padding = '4px 8px';
        }
        
        let medal = `#${index + 1}`;
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';

        row.innerHTML = `
            <div class="stat-left"><span>${medal}</span> ${entry.name}</div>
            <div style="text-align: right;">
                <div class="stat-val" style="font-size: 1rem;">${entry.wins} Siege</div>
                <div style="font-size: 0.75rem; color: #8e8e93;">Beste Zeit: ${entry.bestTime}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

function switchStatsDiff(diff, btn) {
    selectedStatsDiff = diff;
    document.querySelectorAll('#sub-stats .diff-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateStatsUI(diff);
}

function updateStatsUI(diff) {
    const d = stats[diff] || { played: 0, won: 0, perfect: 0 };
    document.getElementById('stat-played').innerText = d.played;
    document.getElementById('stat-won').innerText = d.won;
    const rate = d.played > 0 ? Math.round((d.won / d.played) * 100) : 0;
    document.getElementById('stat-winrate').innerText = `${rate}%`;
    document.getElementById('stat-perfect').innerText = d.perfect;
}
