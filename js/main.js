import { initBoard, renderBoard, updatePlayerTokenPosition, renderPlayerTokens, renderPropertyImprovements } from './board.js';
import { initGame, startGame, rollDice, endTurn, buyProperty, manageProperties, saveGame, loadGame, resetGame, handleJailAction, bankruptPlayer, showGameOver } from './gameEngine.js';
import { updateUI, showModal, hideModal, showMessageModal, hideMessageModal, updatePlayerInfo, updatePlayerList, updateDiceDisplay, updateLog, toggleDebugPanel, setupDebugButtons } from './ui.js';
import { loadData } from './utils.js';
import { setLanguage, getLocalizedText, initI18n } from './i18n.js';
import { playSound } from './audio.js';

/**
 * Global game state object.
 * @type {object}
 */
window.gameState = {
    players: [],
    tiles: [],
    currentPlayerIndex: 0,
    dice: [1, 1],
    config: {},
    eventCards: [],
    localNewsCards: [],
    freeParkingPot: 0,
    isGameRunning: false,
    sfxEnabled: true,
    language: 'en'
};

/**
 * Initializes the game engine and UI components.
 * This function will now be called directly on DOMContentLoaded.
 */
async function initGameAndUI() {
    const splashScreen = document.getElementById('splash-screen');
    const gameContainer = document.getElementById('game-container');

    // Immediately hide the splash screen if it exists
    if (splashScreen) {
        splashScreen.style.display = 'none';
    }
    gameContainer.classList.remove('hidden'); // Show the game container

    try {
        // Load game data
        const [boardData, eventCards, localNewsCards] = await Promise.all([
            loadData('data/boardData.json'),
            loadData('data/eventCards.json'),
            loadData('data/localNewsCards.json')
        ]);

        // Initialize global game state with loaded data
        window.gameState.tiles = boardData.tiles;
        window.gameState.config = {
            currencySymbol: boardData.currencySymbol || '৳',
            goMoney: boardData.goMoney || 2000,
            houseCost: boardData.houseCost || 1000,
            hotelCost: boardData.hotelCost || 5000,
            mortgageRate: boardData.mortgageRate || 0.5,
            freeParkingJackpot: boardData.freeParkingJackpot || false,
            jailFine: boardData.jailFine || 500,
            // TODO: Add more configurable game rules here if needed
        };
        window.gameState.eventCards = eventCards.cards;
        window.gameState.localNewsCards = localNewsCards.cards;

        // Initialize internationalization
        initI18n(window.gameState.language); // Default to English
        setLanguage(window.gameState.language); // Apply initial language

        // Initialize board rendering
        initBoard(window.gameState.tiles);
        renderBoard(window.gameState.tiles);

        // Initialize game engine (resets state, but doesn't create players yet)
        initGame();

        // Setup UI event listeners (these can be set up before players exist)
        setupUIListeners();
        setupDebugButtons(); // Setup debug buttons

        // --- CRITICAL CHANGE: Call startGame() BEFORE updateUI() ---
        // startGame() will prompt for player names and populate window.gameState.players
        startGame();

        // Now that players exist, updateUI can safely be called
        updateUI();


    } catch (error) {
        console.error("Failed to load game data or initialize game:", error);
        // We're showing a generic error message, but the console has the real details.
        // If boardData.json failed, the board wouldn't render at all.
        // This error likely means eventCards.json or localNewsCards.json failed to load.
        showMessageModal('Error', 'Failed to load game data. Please check console for details.');
    }
}

/**
 * Sets up all UI event listeners.
 */
function setupUIListeners() {
    document.getElementById('roll-dice-btn').addEventListener('click', () => {
        playSound('dice-sfx');
        rollDice();
    });
    document.getElementById('end-turn-btn').addEventListener('click', endTurn);
    document.getElementById('buy-property-btn').addEventListener('click', () => {
        // This button should only be enabled when a property is landed on.
        // The modal's confirm/decline buttons will call buyProperty(true/false).
        // For now, let's ensure it calls buyProperty(true) if it's ever visible and clicked.
        buyProperty(true);
    });
    document.getElementById('manage-properties-btn').addEventListener('click', manageProperties);
    document.getElementById('trade-btn').addEventListener('click', () => showModal('trade-modal'));
    document.getElementById('settings-btn').addEventListener('click', () => showModal('settings-modal'));
    document.getElementById('save-game-btn').addEventListener('click', saveGame);
    document.getElementById('load-game-btn').addEventListener('click', loadGame);
    document.getElementById('reset-game-btn').addEventListener('click', resetGame);
    document.getElementById('toggle-debug-btn').addEventListener('click', toggleDebugPanel);

    // Modal close buttons
    document.getElementById('buy-modal-confirm').addEventListener('click', () => buyProperty(true));
    document.getElementById('buy-modal-decline').addEventListener('click', () => buyProperty(false)); // Decline leads to auction
    document.getElementById('manage-modal-close').addEventListener('click', () => hideModal('manage-properties-modal'));
    document.getElementById('trade-modal-close').addEventListener('click', () => hideModal('trade-modal'));
    document.getElementById('settings-modal-close').addEventListener('click', () => hideModal('settings-modal'));
    document.getElementById('game-over-close').addEventListener('click', () => {
        hideModal('game-over-modal');
        resetGame(); // Start a new game
    });
    document.getElementById('message-modal-close').addEventListener('click', () => hideMessageModal());

    // Jail modal actions
    document.getElementById('jail-pay-fine-btn').addEventListener('click', () => handleJailAction('payFine'));
    document.getElementById('jail-roll-doubles-btn').addEventListener('click', () => handleJailAction('rollDoubles'));
    document.getElementById('jail-use-card-btn').addEventListener('click', () => handleJailAction('useCard'));

    // Settings listeners
    document.getElementById('language-select').addEventListener('change', (event) => {
        window.gameState.language = event.target.value;
        setLanguage(window.gameState.language);
        // Re-render board and UI to apply new language
        renderBoard(window.gameState.tiles);
        updateUI();
        updateLog(getLocalizedText('language_changed_to') + (window.gameState.language === 'en' ? 'English' : 'বাংলা'));
    });
    document.getElementById('sfx-toggle').addEventListener('change', (event) => {
        window.gameState.sfxEnabled = event.target.checked;
        updateLog(getLocalizedText('sfx_toggled') + (window.gameState.sfxEnabled ? 'On' : 'Off'));
    });
    document.getElementById('free-parking-jackpot-toggle').addEventListener('change', (event) => {
        window.gameState.config.freeParkingJackpot = event.target.checked;
        updateLog(getLocalizedText('free_parking_jackpot_toggled') + (window.gameState.config.freeParkingJackpot ? 'On' : 'Off'));
    });
}

// Start the game immediately when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGameAndUI);
