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