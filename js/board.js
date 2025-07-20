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

        // Set grid position and span directly here for all tiles
        const pos = tilePositions[index];
        tileElement.style.gridColumn = pos.col;
        tileElement.style.gridRow = pos.row;
        if (tile.type === 'go' || tile.type === 'jail_visiting' || tile.type === 'free_parking' || tile.type === 'goto_jail') {
            tileElement.style.gridColumnEnd = `span 2`;
            tileElement.style.gridRowEnd = `span 2`;
        }


        // Add click listener to show tile details
        tileElement.addEventListener('click', () => showTileDetails(tile));

        boardContainer.appendChild(tileElement);
    });

    // Re-append the center text div after tiles are rendered
    const centerTextDiv = document.getElementById('board-center-text');
    if (centerTextDiv && !boardContainer.contains(centerTextDiv)) {
        boardContainer.appendChild(centerTextDiv);
    }

    renderPlayerTokens();
}

/**
 * Calculates the grid positions for 40 tiles in a Monopoly-style layout.
 * This function now explicitly handles the 2x2 span for corner tiles
 * by leaving gaps for them in the 11x11 grid.
 * @param {number} numTiles - Total number of tiles (should be 40).
 * @returns {Array<{row: string, col: string}>} Array of grid positions.
 */
function calculateTilePositions(numTiles) {
    const positions = [];
    const boardGridSize = 11; // The board is an 11x11 CSS grid

    // The order of tiles is clockwise starting from bottom-right (GO)
    // Index 0: GO (bottom-right corner) - occupies grid cells 10-11 for row, 10-11 for col
    // So its top-left corner is at grid cell (10,10)
    positions.push({ row: `${boardGridSize-1}`, col: `${boardGridSize-1}` }); // GO (index 0)

    // Bottom row (indices 1-9) - from right to left, excluding corners
    // These are 1x2 cells, but we define their top-left grid cell.
    // The previous GO tile occupied (10,10) and (10,11) for column, (11,10) and (11,11) for row.
    // So the next tile starts at column 9, row 11.
    for (let i = 1; i <= 9; i++) { // 9 tiles
        positions.push({ row: `${boardGridSize}`, col: `${boardGridSize - 1 - i}` });
    }

    // Index 10: Jail (bottom-left corner) - occupies grid cells 1-2 for row, 1-2 for col
    // So its top-left corner is at grid cell (10,1)
    positions.push({ row: `${boardGridSize-1}`, col: `1` }); // Jail (index 10)

    // Left column (indices 11-19) - from bottom to top, excluding corners
    for (let i = 1; i <= 9; i++) { // 9 tiles
        positions.push({ row: `${boardGridSize - 1 - i}`, col: `1` });
    }

    // Index 20: Free Parking (top-left corner) - occupies grid cells 1-2 for row, 1-2 for col
    // So its top-left corner is at grid cell (1,1)
    positions.push({ row: `1`, col: `1` }); // Free Parking (index 20)

    // Top row (indices 21-29) - from left to right, excluding corners
    for (let i = 1; i <= 9; i++) { // 9 tiles
        positions.push({ row: `1`, col: `${1 + i}` });
    }

    // Index 30: Go To Jail (top-right corner) - occupies grid cells 1-2 for row, 1-2 for col
    // So its top-left corner is at grid cell (1,10)
    positions.push({ row: `1`, col: `${boardGridSize-1}` }); // Go To Jail (index 30)

    // Right column (indices 31-39) - from top to bottom, excluding corners
    for (let i = 1; i <= 9; i++) { // 9 tiles
        positions.push({ row: `${1 + i}`, col: `${boardGridSize}` });
    }

    // Let's adjust the row/column values for the corner tiles to be 1-based for CSS grid-column/row.
    // The previous logic was slightly off for 1-based indexing with span.

    const finalPositions = [];
    // Bottom row (indices 0-9)
    // GO (index 0)
    finalPositions.push({ row: `${boardGridSize-1}`, col: `${boardGridSize-1}` }); // This is the top-left cell of the 2x2 corner

    // Tiles 1-9 (side tiles)
    for (let i = 1; i < 10; i++) {
        finalPositions.push({ row: `${boardGridSize}`, col: `${boardGridSize - 1 - i}` });
    }

    // Left column (indices 10-19)
    // Jail (index 10)
    finalPositions.push({ row: `${boardGridSize-1}`, col: `1` }); // Top-left cell of the 2x2 corner

    // Tiles 11-19 (side tiles)
    for (let i = 1; i < 10; i++) {
        finalPositions.push({ row: `${boardGridSize - 1 - i}`, col: `1` });
    }

    // Top row (indices 20-29)
    // Free Parking (index 20)
    finalPositions.push({ row: `1`, col: `1` }); // Top-left cell of the 2x2 corner

    // Tiles 21-29 (side tiles)
    for (let i = 1; i < 10; i++) {
        finalPositions.push({ row: `1`, col: `${1 + i}` });
    }

    // Right column (indices 30-39)
    // Go To Jail (index 30)
    finalPositions.push({ row: `1`, col: `${boardGridSize-1}` }); // Top-left cell of the 2x2 corner

    // Tiles 31-39 (side tiles)
    for (let i = 1; i < 10; i++) {
        finalPositions.push({ row: `${1 + i}`, col: `${boardGridSize}` });
    }

    // Re-checking the logic for 11x11 grid:
    // Corners are 2x2. Sides are 1x1.
    // Total cells: 11x11 = 121
    // Corners: 4 * (2*2) = 16 cells
    // Sides: (11-2)*4 = 9*4 = 36 cells (if tiles were 1x1)
    // This is not a simple 11x11 grid where each tile is 1 cell.
    // It's a grid where corners take 2 cells in each direction.

    // Let's use a simpler, more direct mapping for an 11x11 grid.
    // Grid cells are 1-indexed.
    const directPositions = [];

    // Bottom row (indices 0-9)
    // index 0 (GO) is at (row 10, col 10) and spans 2x2
    directPositions.push({ row: '10', col: '10' }); // GO

    // Tiles 1-9 (9 tiles)
    // Tile 1 is at (row 11, col 9)
    // Tile 9 is at (row 11, col 1)
    for (let i = 1; i < 10; i++) {
        directPositions.push({ row: '11', col: `${10 - i}` });
    }

    // Left column (indices 10-19)
    // index 10 (Jail) is at (row 10, col 1) and spans 2x2
    directPositions.push({ row: '10', col: '1' }); // Jail

    // Tiles 11-19 (9 tiles)
    // Tile 11 is at (row 9, col 1)
    // Tile 19 is at (row 2, col 1)
    for (let i = 1; i < 10; i++) {
        directPositions.push({ row: `${10 - i}`, col: '1' });
    }

    // Top row (indices 20-29)
    // index 20 (Free Parking) is at (row 1, col 1) and spans 2x2
    directPositions.push({ row: '1', col: '1' }); // Free Parking

    // Tiles 21-29 (9 tiles)
    // Tile 21 is at (row 1, col 2)
    // Tile 29 is at (row 1, col 10)
    for (let i = 1; i < 10; i++) {
        directPositions.push({ row: '1', col: `${1 + i}` });
    }

    // Right column (indices 30-39)
    // index 30 (Go To Jail) is at (row 1, col 10) and spans 2x2
    directPositions.push({ row: '1', col: '10' }); // Go To Jail

    // Tiles 31-39 (9 tiles)
    // Tile 31 is at (row 2, col 11)
    // Tile 39 is at (row 10, col 11)
    for (let i = 1; i < 10; i++) {
        directPositions.push({ row: `${1 + i}`, col: '11' });
    }

    return directPositions;
}
