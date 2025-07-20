import { Player, getPlayerColor } from './players.js';
import { updateUI, updatePlayerInfo, updatePlayerList, updateDiceDisplay, updateLog, showModal, hideModal, showMessageModal, hideMessageModal, updateManagePropertiesModal } from './ui.js';
import { updatePlayerTokenPosition, renderPlayerTokens, renderPropertyImprovements, highlightCurrentPlayerToken } from './board.js';
import { drawCard } from './cards.js';
import { saveGameState, loadGameState, clearGameState } from './storage.js';
import { getLocalizedText } from './i18n.js';
import { playSound } from './audio.js';

/**
 * Initializes the game state and sets up initial players.
 */
export function initGame() {
    window.gameState.players = [];
    window.gameState.currentPlayerIndex = 0;
    window.gameState.dice = [1, 1];
    window.gameState.freeParkingPot = 0;
    window.gameState.isGameRunning = false;

    // Reset tiles owner, houses, mortgage status
    window.gameState.tiles.forEach(tile => {
        delete tile.owner;
        delete tile.houses;
        delete tile.hasHotel;
        delete tile.isMortgaged;
    });

    updateLog(getLocalizedText('game_initialized'));
    updateUI();
}

/**
 * Starts a new game, prompting for player count.
 */
export function startGame() {
    let numPlayers = prompt(getLocalizedText('enter_num_players_prompt'), '2');
    numPlayers = parseInt(numPlayers);

    if (isNaN(numPlayers) || numPlayers < 2 || numPlayers > 6) {
        showMessageModal(getLocalizedText('invalid_input'), getLocalizedText('invalid_players_count'));
        return;
    }

    initGame(); // Reset game state before starting a new one

    for (let i = 0; i < numPlayers; i++) {
        const playerName = prompt(getLocalizedText('enter_player_name_prompt') + (i + 1), `${getLocalizedText('player')} ${i + 1}`);
        window.gameState.players.push(new Player(i, playerName || `${getLocalizedText('player')} ${i + 1}`));
    }

    window.gameState.isGameRunning = true;
    renderPlayerTokens();
    updateUI();
    updateLog(getLocalizedText('game_started_with') + `${numPlayers} ${getLocalizedText('players')}.`);
    highlightCurrentPlayerToken(window.gameState.players[window.gameState.currentPlayerIndex].id);
    document.getElementById('roll-dice-btn').disabled = false;
    document.getElementById('end-turn-btn').disabled = true;
}

/**
 * Gets the current player.
 * @returns {Player} The current player object.
 */
function getCurrentPlayer() {
    return window.gameState.players[window.gameState.currentPlayerIndex];
}

/**
 * Rolls the dice, moves the player, and handles landing on a tile.
 */
export function rollDice() {
    if (!window.gameState.isGameRunning) return;

    const player = getCurrentPlayer();
    if (player.isInJail) {
        showModal('jail-modal');
        updateLog(getLocalizedText('player_in_jail', player.name));
        document.getElementById('roll-dice-btn').disabled = true; // Disable roll button while in jail modal
        return;
    }

    document.getElementById('roll-dice-btn').disabled = true; // Disable roll button after rolling
    document.getElementById('end-turn-btn').disabled = true; // Disable end turn until action is complete

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    window.gameState.dice = [die1, die2];
    updateDiceDisplay(die1, die2);
    playSound('dice-sfx');

    const rollSum = die1 + die2;
    updateLog(`${player.name} ${getLocalizedText('rolled')} ${die1} + ${die2} = ${rollSum}`);

    // Dice rolling animation
    const die1El = document.getElementById('die1');
    const die2El = document.getElementById('die2');
    die1El.classList.add('rolling');
    die2El.classList.add('rolling');

    setTimeout(() => {
        die1El.classList.remove('rolling');
        die2El.classList.remove('rolling');

        // Check for doubles
        if (die1 === die2) {
            player.doublesRolled++;
            updateLog(getLocalizedText('doubles_rolled'));
            if (player.doublesRolled === 3) {
                updateLog(getLocalizedText('three_doubles_jail', player.name));
                sendToJail(player);
                player.doublesRolled = 0; // Reset doubles count
                endTurn(); // End turn after going to jail
                return;
            }
        } else {
            player.doublesRolled = 0; // Reset doubles count if no doubles
        }

        movePlayer(player, rollSum);
        // After move and land action, enable end turn if not in jail or special action
        if (!player.isInJail) {
            document.getElementById('end-turn-btn').disabled = false;
        }
        saveGame(); // Auto-save after each roll
    }, 1000); // Allow time for dice animation
}

/**
 * Moves the player token and handles passing GO.
 * @param {Player} player - The player object.
 * @param {number} steps - Number of steps to move.
 */
function movePlayer(player, steps) {
    const oldPosition = player.position;
    player.position = (player.position + steps) % window.gameState.tiles.length;

    // Check if player passed GO
    if (player.position < oldPosition) {
        player.addCash(window.gameState.config.goMoney);
        updateLog(`${player.name} ${getLocalizedText('passed_go_collected', window.gameState.config.currencySymbol + window.gameState.config.goMoney)}`);
        playSound('cash-sfx');
    }

    updatePlayerTokenPosition(player.id, player.position);
    updatePlayerInfo(player);
    updatePlayerList();

    // Land on tile actions
    setTimeout(() => {
        landOnTile(player, window.gameState.tiles[player.position]);
    }, 500); // Short delay for movement animation
}

/**
 * Handles the actions when a player lands on a specific tile.
 * @param {Player} player - The player object.
 * @param {Tile} tile - The tile object the player landed on.
 */
function landOnTile(player, tile) {
    updateLog(`${player.name} ${getLocalizedText('landed_on')} ${getLocalizedText(tile.name_en, tile.name_bn)}.`);

    switch (tile.type) {
        case 'property':
        case 'station':
        case 'utility':
            handlePropertyLanding(player, tile);
            break;
        case 'tax':
            handleTaxLanding(player, tile);
            break;
        case 'event':
            handleCardLanding(player, 'event');
            break;
        case 'local_news':
            handleCardLanding(player, 'local_news');
            break;
        case 'jail_visiting':
            updateLog(getLocalizedText('just_visiting_jail', player.name));
            document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
            break;
        case 'goto_jail':
            sendToJail(player);
            document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
            break;
        case 'free_parking':
            handleFreeParking(player);
            document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
            break;
        case 'go':
            // Already handled by movePlayer if passed GO. No additional action on landing.
            document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
            break;
        default:
            updateLog(getLocalizedText('unknown_tile_type') + tile.type);
            document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
            break;
    }
}

/**
 * Handles landing on a property, station, or utility.
 * @param {Player} player - The current player.
 * @param {Tile} tile - The tile landed on.
 */
function handlePropertyLanding(player, tile) {
    if (tile.owner === undefined) {
        // Unowned property: offer to buy
        document.getElementById('buy-modal-title').textContent = getLocalizedText('buy_property_title');
        document.getElementById('buy-modal-message').innerHTML = `${getLocalizedText('do_you_want_to_buy')} <strong>${getLocalizedText(tile.name_en, tile.name_bn)}</strong> ${getLocalizedText('for')} ${window.gameState.config.currencySymbol} ${tile.price}?`;
        showModal('buy-property-modal');
        document.getElementById('buy-property-btn').dataset.tileId = tile.id; // Store tile ID for buy action
        document.getElementById('buy-property-btn').disabled = false; // Enable buy button
    } else if (tile.owner === player.id) {
        // Owned by current player
        updateLog(getLocalizedText('you_own_this', player.name));
        document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
    } else {
        // Owned by another player: pay rent
        const owner = window.gameState.players[tile.owner];
        if (owner.isBankrupt) {
            updateLog(getLocalizedText('owner_bankrupt', owner.name));
            document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
            return;
        }

        let rentAmount = 0;
        if (tile.type === 'property') {
            // Calculate property rent
            const numHouses = tile.houses || 0;
            const hasHotel = tile.hasHotel || false;
            if (hasHotel) {
                rentAmount = tile.rent[5];
            } else {
                rentAmount = tile.rent[numHouses];
            }

            // If owner has all properties in group and no houses, double base rent
            if (numHouses === 0 && !hasHotel) {
                const groupTiles = window.gameState.tiles.filter(t => t.group === tile.group && t.type === 'property');
                const ownerHasAllGroup = groupTiles.every(t => t.owner === owner.id);
                if (ownerHasAllGroup) {
                    rentAmount *= 2;
                    updateLog(getLocalizedText('double_rent_full_set'));
                }
            }
        } else if (tile.type === 'station') {
            // Calculate station rent
            const ownerStations = window.gameState.tiles.filter(t => t.type === 'station' && t.owner === owner.id).length;
            // Base rent for 1 station, doubles for each additional station
            rentAmount = tile.baseRent * Math.pow(2, ownerStations - 1);
        } else if (tile.type === 'utility') {
            // Calculate utility rent (multiples of dice roll)
            const ownerUtilities = window.gameState.tiles.filter(t => t.type === 'utility' && t.owner === owner.id).length;
            const diceSum = window.gameState.dice[0] + window.gameState.dice[1];
            if (ownerUtilities === 1) {
                rentAmount = diceSum * 40; // 40x dice roll for 1 utility
            } else if (ownerUtilities === 2) {
                rentAmount = diceSum * 100; // 100x dice roll for 2 utilities
            }
        }

        if (tile.isMortgaged) {
            updateLog(`${getLocalizedText(tile.name_en, tile.name_bn)} ${getLocalizedText('is_mortgaged_no_rent')}`);
            document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
            return;
        }

        player.deductCash(rentAmount);
        owner.addCash(rentAmount);
        updateLog(`${player.name} ${getLocalizedText('paid_rent_to')} ${owner.name}: ${window.gameState.config.currencySymbol} ${rentAmount}`);
        playSound('cash-sfx');
        updateUI();

        // Check for bankruptcy after paying rent
        if (player.cash < 0) {
            handleBankruptcy(player, owner);
        }
        document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
    }
}

/**
 * Handles landing on a tax tile.
 * @param {Player} player - The current player.
 * @param {Tile} tile - The tax tile landed on.
 */
function handleTaxLanding(player, tile) {
    const taxAmount = tile.amount;
    player.deductCash(taxAmount);
    updateLog(`${player.name} ${getLocalizedText('paid_tax')} ${getLocalizedText(tile.name_en, tile.name_bn)}: ${window.gameState.config.currencySymbol} ${taxAmount}`);
    playSound('cash-sfx');
    updateUI();

    if (window.gameState.config.freeParkingJackpot) {
        window.gameState.freeParkingPot += taxAmount;
        updateLog(getLocalizedText('free_parking_pot_increased', window.gameState.config.currencySymbol + taxAmount));
    }

    // Check for bankruptcy after paying tax
    if (player.cash < 0) {
        handleBankruptcy(player, null); // No creditor for tax
    }
    document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
}

/**
 * Handles landing on an event or local news card tile.
 * @param {Player} player - The current player.
 * @param {'event'|'local_news'} cardType - The type of card to draw.
 */
function handleCardLanding(player, cardType) {
    const deck = cardType === 'event' ? window.gameState.eventCards : window.gameState.localNewsCards;
    const card = drawCard(deck);

    if (!card) {
        updateLog(getLocalizedText('no_cards_left', cardType));
        document.getElementById('roll-dice-btn').disabled = false;
        return;
    }

    updateLog(`${player.name} ${getLocalizedText('drew_card')}: "${getLocalizedText(card.text_en, card.text_bn)}"`);
    showMessageModal(getLocalizedText('card_drawn'), getLocalizedText(card.text_en, card.text_bn));

    // Execute card action
    setTimeout(() => { // Delay action to allow user to read card
        executeCardAction(player, card);
        document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
        saveGame();
    }, 1500);
}

/**
 * Executes the action specified by a card.
 * @param {Player} player - The player who drew the card.
 * @param {object} card - The card object.
 */
export function executeCardAction(player, card) {
    switch (card.action) {
        case 'collect_money':
            player.addCash(card.amount);
            updateLog(`${player.name} ${getLocalizedText('collected')} ${window.gameState.config.currencySymbol} ${card.amount}.`);
            playSound('cash-sfx');
            break;
        case 'pay_money':
            player.deductCash(card.amount);
            updateLog(`${player.name} ${getLocalizedText('paid')} ${window.gameState.config.currencySymbol} ${card.amount}.`);
            playSound('cash-sfx');
            if (window.gameState.config.freeParkingJackpot) {
                window.gameState.freeParkingPot += card.amount;
                updateLog(getLocalizedText('free_parking_pot_increased', window.gameState.config.currencySymbol + card.amount));
            }
            if (player.cash < 0) handleBankruptcy(player, null);
            break;
        case 'move_to':
            const oldPos = player.position;
            player.position = card.tileId;
            // Check if passed GO when moving to a specific tile
            if (card.tileId < oldPos && card.tileId !== 10) { // Don't collect GO if moving to Jail
                player.addCash(window.gameState.config.goMoney);
                updateLog(`${player.name} ${getLocalizedText('passed_go_collected', window.gameState.config.currencySymbol + window.gameState.config.goMoney)}`);
                playSound('cash-sfx');
            }
            updatePlayerTokenPosition(player.id, player.position);
            updateLog(`${player.name} ${getLocalizedText('moved_to')} ${getLocalizedText(window.gameState.tiles[player.position].name_en, window.gameState.tiles[player.position].name_bn)}.`);
            // Land on the new tile after moving
            setTimeout(() => landOnTile(player, window.gameState.tiles[player.position]), 500);
            return; // Do not re-enable roll button here, landOnTile will handle it
        case 'move_steps':
            movePlayer(player, card.steps);
            return; // Do not re-enable roll button here, movePlayer will handle it
        case 'go_to_jail':
            sendToJail(player);
            break;
        case 'get_out_of_jail_free':
            player.getOutOfJailCards++;
            updateLog(`${player.name} ${getLocalizedText('received_goojf_card')}.`);
            break;
        case 'property_repairs':
            let repairCost = 0;
            player.properties.forEach(propId => {
                const tile = window.gameState.tiles.find(t => t.id === propId);
                if (tile && tile.type === 'property') {
                    repairCost += (tile.houses || 0) * card.houseCost;
                    repairCost += (tile.hasHotel ? card.hotelCost : 0);
                }
            });
            player.deductCash(repairCost);
            updateLog(`${player.name} ${getLocalizedText('paid_repairs', window.gameState.config.currencySymbol + repairCost)}.`);
            playSound('cash-sfx');
            if (player.cash < 0) handleBankruptcy(player, null);
            break;
        case 'advance_to_nearest_station':
            const currentPos = player.position;
            let nearestStationPos = -1;
            let minDistance = Infinity;

            for (let i = 0; i < window.gameState.tiles.length; i++) {
                const tile = window.gameState.tiles[i];
                if (tile.type === 'station') {
                    let distance = (i - currentPos + window.gameState.tiles.length) % window.gameState.tiles.length;
                    if (distance > 0 && distance < minDistance) {
                        minDistance = distance;
                        nearestStationPos = i;
                    }
                }
            }
            if (nearestStationPos !== -1) {
                const steps = (nearestStationPos - currentPos + window.gameState.tiles.length) % window.gameState.tiles.length;
                movePlayer(player, steps);
                return; // movePlayer will handle re-enabling roll button
            }
            break;
        default:
            updateLog(getLocalizedText('unknown_card_action') + card.action);
            break;
    }
    updateUI();
}

/**
 * Handles the Free Parking tile.
 * @param {Player} player - The current player.
 */
function handleFreeParking(player) {
    if (window.gameState.config.freeParkingJackpot && window.gameState.freeParkingPot > 0) {
        player.addCash(window.gameState.freeParkingPot);
        updateLog(`${player.name} ${getLocalizedText('collected_free_parking', window.gameState.config.currencySymbol + window.gameState.freeParkingPot)}.`);
        playSound('cash-sfx');
        window.gameState.freeParkingPot = 0; // Reset pot
    } else {
        updateLog(getLocalizedText('free_parking_no_jackpot'));
    }
    updateUI();
}

/**
 * Sends a player to jail (Thana).
 * @param {Player} player - The player to send to jail.
 */
function sendToJail(player) {
    player.position = 10; // Jail tile index
    player.isInJail = true;
    player.jailTurns = 0;
    updatePlayerTokenPosition(player.id, player.position);
    updateLog(`${player.name} ${getLocalizedText('sent_to_jail')}.`);
    updateUI(); // Update UI to reflect jail status
    showModal('jail-modal'); // Show jail options immediately
    document.getElementById('jail-modal-message').textContent = getLocalizedText('you_are_in_jail_message');
    document.getElementById('jail-use-card-btn').classList.toggle('hidden', player.getOutOfJailCards === 0);
    document.getElementById('roll-dice-btn').disabled = true; // Disable roll dice button
    document.getElementById('end-turn-btn').disabled = true; // Disable end turn button
}

/**
 * Handles actions taken by a player in jail.
 * @param {'payFine'|'rollDoubles'|'useCard'} actionType - The action chosen by the player.
 */
export function handleJailAction(actionType) {
    const player = getCurrentPlayer();
    hideModal('jail-modal');

    switch (actionType) {
        case 'payFine':
            if (player.cash >= window.gameState.config.jailFine) {
                player.deductCash(window.gameState.config.jailFine);
                player.isInJail = false;
                player.jailTurns = 0;
                updateLog(`${player.name} ${getLocalizedText('paid_fine_out_of_jail', window.gameState.config.currencySymbol + window.gameState.config.jailFine)}.`);
                playSound('cash-sfx');
                document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
                document.getElementById('end-turn-btn').disabled = false; // Re-enable end turn button
            } else {
                showMessageModal(getLocalizedText('cannot_pay_fine'), getLocalizedText('not_enough_cash_fine'));
                showModal('jail-modal'); // Re-show jail modal if cannot pay
            }
            break;
        case 'rollDoubles':
            const die1 = Math.floor(Math.random() * 6) + 1;
            const die2 = Math.floor(Math.random() * 6) + 1;
            window.gameState.dice = [die1, die2];
            updateDiceDisplay(die1, die2);
            playSound('dice-sfx');
            updateLog(`${player.name} ${getLocalizedText('rolled')} ${die1} + ${die2} = ${die1 + die2} ${getLocalizedText('in_jail')}.`);

            if (die1 === die2) {
                player.isInJail = false;
                player.jailTurns = 0;
                updateLog(`${player.name} ${getLocalizedText('rolled_doubles_out_of_jail')}.`);
                movePlayer(player, die1 + die2); // Move player out of jail
            } else {
                player.jailTurns++;
                updateLog(`${player.name} ${getLocalizedText('failed_doubles_jail_turn', player.jailTurns)}.`);
                if (player.jailTurns === 3) {
                    // After 3 failed attempts, must pay fine or use card
                    player.deductCash(window.gameState.config.jailFine);
                    player.isInJail = false;
                    player.jailTurns = 0;
                    updateLog(`${player.name} ${getLocalizedText('paid_fine_after_turns', window.gameState.config.currencySymbol + window.gameState.config.jailFine)}.`);
                    playSound('cash-sfx');
                    // Move player after paying fine if they didn't roll doubles on 3rd attempt
                    movePlayer(player, die1 + die2);
                } else {
                    // Still in jail, end turn
                    endTurn();
                }
            }
            break;
        case 'useCard':
            if (player.getOutOfJailCards > 0) {
                player.getOutOfJailCards--;
                player.isInJail = false;
                player.jailTurns = 0;
                updateLog(`${player.name} ${getLocalizedText('used_goojf_card')}.`);
                document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
                document.getElementById('end-turn-btn').disabled = false; // Re-enable end turn button
            } else {
                showMessageModal(getLocalizedText('no_card'), getLocalizedText('no_goojf_card'));
                showModal('jail-modal'); // Re-show jail modal if no card
            }
            break;
    }
    updateUI();
    saveGame();
}

/**
 * Ends the current player's turn and advances to the next player.
 */
export function endTurn() {
    if (!window.gameState.isGameRunning) return;

    const currentPlayer = getCurrentPlayer();
    if (currentPlayer.doublesRolled > 0 && !currentPlayer.isInJail) {
        updateLog(getLocalizedText('player_gets_extra_turn', currentPlayer.name));
        currentPlayer.doublesRolled = 0; // Reset for next roll
        document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll for extra turn
        document.getElementById('end-turn-btn').disabled = true;
        return;
    }

    // Find the next active player
    let nextPlayerIndex = (window.gameState.currentPlayerIndex + 1) % window.gameState.players.length;
    let attempts = 0;
    while (window.gameState.players[nextPlayerIndex].isBankrupt && attempts < window.gameState.players.length) {
        nextPlayerIndex = (nextPlayerIndex + 1) % window.gameState.players.length;
        attempts++;
    }

    // If all players are bankrupt except one, end game
    const activePlayers = window.gameState.players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1) {
        showGameOver(activePlayers[0]);
        return;
    }

    window.gameState.currentPlayerIndex = nextPlayerIndex;
    updateLog(`${getLocalizedText('turn_ended_for')} ${currentPlayer.name}. ${getLocalizedText('next_turn_for')} ${getCurrentPlayer().name}.`);
    updateUI();
    highlightCurrentPlayerToken(getCurrentPlayer().id);
    document.getElementById('roll-dice-btn').disabled = false; // Enable roll for next player
    document.getElementById('end-turn-btn').disabled = true; // Disable end turn until action is complete
    saveGame(); // Auto-save after each turn
}

/**
 * Handles buying a property.
 * @param {boolean} confirmed - True if the player confirmed the purchase, false if declined (auction).
 */
export function buyProperty(confirmed) {
    hideModal('buy-property-modal');
    const player = getCurrentPlayer();
    const tileId = parseInt(document.getElementById('buy-property-btn').dataset.tileId);
    const tile = window.gameState.tiles.find(t => t.id === tileId);

    if (!tile) {
        console.error("Tile not found for purchase.");
        document.getElementById('roll-dice-btn').disabled = false;
        return;
    }

    if (confirmed) {
        if (player.cash >= tile.price) {
            player.deductCash(tile.price);
            player.properties.push(tile.id);
            tile.owner = player.id;
            tile.houses = 0;
            tile.hasHotel = false;
            tile.isMortgaged = false;
            updateLog(`${player.name} ${getLocalizedText('bought')} ${getLocalizedText(tile.name_en, tile.name_bn)} for ${window.gameState.config.currencySymbol} ${tile.price}.`);
            playSound('cash-sfx');
            updateUI();
        } else {
            showMessageModal(getLocalizedText('cannot_buy'), getLocalizedText('not_enough_cash_buy'));
            updateLog(`${player.name} ${getLocalizedText('cannot_afford')} ${getLocalizedText(tile.name_en, tile.name_bn)}.`);
            // If cannot afford, it still goes to auction
            startAuction(tile);
        }
    } else {
        updateLog(`${player.name} ${getLocalizedText('declined_to_buy')} ${getLocalizedText(tile.name_en, tile.name_bn)}. ${getLocalizedText('starting_auction')}.`);
        startAuction(tile);
    }
    document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button
}

/**
 * Starts an auction for a property. (Simplified for initial implementation)
 * TODO: Implement a proper auction system with bidding.
 * For now, if declined, it just remains unowned. A more complex auction would require a UI.
 * @param {Tile} tile - The tile to be auctioned.
 */
function startAuction(tile) {
    updateLog(`${getLocalizedText('auction_started_for')} ${getLocalizedText(tile.name_en, tile.name_bn)}.`);
    // In a real game, this would involve a bidding process.
    // For now, if declined, it simply remains unowned.
    showMessageModal(getLocalizedText('auction'), getLocalizedText('auction_simplified_message', getLocalizedText(tile.name_en, tile.name_bn)));
    document.getElementById('roll-dice-btn').disabled = false; // Re-enable roll button after auction message
}

/**
 * Manages player properties (build houses/hotels, mortgage/unmortgage).
 */
export function manageProperties() {
    const player = getCurrentPlayer();
    const playerProperties = window.gameState.tiles.filter(tile => player.properties.includes(tile.id));

    updateManagePropertiesModal(playerProperties, player);
    showModal('manage-properties-modal');
}

/**
 * Handles building houses/hotels on a property.
 * @param {number} tileId - The ID of the property tile.
 */
export function buildHouse(tileId) {
    const player = getCurrentPlayer();
    const tile = window.gameState.tiles.find(t => t.id === tileId);

    if (!tile || tile.type !== 'property' || tile.owner !== player.id) {
        console.error("Invalid tile or not owned by current player.");
        return;
    }

    // Check if player owns all properties in the group
    const groupTiles = window.gameState.tiles.filter(t => t.group === tile.group && t.type === 'property');
    const ownerHasAllGroup = groupTiles.every(t => t.owner === player.id);

    if (!ownerHasAllGroup) {
        showMessageModal(getLocalizedText('cannot_build'), getLocalizedText('must_own_full_set'));
        return;
    }

    // Check if houses are evenly distributed
    const canBuildEvenly = groupTiles.every(t =>
        (t.houses || 0) <= (tile.houses || 0) || t.hasHotel // Can't build if other properties in group have fewer houses
    );

    if (!canBuildEvenly) {
        showMessageModal(getLocalizedText('cannot_build'), getLocalizedText('must_build_evenly'));
        return;
    }

    let cost = 0;
    if (tile.hasHotel) {
        showMessageModal(getLocalizedText('cannot_build'), getLocalizedText('already_has_hotel'));
        return;
    } else if ((tile.houses || 0) < 4) {
        cost = window.gameState.config.houseCost;
        if (player.cash >= cost) {
            player.deductCash(cost);
            tile.houses = (tile.houses || 0) + 1;
            updateLog(`${player.name} ${getLocalizedText('built_house_on')} ${getLocalizedText(tile.name_en, tile.name_bn)} for ${window.gameState.config.currencySymbol} ${cost}.`);
            playSound('cash-sfx');
        } else {
            showMessageModal(getLocalizedText('cannot_build'), getLocalizedText('not_enough_cash_house'));
        }
    } else if ((tile.houses || 0) === 4) {
        cost = window.gameState.config.hotelCost;
        if (player.cash >= cost) {
            player.deductCash(cost);
            tile.houses = 0; // Remove 4 houses
            tile.hasHotel = true;
            updateLog(`${player.name} ${getLocalizedText('built_hotel_on')} ${getLocalizedText(tile.name_en, tile.name_bn)} for ${window.gameState.config.currencySymbol} ${cost}.`);
            playSound('cash-sfx');
        } else {
            showMessageModal(getLocalizedText('cannot_build'), getLocalizedText('not_enough_cash_hotel'));
        }
    }
    updateUI();
    renderPropertyImprovements(tile.id, tile.houses, tile.hasHotel);
    updateManagePropertiesModal(player.properties.map(id => window.gameState.tiles.find(t => t.id === id)), player); // Re-render modal
    saveGame();
}

/**
 * Handles selling houses/hotels on a property.
 * @param {number} tileId - The ID of the property tile.
 */
export function sellHouse(tileId) {
    const player = getCurrentPlayer();
    const tile = window.gameState.tiles.find(t => t.id === tileId);

    if (!tile || tile.type !== 'property' || tile.owner !== player.id) {
        console.error("Invalid tile or not owned by current player.");
        return;
    }

    // Check if houses are evenly distributed (cannot sell if it makes distribution uneven)
    const groupTiles = window.gameState.tiles.filter(t => t.group === tile.group && t.type === 'property');
    const canSellEvenly = groupTiles.every(t =>
        (t.houses || 0) >= (tile.houses || 0) || t.hasHotel // Can't sell if other properties in group have more houses
    );

    if (!canSellEvenly) {
        showMessageModal(getLocalizedText('cannot_sell'), getLocalizedText('must_sell_evenly'));
        return;
    }

    let refund = 0;
    if (tile.hasHotel) {
        refund = window.gameState.config.hotelCost / 2; // Sell hotel for half price
        player.addCash(refund);
        tile.hasHotel = false;
        tile.houses = 4; // Replace with 4 houses
        updateLog(`${player.name} ${getLocalizedText('sold_hotel_on')} ${getLocalizedText(tile.name_en, tile.name_bn)} for ${window.gameState.config.currencySymbol} ${refund}.`);
        playSound('cash-sfx');
    } else if ((tile.houses || 0) > 0) {
        refund = window.gameState.config.houseCost / 2; // Sell house for half price
        player.addCash(refund);
        tile.houses = (tile.houses || 0) - 1;
        updateLog(`${player.name} ${getLocalizedText('sold_house_on')} ${getLocalizedText(tile.name_en, tile.name_bn)} for ${window.gameState.config.currencySymbol} ${refund}.`);
        playSound('cash-sfx');
    } else {
        showMessageModal(getLocalizedText('cannot_sell'), getLocalizedText('no_improvements_to_sell'));
        return;
    }
    updateUI();
    renderPropertyImprovements(tile.id, tile.houses, tile.hasHotel);
    updateManagePropertiesModal(player.properties.map(id => window.gameState.tiles.find(t => t.id === id)), player); // Re-render modal
    saveGame();
}

/**
 * Handles mortgaging a property.
 * @param {number} tileId - The ID of the property tile.
 */
export function mortgageProperty(tileId) {
    const player = getCurrentPlayer();
    const tile = window.gameState.tiles.find(t => t.id === tileId);

    if (!tile || tile.owner !== player.id || tile.isMortgaged) {
        console.error("Invalid tile or not owned by current player or already mortgaged.");
        return;
    }

    // Cannot mortgage if there are houses/hotels on any property in the group
    const groupTiles = window.gameState.tiles.filter(t => t.group === tile.group && t.type === 'property');
    const hasImprovementsInGroup = groupTiles.some(t => (t.houses || 0) > 0 || t.hasHotel);

    if (hasImprovementsInGroup) {
        showMessageModal(getLocalizedText('cannot_mortgage'), getLocalizedText('must_sell_all_improvements_first'));
        return;
    }

    const mortgageValue = tile.price * window.gameState.config.mortgageRate;
    player.addCash(mortgageValue);
    tile.isMortgaged = true;
    updateLog(`${player.name} ${getLocalizedText('mortgaged')} ${getLocalizedText(tile.name_en, tile.name_bn)} for ${window.gameState.config.currencySymbol} ${mortgageValue}.`);
    playSound('cash-sfx');
    updateUI();
    updateManagePropertiesModal(player.properties.map(id => window.gameState.tiles.find(t => t.id === id)), player); // Re-render modal
    saveGame();
}

/**
 * Handles unmortgaging a property.
 * @param {number} tileId - The ID of the property tile.
 */
export function unmortgageProperty(tileId) {
    const player = getCurrentPlayer();
    const tile = window.gameState.tiles.find(t => t.id === tileId);

    if (!tile || tile.owner !== player.id || !tile.isMortgaged) {
        console.error("Invalid tile or not owned by current player or not mortgaged.");
        return;
    }

    const unmortgageCost = tile.price * window.gameState.config.mortgageRate * 1.1; // 10% interest
    if (player.cash >= unmortgageCost) {
        player.deductCash(unmortgageCost);
        tile.isMortgaged = false;
        updateLog(`${player.name} ${getLocalizedText('unmortgaged')} ${getLocalizedText(tile.name_en, tile.name_bn)} for ${window.gameState.config.currencySymbol} ${unmortgageCost}.`);
        playSound('cash-sfx');
    } else {
        showMessageModal(getLocalizedText('cannot_unmortgage'), getLocalizedText('not_enough_cash_unmortgage'));
    }
    updateUI();
    updateManagePropertiesModal(player.properties.map(id => window.gameState.tiles.find(t => t.id === id)), player); // Re-render modal
    saveGame();
}

/**
 * Handles player bankruptcy.
 * @param {Player} bankruptPlayer - The player who is bankrupt.
 * @param {Player|null} creditor - The player who caused the bankruptcy (or null if bank/tax).
 */
export function bankruptPlayer(bankruptPlayer, creditor) { // Changed to export function
    updateLog(`${bankruptPlayer.name} ${getLocalizedText('is_bankrupt')}.`);
    bankruptPlayer.isBankrupt = true;

    // Transfer assets
    bankruptPlayer.properties.forEach(propId => {
        const tile = window.gameState.tiles.find(t => t.id === propId);
        if (tile) {
            // Sell houses/hotels at half price
            if (tile.hasHotel) {
                bankruptPlayer.addCash(window.gameState.config.hotelCost / 2);
                tile.hasHotel = false;
                tile.houses = 0; // Hotels are removed, not converted to houses in bankruptcy
            }
            if (tile.houses > 0) {
                bankruptPlayer.addCash(tile.houses * (window.gameState.config.houseCost / 2));
                tile.houses = 0;
            }
            renderPropertyImprovements(tile.id, tile.houses, tile.hasHotel);

            if (creditor) {
                // Transfer property to creditor
                tile.owner = creditor.id;
                creditor.properties.push(tile.id);
                tile.isMortgaged = false; // Unmortgage if transferred
                updateLog(`${getLocalizedText(tile.name_en, tile.name_bn)} ${getLocalizedText('transferred_to')} ${creditor.name}.`);
            } else {
                // Return property to bank (unowned)
                delete tile.owner;
                tile.isMortgaged = false;
                updateLog(`${getLocalizedText(tile.name_en, tile.name_bn)} ${getLocalizedText('returned_to_bank')}.`);
            }
        }
    });
    bankruptPlayer.properties = []; // Clear properties from bankrupt player

    // Transfer remaining cash
    if (creditor) {
        creditor.addCash(bankruptPlayer.cash);
        updateLog(`${bankruptPlayer.name}'s ${window.gameState.config.currencySymbol} ${bankruptPlayer.cash} ${getLocalizedText('transferred_to')} ${creditor.name}.`);
    } else {
        // Cash goes to bank (disappears)
        updateLog(`${bankruptPlayer.name}'s ${window.gameState.config.currencySymbol} ${bankruptPlayer.cash} ${getLocalizedText('lost_to_bank')}.`);
    }
    bankruptPlayer.cash = 0;
    bankruptPlayer.getOutOfJailCards = 0;
    bankruptPlayer.isInJail = false;

    updateUI();
    renderPlayerTokens(); // Re-render tokens to remove bankrupt player's token

    // Check game over condition
    const activePlayers = window.gameState.players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1) {
        showGameOver(activePlayers[0]);
    } else {
        // If current player went bankrupt, ensure turn ends and next player is selected
        if (getCurrentPlayer().id === bankruptPlayer.id) {
            endTurn();
        }
    }
    saveGame();
}

/**
 * Saves the current game state to localStorage.
 */
export function saveGame() {
    saveGameState(window.gameState);
    updateLog(getLocalizedText('game_saved'));
    showMessageModal(getLocalizedText('game_saved'), getLocalizedText('game_saved_successfully'));
}

/**
 * Loads game state from localStorage.
 */
export function loadGame() {
    const loadedState = loadGameState();
    if (loadedState) {
        // Reconstruct Player objects from loaded data
        loadedState.players = loadedState.players.map(pData => {
            const player = new Player(pData.id, pData.name);
            Object.assign(player, pData); // Copy all properties
            return player;
        });

        // Ensure tiles are correctly referenced and properties are restored
        loadedState.tiles.forEach(loadedTile => {
            const originalTile = window.gameState.tiles.find(t => t.id === loadedTile.id);
            if (originalTile) {
                Object.assign(originalTile, loadedTile); // Update original tile with loaded state
            }
        });

        Object.assign(window.gameState, loadedState);

        // Restore UI based on loaded state
        renderBoard(); // Re-render board to show owners, houses etc.
        renderPlayerTokens(); // Re-render tokens to correct positions
        updateUI();
        highlightCurrentPlayerToken(getCurrentPlayer().id);
        updateLog(getLocalizedText('game_loaded'));
        showMessageModal(getLocalizedText('game_loaded'), getLocalizedText('game_loaded_successfully'));
        window.gameState.isGameRunning = true;
        document.getElementById('roll-dice-btn').disabled = false;
        document.getElementById('end-turn-btn').disabled = true; // Start of turn, disable end turn
    } else {
        updateLog(getLocalizedText('no_saved_game'));
        showMessageModal(getLocalizedText('no_saved_game'), getLocalizedText('no_saved_game_found'));
    }
}

/**
 * Resets the game to its initial state.
 */
export function resetGame() {
    if (confirm(getLocalizedText('confirm_reset_game'))) {
        clearGameState();
        initGame();
        renderBoard(); // Re-render board to clear ownership
        startGame(); // Prompt to start a new game
        updateLog(getLocalizedText('game_reset'));
    }
}

/**
 * Shows the game over modal.
 * @param {Player} winner - The winning player.
 */
export function showGameOver(winner) {
    document.getElementById('game-over-title').textContent = getLocalizedText('game_over');
    if (winner) {
        document.getElementById('game-over-message').textContent = getLocalizedText('winner_message', winner.name);
    } else {
        document.getElementById('game-over-message').textContent = getLocalizedText('no_winner_message');
    }
    showModal('game-over-modal');
    window.gameState.isGameRunning = false;
    document.getElementById('roll-dice-btn').disabled = true;
    document.getElementById('end-turn-btn').disabled = true;
}
