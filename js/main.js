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
        // Load game data with enhanced error handling
        const boardDataPromise = loadData('data/boardData.json')
            .catch(err => { console.error("Error loading boardData.json:", err); throw new Error("Failed to load board data."); });
        const eventCardsPromise = loadData('data/eventCards.json')
            .catch(err => { console.error("Error loading eventCards.json:", err); throw new Error("Failed to load event cards data."); });
        const localNewsCardsPromise = loadData('data/localNewsCards.json')
            .catch(err => { console.error("Error loading localNewsCards.json:", err); throw new Error("Failed to load local news cards data."); });


        const [boardData, eventCards, localNewsCards] = await Promise.all([
            boardDataPromise,
            eventCardsPromise,
            localNewsCardsPromise
        ]);

        // --- NEW DEBUGGING CHECKS ---
        if (!boardData || !boardData.tiles) {
            throw new Error("boardData.json is missing 'tiles' property or is empty.");
        }
        if (!eventCards || !eventCards.cards) {
            throw new Error("eventCards.json is missing 'cards' property or is empty.");
        }
        if (!localNewsCards || !localNewsCards.cards) {
            throw new Error("localNewsCards.json is missing 'cards' property or is empty.");
        }
        // --- END NEW DEBUGGING CHECKS ---


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
        initGame(); // This now only resets state, doesn't call updateUI

        // Setup UI event listeners (these can be set up before players exist)
        setupUIListeners();
        setupDebugButtons(); // Setup debug buttons

        // --- CRITICAL CHANGE: DO NOT call startGame() here directly ---
        // Instead, we will add a "Start Game" button to the UI to trigger it.
        // The UI will initially show a default player state or a "Start Game" prompt.
        updateUI(); // Update UI with initial (empty player) state

    } catch (error) {
        console.error("Failed to load game data or initialize game:", error);
        // The error message will now be more specific if it's a JSON content issue.
        showMessageModal('Error', `Failed to load game data: ${error.message || 'Unknown error'}. Please check console for details.`);
        // Ensure game container is hidden if there's a critical loading error
        gameContainer.classList.add('hidden');
    }
}

/**
 * Sets up all UI event listeners.
 */
function setupUIListeners() {
    // New: Add a dedicated "Start Game" button listener
    const startGameButton = document.getElementById('start-game-btn');
    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            const gameStartedSuccessfully = startGame();
            if (gameStartedSuccessfully) {
                updateUI(); // Update UI after players are created
                // Hide the start game button and show other game buttons
                startGameButton.classList.add('hidden');
                document.getElementById('roll-dice-btn').classList.remove('hidden');
                document.getElementById('end-turn-btn').classList.remove('hidden');
                document.getElementById('manage-properties-btn').classList.remove('hidden');
                document.getElementById('trade-btn').classList.remove('hidden');
                document.getElementById('save-game-btn').classList.remove('hidden');
                document.getElementById('load-game-btn').classList.remove('hidden');
                document.getElementById('reset-game-btn').classList.remove('hidden');

            } else {
                // If game setup was cancelled or invalid, keep start button visible
                startGameButton.classList.remove('hidden');
                document.getElementById('roll-dice-btn').classList.add('hidden');
                document.getElementById('end-turn-btn').classList.add('hidden');
                document.getElementById('manage-properties-btn').classList.add('hidden');
                document.getElementById('trade-btn').classList.add('hidden');
                document.getElementById('save-game-btn').classList.add('hidden');
                document.getElementById('load-game-btn').classList.add('hidden');
                document.getElementById('reset-game-btn').classList.add('hidden');
            }
        });
    }


    document.getElementById('roll-dice-btn').addEventListener('click', () => {
        playSound('dice-sfx');
        rollDice();
    });
    document.getElementById('end-turn-btn').addEventListener('click', endTurn);
    document.getElementById('buy-property-btn').addEventListener('click', () => {
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
