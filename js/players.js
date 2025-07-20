/**
 * Represents a player in the Monopoly game.
 */
export class Player {
    /**
     * @param {number} id - Unique ID for the player (0-indexed).
     * @param {string} name - The name of the player.
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.cash = 15000; // Starting cash, configurable in boardData.json if needed
        this.position = 0; // Start at GO
        this.properties = []; // Array of tile IDs owned
        this.isInJail = false;
        this.jailTurns = 0; // Turns spent in jail
        this.getOutOfJailCards = 0;
        this.doublesRolled = 0; // Consecutive doubles
        this.isBankrupt = false;
    }


    /**
     * Adds cash to the player's balance.
     * @param {number} amount - The amount of cash to add.
     */
    addCash(amount) {
        this.cash += amount;
    }


    /**
     * Deducts cash from the player's balance.
     * @param {number} amount - The amount of cash to deduct.
     */
    deductCash(amount) {
        this.cash -= amount;
    }


    /**
     * Calculates the player's net worth (cash + property values).
     * @returns {number} The player's net worth.
     */
    getNetWorth() {
        let netWorth = this.cash;
        this.properties.forEach(propId => {
            const tile = window.gameState.tiles.find(t => t.id === propId);
            if (tile) {
                netWorth += tile.price || 0;
                if (tile.type === 'property') {
                    netWorth += (tile.houses || 0) * window.gameState.config.houseCost;
                    netWorth += (tile.hasHotel ? window.gameState.config.hotelCost : 0);
                }
            }
        });
        return netWorth;
    }
}


/**
 * Returns the CSS color variable for a given player ID.
 * @param {number} playerId - The ID of the player.
 * @returns {string} The CSS color variable string.
 */
export function getPlayerColor(playerId) {
    const colors = [
        'var(--player1-color)',
        'var(--player2-color)',
        'var(--player3-color)',
        'var(--player4-color)',
        'var(--player5-color)',
        'var(--player6-color)'
    ];
    return colors[playerId % colors.length];
}