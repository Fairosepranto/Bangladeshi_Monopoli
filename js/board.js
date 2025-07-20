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
    boardContainer.innerHTML = ''; // Clear existing board


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


        // Set grid position
        tileElement.style.gridColumn = tilePositions[index].col;
        tileElement.style.gridRow = tilePositions[index].row;


        // Add click listener to show tile details
        tileElement.addEventListener('click', () => showTileDetails(tile));


        boardContainer.appendChild(tileElement);
    });


    renderPlayerTokens();
}


/**
 * Calculates the grid positions for 40 tiles in a Monopoly-style layout.
 * @param {number} numTiles - Total number of tiles (should be 40).
 * @returns {Array<{row: string, col: string}>} Array of grid positions.
 */
function calculateTilePositions(numTiles) {
    const positions = [];
    const boardSize = 11; // 11x11 grid including corner spaces


    // Bottom row (index 0-9) - from bottom-right (10,10) to bottom-left (0,10)
    // Index 0 (GO) is at (11,11) in CSS grid terms, but we use 1-based indexing for grid-column/row
    for (let i = 0; i < 10; i++) {
        positions.push({ row: `${boardSize}`, col: `${boardSize - i}` });
    }


    // Left column (index 10-19) - from bottom-left (0,10) to top-left (0,0)
    for (let i = 0; i < 10; i++) {
        positions.push({ row: `${boardSize - 1 - i}`, col: `1` });
    }


    // Top row (index 20-29) - from top-left (0,0) to top-right (10,0)
    for (let i = 0; i < 10; i++) {
        positions.push({ row: `1`, col: `${1 + i}` });
    }


    // Right column (index 30-39) - from top-right (10,0) to bottom-right (10,10)
    for (let i = 0; i < 10; i++) {
        positions.push({ row: `${1 + i}`, col: `${boardSize}` });
    }


    // Adjust for 1-based CSS grid indexing if needed, but the current logic should map correctly.
    // The main point is that the corner tiles span 2x2 cells, and the side tiles are 1x1.
    // The grid-template-columns/rows are 11x11.
    // The corner tiles will occupy the actual corners of the 11x11 grid.
    // This calculation is for the 40 standard tiles, assuming a 1-based grid system for CSS.


    // Correcting the corner tiles' grid-span for the 11x11 grid:
    // GO (index 0) is at (11,11)
    // Jail (index 10) is at (11,1)
    // Free Parking (index 20) is at (1,1)
    // Go To Jail (index 30) is at (1,11)


    // The current CSS handles the span for corners, so this function just needs to provide the starting cell for each tile.
    // The initial loop positions are correct for a 1-based grid.
    // For a 40 tile board on an 11x11 grid, the corner tiles will naturally align if their grid-span is handled by CSS.


    // Let's re-verify the grid positions for a 40-tile board on an 11x11 grid.
    // The CSS handles the `grid-column: span 2; grid-row: span 2;` for `.tile.corner`.
    // This function needs to assign the top-left most cell for each tile.
    const newPositions = [];
    // Bottom side (from right to left, 10 tiles)
    // GO (0): col 11, row 11
    // 1-9: col 10 to 2, row 11
    for (let i = 0; i < 10; i++) {
        newPositions.push({ row: '11', col: `${11 - i}` });
    }


    // Left side (from bottom to top, 10 tiles)
    // Jail (10): col 1, row 11
    // 11-19: col 1, row 10 to 2
    for (let i = 0; i < 10; i++) {
        newPositions.push({ row: `${11 - i}`, col: '1' });
    }


    // Top side (from left to right, 10 tiles)
    // Free Parking (20): col 1, row 1
    // 21-29: col 2 to 10, row 1
    for (let i = 0; i < 10; i++) {
        newPositions.push({ row: '1', col: `${1 + i}` });
    }


    // Right side (from top to bottom, 10 tiles)
    // Go To Jail (30): col 11, row 1
    // 31-39: col 11, row 2 to 10
    for (let i = 0; i < 10; i++) {
        newPositions.push({ row: `${1 + i}`, col: '11' });
    }


    return newPositions;
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