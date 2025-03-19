// Game configuration 
const SYMBOLS_COUNT = {
    "🔮": 2,  // Purple orb (rare, high value)
    "💎": 4,  // Diamond (uncommon, good value)
    "⚡": 6,  // Lightning bolt (common, medium value)
    "💫": 8   // Star (very common, low value)
};

const SYMBOL_VALUES = {
    "🔮": 5,  // 5x multiplier
    "💎": 4,  // 4x multiplier
    "⚡": 3,  // 3x multiplier
    "💫": 2   // 2x multiplier
};

const SYMBOL_NAMES = {
    "🔮": "Purple Orb",
    "💎": "Diamond",
    "⚡": "Lightning Bolt",
    "💫": "Star"
};

const ROWS = 3;
const COLS = 3;

// Game state
let balance = 0;
let spinHistory = [];

// Wait for the page to fully load
window.onload = function() {
    console.log("Finding Fortune game loaded"); // Debug log
    
    // Get DOM elements
    const balanceDisplay = document.getElementById('balance');
    const depositInput = document.getElementById('deposit');
    const depositBtn = document.getElementById('depositBtn');
    const betLinesInput = document.getElementById('betLines');
    const betAmountInput = document.getElementById('betAmount');
    const spinBtn = document.getElementById('spinBtn');
    const slotDisplay = document.getElementById('slotDisplay');
    const messageDisplay = document.getElementById('message');

    // Initialize empty slot display
    initializeSlotDisplay();

    // Add direct click handler to deposit button
    depositBtn.onclick = function() {
        console.log("Deposit button clicked"); // Debug log
        const amount = parseInt(depositInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid deposit amount');
            return;
        }

        balance = amount;
        balanceDisplay.textContent = balance;
        spinBtn.disabled = false;
        depositInput.disabled = true;
        depositBtn.disabled = true;
        
        // Save to localStorage
        localStorage.setItem('slotBalance', balance.toString());
        messageDisplay.textContent = `$${amount} deposited! You're ready to spin!`;
        messageDisplay.className = 'message';
    };

    // Add direct click handler to spin button
    spinBtn.onclick = function() {
        const lines = parseInt(betLinesInput.value);
        const bet = parseInt(betAmountInput.value);

        if (isNaN(bet) || bet <= 0 || isNaN(lines) || lines < 1 || lines > 3) {
            alert('Please enter valid bet amount and number of lines');
            return;
        }

        const totalBet = bet * lines;
        if (totalBet > balance) {
            alert('Insufficient funds');
            return;
        }

        // Visual animation effect for spinning
        animateSpinning().then(() => {
            // Deduct bet
            balance -= totalBet;
            balanceDisplay.textContent = balance;
            localStorage.setItem('slotBalance', balance.toString());

            // Generate and display results
            const reels = generateReels();
            const rows = transpose(reels);
            displayResults(rows);

            // Calculate winnings
            const winnings = calculateWinnings(rows, bet, lines);
            
            if (winnings > 0) {
                balance += winnings;
                balanceDisplay.textContent = balance;
                localStorage.setItem('slotBalance', balance.toString());
                messageDisplay.textContent = `You won $${winnings}!`;
                messageDisplay.className = 'message win';
                
                // Log win to history
                spinHistory.push({
                    bet: totalBet,
                    lines: lines,
                    result: 'win',
                    winnings: winnings,
                    balance: balance
                });
            } else {
                messageDisplay.textContent = 'Try again!';
                messageDisplay.className = 'message lose';
                
                // Log loss to history
                spinHistory.push({
                    bet: totalBet,
                    lines: lines,
                    result: 'loss',
                    winnings: 0,
                    balance: balance
                });
            }

            if (balance <= 0) {
                spinBtn.disabled = true;
                messageDisplay.textContent = 'Game Over! Refresh to play again.';
            }
        });
    };

    // Check for existing balance
    const savedBalance = localStorage.getItem('slotBalance');
    if (savedBalance) {
        balance = parseInt(savedBalance);
        balanceDisplay.textContent = balance;
        spinBtn.disabled = false;
        depositInput.disabled = true;
        depositBtn.disabled = true;
        messageDisplay.textContent = 'Welcome back! Continue your game.';
    }
};

// Helper functions
function generateReels() {
    const symbols = [];
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }
    
    const reels = [];
    for (let i = 0; i < COLS; i++) {
        const reelSymbols = [...symbols];
        const reel = [];
        for (let j = 0; j < ROWS; j++) {
            const randomIndex = Math.floor(Math.random() * reelSymbols.length);
            const selectedSymbol = reelSymbols[randomIndex];
            reel.push(selectedSymbol);
            reelSymbols.splice(randomIndex, 1);
        }
        reels.push(reel);
    }
    return reels;
}

function transpose(reels) {
    const rows = [];
    for (let i = 0; i < ROWS; i++) {
        rows.push([]);
        for (let j = 0; j < COLS; j++) {
            rows[i].push(reels[j][i]);
        }
    }
    return rows;
}

function initializeSlotDisplay() {
    const display = document.getElementById('slotDisplay');
    display.innerHTML = '';
    
    for (let i = 0; i < ROWS; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'slot-row';
        
        for (let j = 0; j < COLS; j++) {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'slot-symbol';
            symbolDiv.textContent = '?';
            rowDiv.appendChild(symbolDiv);
        }
        
        display.appendChild(rowDiv);
    }
}

function displayResults(rows) {
    const display = document.getElementById('slotDisplay');
    display.innerHTML = '';
    
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'slot-row';
        
        row.forEach(symbol => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'slot-symbol';
            symbolDiv.textContent = symbol;
            rowDiv.appendChild(symbolDiv);
        });
        
        display.appendChild(rowDiv);
    });
}

function calculateWinnings(rows, bet, lines) {
    let winnings = 0;
    
    // Track which rows won for highlighting
    const winningRows = [];
    
    for (let row = 0; row < lines; row++) {
        const symbols = rows[row];
        const allSame = symbols.every(symbol => symbol === symbols[0]);
        
        if (allSame) {
            winnings += bet * SYMBOL_VALUES[symbols[0]];
            winningRows.push(row);
        }
    }
    
    // Highlight winning rows with a slight delay for effect
    setTimeout(() => {
        const slotRows = document.querySelectorAll('.slot-row');
        
        winningRows.forEach(rowIndex => {
            if (slotRows[rowIndex]) {
                const symbolDivs = slotRows[rowIndex].querySelectorAll('.slot-symbol');
                symbolDivs.forEach(div => {
                    div.classList.add('highlight');
                });
            }
        });
    }, 300);
    
    return winnings;
}

// Animation function for spinning effect
function animateSpinning() {
    return new Promise(resolve => {
        const display = document.getElementById('slotDisplay');
        const allSymbols = Object.keys(SYMBOLS_COUNT);
        let count = 0;
        
        const interval = setInterval(() => {
            display.querySelectorAll('.slot-symbol').forEach(symbolDiv => {
                const randomSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
                symbolDiv.textContent = randomSymbol;
            });
            
            count++;
            if (count >= 10) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

// Function to reset the game (for demo purposes)
function resetGame() {
    localStorage.removeItem('slotBalance');
    location.reload();
}