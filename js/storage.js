import { updateLog } from './ui.js';
import { getLocalizedText } from './i18n.js';

const LOCAL_STORAGE_KEY = 'bangladeshiMonopolySave';

/**
 * Saves the current game state to localStorage.
 * @param {object} gameState - The entire game state object to save.
 */
export function saveGameState(gameState) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
        console.error("Error saving game state to localStorage:", e);
        updateLog(getLocalizedText('save_failed'));
    }
}

/**
 * Loads game state from localStorage.
 * @returns {object|null} The loaded game state object, or null if not found/error.
 */
export function loadGameState() {
    try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            return JSON.parse(savedState);
        }
    } catch (e) {
        console.error("Error loading game state from localStorage:", e);
        updateLog(getLocalizedText('load_failed'));
    }
    return null;
}

/**
 * Clears the saved game state from localStorage.
 */
export function clearGameState() {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
        console.error("Error clearing game state from localStorage:", e);
    }
}
