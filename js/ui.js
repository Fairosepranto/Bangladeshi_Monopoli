import { getLocalizedText } from './i18n.js';
import { getPlayerColor } from './players.js';
import { buildHouse, sellHouse, mortgageProperty, unmortgageProperty } from './gameEngine.js';

let gameLogElement;
let logContentElement;

/**
 * Initializes UI elements and sets up initial state.
 */
export function initUI() {
    gameLogElement = document.getElementById('game-log');
    logContentElement = document.getElementById('log-content');
    // Ensure initial UI state for buttons
    // These buttons are now hidden by default in HTML and shown by JS after game starts
    document.getElementById('roll-dice-btn').disabled = true;
    document.getElementById('end-turn-btn').disabled = true;
    document.getElementById('buy-property-btn').disabled = true;
    document.getElementById('manage-properties-btn').disabled = true;
    document.getElementById('trade-btn').disabled = true;
    document.getElementById('save-game-btn').disabled = true;
    document.getElementById('load-game-btn').disabled = false; // Load can be active initially
    document.getElementById('reset-game-btn').disabled = false; // Reset can be active initially
}

/**
 * Updates all dynamic UI elements based on the current game state.
 */
export function updateUI() {
    // Only update player info if players exist
    if (window.gameState.players.length > 0) {
        updatePlayerInfo(window.gameState.players[window.gameState.currentPlayerIndex]);
        updatePlayerList();
    } else {
        // Set default/empty state if no players
        document.getElementById('current-player-name').textContent = 'Player 1';
        document.getElementById('current-player-name').style.color = 'var(--dark-text)';
        document.getElementById('current-player-cash').textContent = `${window.gameState.config.currencySymbol} 15000`;
        document.getElementById('player-list').innerHTML = ''; // Clear player list
    }

    updateDiceDisplay(window.gameState.dice[0], window.gameState.dice[1]);

    // Update button states based on game running status
    if (window.gameState.isGameRunning) {
        document.getElementById('roll-dice-btn').disabled = false;
        document.getElementById('end-turn-btn').disabled = true; // Disabled until roll
        document.getElementById('manage-properties-btn').disabled = false;
        document.getElementById('trade-btn').disabled = false;
        document.getElementById('save-game-btn').disabled = false;
        document.getElementById('load-game-btn').disabled = false;
        document.getElementById('reset-game-btn').disabled = false;

        // Hide Start Game button if game is running
        document.getElementById('start-game-btn').classList.add('hidden');
    } else {
        // Show Start Game button if game is not running
        document.getElementById('start-game-btn').classList.remove('hidden');
        document.getElementById('roll-dice-btn').disabled = true;
        document.getElementById('end-turn-btn').disabled = true;
        document.getElementById('buy-property-btn').disabled = true;
        document.getElementById('manage-properties-btn').disabled = true;
        document.getElementById('trade-btn').disabled = true;
        document.getElementById('save-game-btn').disabled = true;
        // Load and Reset can remain enabled even if game isn't running
        document.getElementById('load-game-btn').disabled = false;
        document.getElementById('reset-game-btn').disabled = false;
    }

    // Update settings based on game state
    document.getElementById('language-select').value = window.gameState.language;
    document.getElementById('sfx-toggle').checked = window.gameState.sfxEnabled;
    document.getElementById('free-parking-jackpot-toggle').checked = window.gameState.config.freeParkingJackpot;
}

/**
 * Updates the display for the current player's information.
 * @param {import('./players.js').Player} player - The current player object.
 */
export function updatePlayerInfo(player) {
    const playerNameEl = document.getElementById('current-player-name');
    const playerCashEl = document.getElementById('current-player-cash');

    playerNameEl.textContent = player.name;
    playerNameEl.style.color = getPlayerColor(player.id);
    playerCashEl.textContent = `${window.gameState.config.currencySymbol} ${player.cash.toLocaleString()}`;
}

/**
 * Updates the list of all players and their cash/status.
 */
export function updatePlayerList() {
    const playerListEl = document.getElementById('player-list');
    playerListEl.innerHTML = ''; // Clear existing list

    window.gameState.players.forEach(player => {
        const playerSummaryEl = document.createElement('div');
        playerSummaryEl.classList.add('player-summary');
        if (player.id === window.gameState.currentPlayerIndex) {
            playerSummaryEl.classList.add('current-player');
        }
        if (player.isBankrupt) {
            playerSummaryEl.classList.add('bankrupt');
        }

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('player-summary-name');
        nameSpan.textContent = player.name;
        nameSpan.style.color = getPlayerColor(player.id); // Set player color

        const cashSpan = document.createElement('span');
        cashSpan.classList.add('player-summary-cash');
        cashSpan.textContent = `${window.gameState.config.currencySymbol} ${player.cash.toLocaleString()}`;

        playerSummaryEl.appendChild(nameSpan);
        playerSummaryEl.appendChild(cashSpan);
        playerListEl.appendChild(playerSummaryEl);
    });
}

/**
 * Updates the displayed dice values.
 * @param {number} die1 - Value of the first die.
 * @param {number} die2 - Value of the second die.
 */
export function updateDiceDisplay(die1, die2) {
    const die1El = document.getElementById('die1');
    const die2El = document.getElementById('die2');

    // Use Unicode dice characters
    die1El.textContent = String.fromCodePoint(0x2680 + (die1 - 1));
    die2El.textContent = String.fromCodePoint(0x2680 + (die2 - 1));
}

/**
 * Adds a message to the game log.
 * @param {string} message - The message to add.
 */
export function updateLog(message) {
    if (!logContentElement) {
        // Initialize if not already done (e.g., if called before DOMContentLoaded)
        logContentElement = document.getElementById('log-content');
        if (!logContentElement) return; // Still not found, exit
    }
    const p = document.createElement('p');
    p.textContent = message;
    logContentElement.appendChild(p);
    logContentElement.scrollTop = logContentElement.scrollHeight; // Scroll to bottom
}

/**
 * Shows a specific modal.
 * @param {string} modalId - The ID of the modal element.
 */
export function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

/**
 * Hides a specific modal.
 * @param {string} modalId - The ID of the modal element.
 */
export function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

/**
 * Shows the generic message modal.
 * @param {string} title - The title for the message modal.
 * @param {string} message - The message content.
 */
export function showMessageModal(title, message) {
    document.getElementById('message-modal-title').textContent = title;
    document.getElementById('message-modal-text').innerHTML = message;
    showModal('message-modal');
}

/**
 * Hides the generic message modal.
 */
export function hideMessageModal() {
    hideModal('message-modal');
}

/**
 * Updates the content of the manage properties modal.
 * @param {Array<import('./board.js').Tile>} playerProperties - Array of properties owned by the current player.
 * @param {import('./players.js').Player} player - The current player object.
 */
export function updateManagePropertiesModal(playerProperties, player) {
    const listContainer = document.getElementById('manage-properties-list');
    listContainer.innerHTML = ''; // Clear existing list

    if (playerProperties.length === 0) {
        listContainer.textContent = getLocalizedText('no_properties_owned');
        return;
    }

    playerProperties.forEach(tile => {
        const propertyItem = document.createElement('div');
        propertyItem.classList.add('property-item');

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('property-item-info');

        // Color band for properties
        if (tile.type === 'property' && tile.group) {
            const colorBand = document.createElement('div');
            colorBand.classList.add('color-band', `group-${tile.group}`);
            infoDiv.appendChild(colorBand);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = getLocalizedText(tile.name_en, tile.name_bn);
        infoDiv.appendChild(nameSpan);

        if (tile.isMortgaged) {
            const mortgagedSpan = document.createElement('span');
            mortgagedSpan.textContent = ` (${getLocalizedText('mortgaged')})`;
            mortgagedSpan.style.color = 'orange';
            infoDiv.appendChild(mortgagedSpan);
        } else if (tile.type === 'property') {
            const improvementsSpan = document.createElement('span');
            if (tile.hasHotel) {
                improvementsSpan.textContent = ` (Hotel)`;
            } else if (tile.houses > 0) {
                improvementsSpan.textContent = ` (${tile.houses} Houses)`;
            }
            infoDiv.appendChild(improvementsSpan);
        }

        propertyItem.appendChild(infoDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('property-item-actions');

        if (tile.type === 'property') {
            const buildBtn = document.createElement('button');
            buildBtn.textContent = getLocalizedText('build');
            buildBtn.classList.add('game-button');
            buildBtn.onclick = () => buildHouse(tile.id);
            buildBtn.disabled = tile.hasHotel || tile.isMortgaged; // Cannot build if hotel or mortgaged
            actionsDiv.appendChild(buildBtn);

            const sellBtn = document.createElement('button');
            sellBtn.textContent = getLocalizedText('sell');
            sellBtn.classList.add('game-button');
            sellBtn.onclick = () => sellHouse(tile.id);
            sellBtn.disabled = (!tile.hasHotel && (tile.houses || 0) === 0) || tile.isMortgaged; // Cannot sell if no improvements or mortgaged
            actionsDiv.appendChild(sellBtn);
        }

        const mortgageBtn = document.createElement('button');
        mortgageBtn.textContent = tile.isMortgaged ? getLocalizedText('unmortgage') : getLocalizedText('mortgage');
        mortgageBtn.classList.add('game-button');
        mortgageBtn.onclick = () => tile.isMortgaged ? unmortgageProperty(tile.id) : mortgageProperty(tile.id);
        // Disable mortgage if has houses/hotel or already mortgaged
        mortgageBtn.disabled = (tile.type === 'property' && ((tile.houses || 0) > 0 || tile.hasHotel) && !tile.isMortgaged);
        actionsDiv.appendChild(mortgageBtn);

        propertyItem.appendChild(actionsDiv);
        listContainer.appendChild(propertyItem);
    });
}

/**
 * Toggles the visibility of the debug panel.
 */
export function toggleDebugPanel() {
    const debugPanel = document.getElementById('debug-panel');
    debugPanel.classList.toggle('hidden');
}

/**
 * Sets up listeners for debug buttons.
 */
export function setupDebugButtons() {
    document.getElementById('debug-give-cash').addEventListener('click', () => {
        const player = window.gameState.players[window.gameState.currentPlayerIndex];
        const amount = parseInt(prompt(getLocalizedText('enter_amount_to_give')));
        if (!isNaN(amount)) {
            player.addCash(amount);
            updateLog(`${player.name} ${getLocalizedText('received')} ${window.gameState.config.currencySymbol} ${amount} (Debug).`);
            updateUI();
        }
    });

    document.getElementById('debug-force-card').addEventListener('click', () => {
        const player = window.gameState.players[window.gameState.currentPlayerIndex];
        const cardType = prompt(getLocalizedText('enter_card_type_prompt')); // 'event' or 'local_news'
        if (cardType === 'event' || cardType === 'local_news') {
            // This is a simplified force card. In a full debug, you'd pick a specific card.
            const deck = cardType === 'event' ? window.gameState.eventCards : window.gameState.localNewsCards;
            const card = deck[Math.floor(Math.random() * deck.length)]; // Pick random card
            if (card) {
                updateLog(`${player.name} ${getLocalizedText('forced_card_draw')} (${cardType}): "${getLocalizedText(card.text_en, card.text_bn)}" (Debug).`);
                showMessageModal(getLocalizedText('card_drawn'), getLocalizedText(card.text_en, card.text_bn));
                // Directly execute action without drawing from deck
                setTimeout(() => {
                    // Call executeCardAction from gameEngine
                    import('./gameEngine.js').then(gameEngine => {
                        gameEngine.executeCardAction(player, card);
                    });
                }, 1000);
            } else {
                updateLog(getLocalizedText('no_cards_in_deck', cardType));
            }
        } else {
            updateLog(getLocalizedText('invalid_card_type'));
        }
    });

    document.getElementById('debug-add-house').addEventListener('click', () => {
        const player = window.gameState.players[window.gameState.currentPlayerIndex];
        const tileId = parseInt(prompt(getLocalizedText('enter_tile_id_to_add_house')));
        const tile = window.gameState.tiles.find(t => t.id === tileId);
        if (tile && tile.type === 'property' && tile.owner === player.id) {
            if (tile.hasHotel) {
                updateLog(getLocalizedText('already_has_hotel_debug'));
            } else if ((tile.houses || 0) < 4) {
                tile.houses = (tile.houses || 0) + 1;
                updateLog(`${player.name} ${getLocalizedText('added_house_to')} ${getLocalizedText(tile.name_en, tile.name_bn)} (Debug).`);
                import('./board.js').then(board => board.renderPropertyImprovements(tile.id, tile.houses, tile.hasHotel));
            } else if ((tile.houses || 0) === 4) {
                tile.houses = 0;
                tile.hasHotel = true;
                updateLog(`${player.name} ${getLocalizedText('added_hotel_to')} ${getLocalizedText(tile.name_en, tile.name_bn)} (Debug).`);
                import('./board.js').then(board => board.renderPropertyImprovements(tile.id, tile.houses, tile.hasHotel));
            }
            updateUI();
        } else {
            updateLog(getLocalizedText('invalid_property_for_house'));
        }
    });

    document.getElementById('debug-teleport').addEventListener('click', () => {
        const player = window.gameState.players[window.gameState.currentPlayerIndex];
        const newPos = parseInt(prompt(getLocalizedText('enter_tile_id_to_teleport')));
        if (!isNaN(newPos) && newPos >= 0 && newPos < window.gameState.tiles.length) {
            player.position = newPos;
            updateLog(`${player.name} ${getLocalizedText('teleported_to')} ${getLocalizedText(window.gameState.tiles[newPos].name_en, window.gameState.tiles[newPos].name_bn)} (Debug).`);
            import('./board.js').then(board => board.updatePlayerTokenPosition(player.id, player.position));
            // Trigger land on tile logic after teleport
            import('./gameEngine.js').then(gameEngine => {
                gameEngine.landOnTile(player, window.gameState.tiles[player.position]);
            });
            updateUI();
        } else {
            updateLog(getLocalizedText('invalid_tile_id_teleport'));
        }
    });

    document.getElementById('debug-bankrupt').addEventListener('click', () => {
        const player = window.gameState.players[window.gameState.currentPlayerIndex];
        // Call bankruptPlayer from gameEngine
        import('./gameEngine.js').then(gameEngine => {
            gameEngine.bankruptPlayer(player, null); // Bankrupt to bank
        });
        updateLog(`${player.name} ${getLocalizedText('forced_bankrupt')} (Debug).`);
    });

    document.getElementById('debug-close').addEventListener('click', toggleDebugPanel);
}
