/**
 * Shuffles an array in place (Fisher-Yates algorithm).
 * @param {Array<any>} array - The array to shuffle.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


/**
 * Draws a card from the specified deck. Shuffles if deck is empty.
 * @param {Array<object>} deck - The array representing the card deck.
 * @returns {object|null} The drawn card object, or null if deck is empty.
 */
export function drawCard(deck) {
    if (deck.length === 0) {
        // If deck is empty, re-shuffle the discard pile (if we had one)
        // For simplicity, we'll just re-use the original cards if the deck runs out.
        // In a real game, cards are discarded and re-shuffled when the draw pile is empty.
        // TODO: Implement a discard pile and re-shuffling logic.
        console.warn("Card deck is empty. Re-using original cards for now.");
        if (deck === window.gameState.eventCards) {
            deck.push(...window.gameState.eventCards); // This will duplicate if not careful
            // A better approach would be to have a separate original deck and a current deck.
            // For now, let's assume we always have cards.
        } else if (deck === window.gameState.localNewsCards) {
            deck.push(...window.gameState.localNewsCards);
        }
        shuffle(deck);
    }


    if (deck.length > 0) {
        return deck.shift(); // Remove and return the first card
    }
    return null;
}


/**
 * Initializes card decks by shuffling them.
 */
export function initDecks() {
    shuffle(window.gameState.eventCards);
    shuffle(window.gameState.localNewsCards);
}