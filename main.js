// Game configuration
const SYMBOLS_COUNT = {
    "A": 2,
    "B": 4,
    "C": 6,
    "D": 8
};

const SYMBOL_VALUES = {
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2
};

const ROWS = 3;
const COLS = 3;

// Game state
let balance = 0;

// DOM Elements
const balanceDisplay = document.getElementById('balance');
const depositInput = document.getElementById('deposit');
const depositBtn = document.getElementById('depositBtn');
const betLinesInput = document.getElementById('betLines');
const betAmountInput = document.getElementById('betAmount');
const spinBtn = document.getElementById('spinBtn');
const slotDisplay = document.getElementById('slotDisplay');
const messageDisplay = document.getElementById('message');

// Initialize game
function init() {

    console.log('Game initializing...'); // Debug log
    
    // Verify DOM elements are found
    console.log('Deposit button found:', depositBtn !== null);
    console.log('Deposit input found:', depositInput !== null);

    // Check for existing balance in localStorage
    const savedBalance = localStorage.getItem('slotBalance');
    if (savedBalance) {
        balance = parseInt(savedBalance);
        updateBalance();
        spinBtn.disabled = false;
        depositInput.disabled = true;
        depositBtn.disabled = true;
    }

    // Add event listeners with error handling
    if (depositBtn) {
        depositBtn.addEventListener('click', function(e) {
            console.log('Deposit button clicked'); // Debug log
            handleDeposit();
        });
    }


    if (spinBtn) {
        spinBtn.addEventListener('click', function(e) {
            console.log('Spin button clicked'); // Debug log
            handleSpin();
        });
    }
}

// Handle initial deposit
function handleDeposit() {
    console.log('Handling deposit...'); // Debug log
    const amount = parseInt(depositInput.value);
    console.log('Deposit amount:', amount); // Debug log

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid deposit amount');
        return;
    }

    balance = amount;
    updateBalance();
    spinBtn.disabled = false;
    depositInput.disabled = true;
    depositBtn.disabled = true;
}

// Handle spin
function handleSpin() {
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

    // Deduct bet
    balance -= totalBet;
    updateBalance();

    // Generate and display results
    const reels = spin();
    const rows = transpose(reels);
    displaySlots(rows);

    // Calculate and handle winnings
    const winnings = getWinnings(rows, bet, lines);
    handleWinnings(winnings);
}

// Generate reels
function spin() {
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

// Transpose matrix
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

// Display slots
function displaySlots(rows) {
    slotDisplay.innerHTML = rows
        .map(row => row.join(' | '))
        .join('<br>');
}

// Calculate winnings
function getWinnings(rows, bet, lines) {
    let winnings = 0;
    for (let row = 0; row < lines; row++) {
        const symbols = rows[row];
        const allSame = symbols.every(symbol => symbol === symbols[0]);
        
        if (allSame) {
            winnings += bet * SYMBOL_VALUES[symbols[0]];
        }
    }
    return winnings;
}

// Handle winnings
function handleWinnings(winnings) {
    balance += winnings;
    updateBalance();

    if (winnings > 0) {
        messageDisplay.textContent = `You won $${winnings}!`;
        messageDisplay.className = 'message win';
    } else {
        messageDisplay.textContent = 'Try again!';
        messageDisplay.className = 'message lose';
    }

    // Check if game over
    if (balance <= 0) {
        spinBtn.disabled = true;
        messageDisplay.textContent = 'Game Over! Refresh to play again.';
        messageDisplay.className = 'message lose';
    }
}

// Update balance display and localStorage
function updateBalance() {
    balanceDisplay.textContent = balance;
    localStorage.setItem('slotBalance', balance.toString());
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded'); // Debug log
    init();
});