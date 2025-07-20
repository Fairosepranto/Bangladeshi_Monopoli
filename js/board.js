import { getLocalizedText } from './i18n.js';
import { showModal, showMessageModal, updateLog } from './ui.js';
import { getPlayerColor } from './players.js';

/**
 * @typedef {object} Tile
 * @property {number} id - Unique ID of the tile.
 * @property {string} type - Type of the tile (e.g., "go", "property", "station").
 * @property {string} [group] - Color group for properties.
 * @property {string} name_en - English name of the tile.
 * @property {string} [name_bn] - Bengali name of the tile.
 * @property {number} [price] - Purchase price for properties/stations/utilities.
 * @property {number[]} [rent] - Rent array for properties (0 houses to hotel).
 * @property {number} [baseRent] - Base rent for stations.
 * @property {string} [subtype] - Specific subtype for tax, event, utility.
 * @property {number} [payout] - Money received for GO.
 * @property {number} [amount] - Amount for tax.
 * @property {number} [owner] - Index of the player who owns this property.
 * @property {number} [houses] - Number of houses on the property (0-4).
 * @property {boolean} [hasHotel] - True if property has a hotel.
 * @property {boolean} [isMortgaged] - True if property is mortgaged.
 */

/**
 * @type {Tile[]}
 */
let boardTiles = [];
let boardContainer;

/**
 * Initializes the board with tile data.
 * @param {Tile[]} tilesData - Array of tile objects.
 */
export function initBoard(tilesData) {
    boardTiles = tilesData;
    boardContainer = document.getElementById('board-container');
}

/**
 * Renders the game board based on the boardTiles data.
 */
export function renderBoard() {
    if (!boardContainer) {
        console.error("Board container not found.");
        return;
    }
    boardContainer.innerHTML = ''; // Clear existing board content (including center text temporarily)

    // Determine the grid positions for each tile
    const tilePositions = calculateTilePositions(boardTiles.length);

    boardTiles.forEach((tile, index) => {
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        tileElement.dataset.id = tile.id;
        tileElement.dataset.index = index;

        // Apply specific classes for layout and styling
        if (index === 0 || index === 10 || index === 20 || index === 30) {
            tileElement.classList.add('corner');
        }

        // Add class for side to apply correct color band positioning
        if (index >= 0 && index <= 9) {
            tileElement.classList.add('bottom-row');
        } else if (index >= 10 && index <= 19) {
            tileElement.classList.add('left-column');
        } else if (index >= 20 && index <= 29) {
            tileElement.classList.add('top-row');
        } else if (index >= 30 && index <= 39) {
            tileElement.classList.add('right-column');
        }

        // Apply specific tile type classes
        tileElement.classList.add(tile.type.replace(/_/g, '-')); // e.g., 'go-to-jail' becomes 'go-to-jail'

        // Add color band for properties
        if (tile.type === 'property' && tile.group) {
            const colorBand = document.createElement('div');
            colorBand.classList.add('color-band', `group-${tile.group}`);
            tileElement.appendChild(colorBand);
            tileElement.classList.add(`group-${tile.group}`); // Add group class to tile for general styling
        }

        // Add icon based on tile type
        const iconElement = document.createElement('div');
        iconElement.classList.add('icon');
        iconElement.innerHTML = getTileIcon(tile.type, tile.subtype);
        tileElement.appendChild(iconElement);

        // Add tile name
        const nameElement = document.createElement('div');
        nameElement.classList.add('tile-name');
        nameElement.textContent = getLocalizedText(tile.name_en, tile.name_bn);
        tileElement.appendChild(nameElement);

        // Add price for purchasable tiles
        if (tile.price) {
            const priceElement = document.createElement('div');
            priceElement.classList.add('tile-price');
            priceElement.textContent = `${window.gameState.config.currencySymbol} ${tile.price}`;
            tileElement.appendChild(priceElement);
        }

        // Add houses/hotels if applicable
        if (tile.type === 'property' && (tile.houses > 0 || tile.hasHotel)) {
            renderPropertyImprovements(tile.id, tile.houses, tile.hasHotel);
        }

        // Set grid position and span directly here for all tiles
        const pos = tilePositions[index];
        tileElement.style.gridColumn = pos.col;
        tileElement.style.gridRow = pos.row;
        // Corner tiles span 2x2 cells
        if (index === 0 || index === 10 || index === 20 || index === 30) {
            tileElement.style.gridColumnEnd = `span 2`;
            tileElement.style.gridRowEnd = `span 2`;
        }

        // --- DEBUGGING: Log tile positions ---
        console.log(`Tile ${index} (${tile.name_en}): grid-row: ${pos.row}, grid-column: ${pos.col}${tileElement.classList.contains('corner') ? ', span 2' : ''}`);
        // --- END DEBUGGING ---


        // Add click listener to show tile details
        tileElement.addEventListener('click', () => showTileDetails(tile));

        boardContainer.appendChild(tileElement);
    });

    // Re-append the center text div after tiles are rendered
    const centerTextDiv = document.getElementById('board-center-text');
    if (centerTextDiv) { // Ensure it exists
        boardContainer.appendChild(centerTextDiv);
    }

    renderPlayerTokens();
}

/**
 * Calculates the grid positions for 40 tiles in a Monopoly-style layout on an 11x11 grid.
 * This function now correctly accounts for 2x2 corner tiles and 1x1 side tiles.
 * @param {number} numTiles - Total number of tiles (should be 40).
 * @returns {Array<{row: string, col: string}>} Array of grid positions (1-indexed).
 */
function calculateTilePositions(numTiles) {
    const positions = [];
    const gridSize = 11; // The board is an 11x11 CSS grid

    // Corner tiles are 2x2. Side tiles are 1x1.
    // The grid coordinates are 1-indexed for CSS.

    // Bottom Row (Indices 0-9)
    // Index 0: GO (bottom-right corner) - starts at grid cell (10,10) and spans 2x2
    positions.push({ row: `${gridSize - 1}`, col: `${gridSize - 1}` });

    // Tiles 1-9 (9 side tiles on bottom row, from right to left)
    // These will occupy row 11, columns 9 down to 1.
    for (let i = 1; i <= 9; i++) {
        positions.push({ row: `${gridSize}`, col: `${gridSize - 1 - i}` });
    }

    // Left Column (Indices 10-19)
    // Index 10: Jail (bottom-left corner) - starts at grid cell (10,1) and spans 2x2
    positions.push({ row: `${gridSize - 1}`, col: `1` });

    // Tiles 11-19 (9 side tiles on left column, from bottom to top)
    // These will occupy column 1, rows 9 down to 1.
    for (let i = 1; i <= 9; i++) {
        positions.push({ row: `${gridSize - 1 - i}`, col: `1` });
    }

    // Top Row (Indices 20-29)
    // Index 20: Free Parking (top-left corner) - starts at grid cell (1,1) and spans 2x2
    positions.push({ row: `1`, col: `1` });

    // Tiles 21-29 (9 side tiles on top row, from left to right)
    // These will occupy row 1, columns 2 up to 10.
    for (let i = 1; i <= 9; i++) {
        positions.push({ row: `1`, col: `${1 + i}` });
    }

    // Right Column (Indices 30-39)
    // Index 30: Go To Jail (top-right corner) - starts at grid cell (1,10) and spans 2x2
    positions.push({ row: `1`, col: `${gridSize - 1}` });

    // Tiles 31-39 (9 side tiles on right column, from top to bottom)
    // These will occupy column 11, rows 2 up to 10.
    for (let i = 1; i <= 9; i++) {
        positions.push({ row: `${1 + i}`, col: `${gridSize}` });
    }

    return positions;
}


/**
 * Returns an SVG or emoji icon based on tile type.
 * @param {string} type - The tile type.
 * @param {string} [subtype] - The tile subtype.
 * @returns {string} HTML string for the icon.
 */
function getTileIcon(type, subtype) {
    switch (type) {
        case 'go': return '🚀'; // Rocket
        case 'property': return '🏠'; // House
        case 'station': return '🚂'; // Train
        case 'utility':
            if (subtype === 'power') return '💡'; // Lightbulb
            if (subtype === 'internet') return '📡'; // Satellite dish
            return '⚙️'; // Gear
        case 'tax':
            if (subtype === 'nbr_tax') return '💸'; // Money with wings
            if (subtype === 'luxury_duty') return '💎'; // Gem stone
            return '💰'; // Money bag
        case 'event': return '❓'; // Question mark
        case 'local_news': return '📰'; // Newspaper
        case 'jail_visiting': return '👮'; // Police officer
        case 'free_parking': return '☕'; // Coffee/Tea
        case 'goto_jail': return '🚨'; // Siren
        default: return '📍'; // Pin
    }
}

/**
 * Shows a modal with details about the clicked tile.
 * @param {Tile} tile - The tile object.
 */
function showTileDetails(tile) {
    let message = `<strong>${getLocalizedText(tile.name_en, tile.name_bn)}</strong><br>`;

    if (tile.type === 'property' || tile.type === 'station' || tile.type === 'utility') {
        message += `Price: ${window.gameState.config.currencySymbol} ${tile.price}<br>`;
        if (tile.owner !== undefined && window.gameState.players[tile.owner]) {
            const owner = window.gameState.players[tile.owner];
            message += `Owner: <span style="color:${getPlayerColor(owner.id)};">${owner.name}</span><br>`;
            if (tile.type === 'property') {
                message += `Houses: ${tile.houses || 0}, Hotel: ${tile.hasHotel ? 'Yes' : 'No'}<br>`;
                message += `Rent (0 houses): ${window.gameState.config.currencySymbol} ${tile.rent[0]}<br>`;
                message += `Rent (1 house): ${window.gameState.config.currencySymbol} ${tile.rent[1]}<br>`;
                message += `Rent (2 houses): ${window.gameState.config.currencySymbol} ${tile.rent[2]}<br>`;
                message += `Rent (3 houses): ${window.gameState.config.currencySymbol} ${tile.rent[3]}<br>`;
                message += `Rent (4 houses): ${window.gameState.config.currencySymbol} ${tile.rent[4]}<br>`;
                message += `Rent (Hotel): ${window.gameState.config.currencySymbol} ${tile.rent[5]}<br>`;
            } else if (tile.type === 'station') {
                message += `Base Rent: ${window.gameState.config.currencySymbol} ${tile.baseRent}<br>`;
            }
        } else {
            message += `Unowned.<br>`;
        }
    } else if (tile.type === 'go') {
        message += `Collect ${window.gameState.config.currencySymbol} ${tile.payout} when you pass or land here.`;
    } else if (tile.type === 'tax') {
        message += `Pay ${window.gameState.config.currencySymbol} ${tile.amount} tax.`;
    } else if (tile.type === 'event' || tile.type === 'local_news') {
        message += `Draw a card.`;
    } else if (tile.type === 'jail_visiting') {
        message += `Just visiting Thana.`;
    } else if (tile.type === 'goto_jail') {
        message += `Go directly to Thana. Do not pass GO, do not collect ${window.gameState.config.currencySymbol} ${window.gameState.config.goMoney}.`;
    } else if (tile.type === 'free_parking') {
        message += `Take a Cha Bazar Break.`;
    }

    showMessageModal(getLocalizedText('tile_details', 'টাইল বিবরণ'), message);
}

/**
 * Renders all player tokens on the board.
 */
export function renderPlayerTokens() {
    // Remove existing tokens
    document.querySelectorAll('.player-token').forEach(token => token.remove());

    window.gameState.players.forEach(player => {
        if (!player.isBankrupt) {
            const tokenElement = document.createElement('div');
            tokenElement.classList.add('player-token', `player-${player.id}`);
            tokenElement.dataset.playerId = player.id;
            boardContainer.appendChild(tokenElement);
            updatePlayerTokenPosition(player.id, player.position);
        }
    });
}

/**
 * Updates the visual position of a player's token on the board.
 * @param {number} playerId - The ID of the player.
 * @param {number} newPosition - The new tile index.
 */
export function updatePlayerTokenPosition(playerId, newPosition) {
    const token = document.querySelector(`.player-token.player-${playerId}`);
    if (!token) {
        console.warn(`Player token for ID ${playerId} not found.`);
        return;
    }

    const tileElement = document.querySelector(`.tile[data-index="${newPosition}"]`);
    if (!tileElement) {
        console.error(`Tile element for index ${newPosition} not found.`);
        return;
    }

    // Get the bounding rectangle of the tile
    const tileRect = tileElement.getBoundingClientRect();
    const boardRect = boardContainer.getBoundingClientRect();

    // Calculate relative position within the board container
    const relativeLeft = tileRect.left - boardRect.left;
    const relativeTop = tileRect.top - boardRect.top;

    // Adjust token position to fit within the tile, potentially staggering if multiple players on same tile
    const playersOnTile = window.gameState.players.filter(p => p.position === newPosition && !p.isBankrupt);
    const tokenIndexOnTile = playersOnTile.findIndex(p => p.id === playerId);

    // Simple staggering: offset by a small amount based on tokenIndexOnTile
    const offsetX = (tokenIndexOnTile % 3) * 10; // Max 3 per row
    const offsetY = Math.floor(tokenIndexOnTile / 3) * 10;

    // Position the token
    token.style.left = `${relativeLeft + 5 + offsetX}px`; // 5px padding from left edge
    token.style.top = `${relativeTop + 5 + offsetY}px`; // 5px padding from top edge
}

/**
 * Renders houses and hotels on a specific property tile.
 * @param {number} tileId - The ID of the property tile.
 * @param {number} houses - Number of houses (0-4).
 * @param {boolean} hasHotel - True if there's a hotel.
 */
export function renderPropertyImprovements(tileId, houses, hasHotel) {
    const tile = document.querySelector(`.tile[data-id="${tileId}"]`);
    if (!tile) return;

    // Remove existing improvements
    let housesContainer = tile.querySelector('.houses-container');
    if (housesContainer) {
        housesContainer.remove();
    }

    if (houses === 0 && !hasHotel) {
        return; // No improvements to render
    }

    housesContainer = document.createElement('div');
    housesContainer.classList.add('houses-container');

    if (hasHotel) {
        const hotel = document.createElement('div');
        hotel.classList.add('hotel');
        housesContainer.appendChild(hotel);
    } else {
        for (let i = 0; i < houses; i++) {
            const house = document.createElement('div');
            house.classList.add('house');
            housesContainer.appendChild(house);
        }
    }
    tile.appendChild(housesContainer);
}

/**
 * Highlights the current player's token.
 * @param {number} playerId - The ID of the current player.
 */
export function highlightCurrentPlayerToken(playerId) {
    document.querySelectorAll('.player-token').forEach(token => {
        token.style.border = '2px solid var(--light-text)'; // Reset border
        token.style.transform = 'scale(1)';
        token.style.zIndex = '10';
    });

    const currentPlayerToken = document.querySelector(`.player-token.player-${playerId}`);
    if (currentPlayerToken) {
        currentPlayerToken.style.border = '3px solid var(--bangladesh-red)'; // Highlight border
        currentPlayerToken.style.transform = 'scale(1.1)';
        currentPlayerToken.style.zIndex = '11';
    }
}
