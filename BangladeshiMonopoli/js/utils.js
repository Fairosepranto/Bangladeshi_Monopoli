/**
 * Loads a JSON file from the specified path.
 * @param {string} path - The path to the JSON file.
 * @returns {Promise<object>} A promise that resolves with the parsed JSON data.
 */
export async function loadData(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${path}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Could not load data from ${path}:`, error);
        throw error; // Re-throw to be caught by the caller
    }
}


/**
 * Plays a sound effect if SFX are enabled.
 * @param {string} soundId - The ID of the audio element (e.g., 'dice-sfx').
 */
export function playSound(soundId) {
    if (window.gameState.sfxEnabled) {
        const audio = document.getElementById(soundId);
        if (audio) {
            audio.currentTime = 0; // Rewind to start if already playing
            audio.play().catch(e => console.warn("Audio playback failed:", e));
        } else {
            console.warn(`Audio element with ID '${soundId}' not found.`);
        }
    }
}