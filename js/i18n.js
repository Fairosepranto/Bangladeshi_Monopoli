/**
 * @typedef {object} LocalizationStrings
 * @property {string} en - English string.
 * @property {string} [bn] - Bengali string.
 */


/**
 * @type {string}
 */
let currentLanguage = 'en';


/**
 * @type {Object.<string, LocalizationStrings>}
 */
const translations = {
    // General UI
    'game_initialized': { en: 'Game initialized. Click "Start Game" to begin.', bn: 'গেম শুরু হয়েছে। শুরু করতে "গেম শুরু করুন" এ ক্লিক করুন।' },
    'enter_num_players_prompt': { en: 'Enter number of players (2-6):', bn: 'খেলোয়াড়ের সংখ্যা লিখুন (২-৬):' },
    'invalid_input': { en: 'Invalid Input', bn: 'অবৈধ ইনপুট' },
    'invalid_players_count': { en: 'Please enter a number between 2 and 6.', bn: 'অনুগ্রহ করে ২ থেকে ৬ এর মধ্যে একটি সংখ্যা লিখুন।' },
    'player': { en: 'Player', bn: 'খেলোয়াড়' },
    'enter_player_name_prompt': { en: 'Enter name for Player ', bn: 'খেলোয়াড় এর নাম লিখুন ' },
    'game_started_with': { en: 'Game started with ', bn: 'গেম শুরু হয়েছে ' },
    'players': { en: 'players', bn: 'খেলোয়াড়' },
    'rolled': { en: 'rolled', bn: 'চাল দিয়েছে' },
    'doubles_rolled': { en: 'Doubles rolled! Get an extra turn!', bn: 'ডাবল পড়েছে! অতিরিক্ত পালা পাবেন!' },
    'three_doubles_jail': { en: 'Three consecutive doubles! %s goes to Thana!', bn: 'টানা তিনবার ডাবল! %s থানায় যাচ্ছে!' },
    'landed_on': { en: 'landed on', bn: 'এ পৌঁছেছে' },
    'you_own_this': { en: 'You own this property.', bn: 'এই সম্পত্তি আপনার।' },
    'owner_bankrupt': { en: '%s is bankrupt, no rent collected.', bn: '%s দেউলিয়া, ভাড়া সংগ্রহ করা হয়নি।' },
    'paid_rent_to': { en: 'paid rent to', bn: 'কে ভাড়া দিয়েছে' },
    'paid_tax': { en: 'paid tax on', bn: 'এর উপর কর দিয়েছে' },
    'free_parking_pot_increased': { en: 'Free Parking pot increased by %s.', bn: 'ফ্রি পার্কিং তহবিল %s দ্বারা বৃদ্ধি পেয়েছে।' },
    'just_visiting_jail': { en: '%s is just visiting Thana.', bn: '%s শুধু থানা পরিদর্শনে আছে।' },
    'sent_to_jail': { en: 'was sent to Thana!', bn: 'কে থানায় পাঠানো হয়েছে!' },
    'unknown_tile_type': { en: 'Unknown tile type: ', bn: 'অজানা টাইল প্রকার: ' },
    'free_parking_no_jackpot': { en: 'Free Parking. Nothing to collect.', bn: 'ফ্রি পার্কিং। সংগ্রহ করার কিছু নেই।' },
    'collected_free_parking': { en: 'collected %s from Free Parking!', bn: '%s ফ্রি পার্কিং থেকে সংগ্রহ করেছে!' },
    'no_cards_left': { en: 'No %s cards left in the deck.', bn: '%s কার্ড ডেকের মধ্যে অবশিষ্ট নেই।' },
    'drew_card': { en: 'drew a card', bn: 'একটি কার্ড তুলেছে' },
    'card_drawn': { en: 'Card Drawn', bn: 'কার্ড তোলা হয়েছে' },
    'collected': { en: 'collected', bn: 'সংগ্রহ করেছে' },
    'paid': { en: 'paid', bn: 'পরিশোধ করেছে' },
    'moved_to': { en: 'moved to', bn: 'এ চলে গেছে' },
    'received_goojf_card': { en: 'received a Get Out of Thana Free card!', bn: 'একটি "থানা থেকে বিনামূল্যে বের হন" কার্ড পেয়েছে!' },
    'paid_repairs': { en: 'paid %s for property repairs.', bn: 'সম্পত্তির মেরামতের জন্য %s পরিশোধ করেছে।' },
    'unknown_card_action': { en: 'Unknown card action: ', bn: 'অজানা কার্ড অ্যাকশন: ' },
    'player_gets_extra_turn': { en: '%s rolled doubles and gets an extra turn!', bn: '%s ডাবল চাল দিয়েছে এবং একটি অতিরিক্ত পালা পাচ্ছে!' },
    'turn_ended_for': { en: 'Turn ended for', bn: 'এর পালা শেষ হয়েছে' },
    'next_turn_for': { en: 'Next turn for', bn: 'পরবর্তী পালা এর জন্য' },
    'game_saved': { en: 'Game Saved', bn: 'গেম সংরক্ষিত হয়েছে' },
    'game_saved_successfully': { en: 'Game state saved successfully!', bn: 'গেমের অবস্থা সফলভাবে সংরক্ষিত হয়েছে!' },
    'save_failed': { en: 'Failed to save game state.', bn: 'গেমের অবস্থা সংরক্ষণ করতে ব্যর্থ হয়েছে।' },
    'game_loaded': { en: 'Game Loaded', bn: 'গেম লোড হয়েছে' },
    'game_loaded_successfully': { en: 'Game state loaded successfully!', bn: 'গেমের অবস্থা সফলভাবে লোড হয়েছে!' },
    'load_failed': { en: 'Failed to load game state.', bn: 'গেমের অবস্থা লোড করতে ব্যর্থ হয়েছে।' },
    'no_saved_game': { en: 'No Saved Game', bn: 'কোন সংরক্ষিত গেম নেই' },
    'no_saved_game_found': { en: 'No saved game found in your browser.', bn: 'আপনার ব্রাউজারে কোন সংরক্ষিত গেম পাওয়া যায়নি।' },
    'confirm_reset_game': { en: 'Are you sure you want to reset the game? All progress will be lost.', bn: 'আপনি কি নিশ্চিত যে আপনি গেমটি রিসেট করতে চান? সমস্ত অগ্রগতি হারিয়ে যাবে।' },
    'game_reset': { en: 'Game reset. Starting new game.', bn: 'গেম রিসেট হয়েছে। নতুন গেম শুরু হচ্ছে।' },
    'game_over': { en: 'Game Over!', bn: 'গেম শেষ!' },
    'winner_message': { en: 'Congratulations, %s! You are the last solvent player!', bn: 'অভিনন্দন, %s! আপনিই শেষ সলভেন্ট খেলোয়াড়!' },
    'no_winner_message': { en: 'No winner. All players are bankrupt.', bn: 'কোন বিজয়ী নেই। সকল খেলোয়াড় দেউলিয়া।' },
    'is_bankrupt': { en: 'is bankrupt!', bn: 'দেউলিয়া হয়ে গেছে!' },
    'transferred_to': { en: 'transferred to', bn: 'কে স্থানান্তরিত হয়েছে' },
    'returned_to_bank': { en: 'returned to the bank.', bn: 'ব্যাংকে ফেরত গেছে।' },
    'lost_to_bank': { en: 'cash lost to the bank.', bn: 'নগদ টাকা ব্যাংকের কাছে হারিয়েছে।' },
    'forced_bankrupt': { en: 'was forced into bankruptcy', bn: 'কে দেউলিয়া করা হয়েছে' },


    // Modals
    'buy_property_title': { en: 'Buy Property?', bn: 'সম্পত্তি কিনবেন?' },
    'do_you_want_to_buy': { en: 'Do you want to buy', bn: 'আপনি কি কিনতে চান' },
    'for': { en: 'for', bn: 'এর জন্য' },
    'cannot_buy': { en: 'Cannot Buy', bn: 'কিনতে পারবেন না' },
    'not_enough_cash_buy': { en: 'You do not have enough cash to buy this property.', bn: 'এই সম্পত্তি কেনার জন্য আপনার কাছে পর্যাপ্ত নগদ টাকা নেই।' },
    'cannot_afford': { en: 'cannot afford', bn: 'সামর্থ্য নেই' },
    'declined_to_buy': { en: 'declined to buy', bn: 'কিনতে অস্বীকার করেছে' },
    'starting_auction': { en: 'Starting auction...', bn: 'নিলাম শুরু হচ্ছে...' },
    'auction': { en: 'Auction', bn: 'নিলাম' },
    'auction_simplified_message': { en: 'Auction for %s is simplified for this demo. It remains unowned.', bn: '%s এর জন্য নিলাম এই ডেমোতে সরলীকৃত করা হয়েছে। এটি মালিকানাহীন থাকবে।' },
    'manage_properties': { en: 'Manage Properties', bn: 'সম্পত্তি পরিচালনা করুন' },
    'no_properties_owned': { en: 'You do not own any properties yet.', bn: 'আপনার এখনও কোন সম্পত্তি নেই।' },
    'build': { en: 'Build', bn: 'নির্মাণ করুন' },
    'sell': { en: 'Sell', bn: 'বিক্রয় করুন' },
    'mortgage': { en: 'Mortgage', bn: 'বন্ধক রাখুন' },
    'unmortgage': { en: 'Unmortgage', bn: 'বন্ধক মুক্ত করুন' },
    'mortgaged': { en: 'Mortgaged', bn: 'বন্ধক রাখা হয়েছে' },
    'cannot_build': { en: 'Cannot Build', bn: 'নির্মাণ করতে পারবেন না' },
    'must_own_full_set': { en: 'You must own all properties in this color group to build houses/hotels.', bn: 'ঘর/হোটেল তৈরি করতে আপনাকে এই রঙের গ্রুপের সমস্ত সম্পত্তি মালিকানা করতে হবে।' },
    'must_build_evenly': { en: 'You must build houses evenly across properties in a color group.', bn: 'একটি রঙের গ্রুপের সম্পত্তি জুড়ে আপনাকে সমানভাবে ঘর তৈরি করতে হবে।' },
    'already_has_hotel': { en: 'This property already has a hotel.', bn: 'এই সম্পত্তিতে ইতিমধ্যেই একটি হোটেল আছে।' },
    'built_house_on': { en: 'built a house on', bn: 'এর উপর একটি ঘর তৈরি করেছে' },
    'not_enough_cash_house': { en: 'You do not have enough cash to build a house.', bn: 'ঘর তৈরি করার জন্য আপনার কাছে পর্যাপ্ত নগদ টাকা নেই।' },
    'built_hotel_on': { en: 'built a hotel on', bn: 'এর উপর একটি হোটেল তৈরি করেছে' },
    'not_enough_cash_hotel': { en: 'You do not have enough cash to build a hotel.', bn: 'হোটেল তৈরি করার জন্য আপনার কাছে পর্যাপ্ত নগদ টাকা নেই।' },
    'cannot_sell': { en: 'Cannot Sell', bn: 'বিক্রয় করতে পারবেন না' },
    'must_sell_evenly': { en: 'You must sell houses evenly across properties in a color group.', bn: 'একটি রঙের গ্রুপের সম্পত্তি জুড়ে আপনাকে সমানভাবে ঘর বিক্রি করতে হবে।' },
    'no_improvements_to_sell': { en: 'No houses or hotels to sell on this property.', bn: 'এই সম্পত্তিতে বিক্রি করার মতো কোন ঘর বা হোটেল নেই।' },
    'sold_house_on': { en: 'sold a house on', bn: 'এর উপর একটি ঘর বিক্রি করেছে' },
    'sold_hotel_on': { en: 'sold a hotel on', bn: 'এর উপর একটি হোটেল বিক্রি করেছে' },
    'cannot_mortgage': { en: 'Cannot Mortgage', bn: 'বন্ধক রাখতে পারবেন না' },
    'must_sell_all_improvements_first': { en: 'You must sell all houses and hotels on all properties in this color group before mortgaging.', bn: 'বন্ধক রাখার আগে আপনাকে এই রঙের গ্রুপের সমস্ত সম্পত্তির উপর সমস্ত ঘর এবং হোটেল বিক্রি করতে হবে।' },
    'mortgaged': { en: 'mortgaged', bn: 'বন্ধক রেখেছে' },
    'cannot_unmortgage': { en: 'Cannot Unmortgage', bn: 'বন্ধক মুক্ত করতে পারবেন না' },
    'not_enough_cash_unmortgage': { en: 'You do not have enough cash to unmortgage this property.', bn: 'এই সম্পত্তি বন্ধক মুক্ত করার জন্য আপনার কাছে পর্যাপ্ত নগদ টাকা নেই।' },
    'unmortgaged': { en: 'unmortgaged', bn: 'বন্ধক মুক্ত করেছে' },
    'is_mortgaged_no_rent': { en: 'is mortgaged. No rent collected.', bn: 'বন্ধক রাখা হয়েছে। কোন ভাড়া সংগ্রহ করা হয়নি।' },


    // Jail Modal
    'you_are_in_jail_message': { en: 'You are in Thana. What would you like to do?', bn: 'আপনি থানায় আছেন। আপনি কি করতে চান?' },
    'cannot_pay_fine': { en: 'Cannot Pay Fine', bn: 'জরিমানা দিতে পারবেন না' },
    'not_enough_cash_fine': { en: 'You do not have enough cash to pay the fine.', bn: 'জরিমানা পরিশোধ করার জন্য আপনার কাছে পর্যাপ্ত নগদ টাকা নেই।' },
    'paid_fine_out_of_jail': { en: 'paid %s fine and is out of Thana!', bn: '%s জরিমানা দিয়েছে এবং থানা থেকে বেরিয়ে এসেছে!' },
    'in_jail': { en: 'while in Thana.', bn: 'থানায় থাকাকালীন।' },
    'rolled_doubles_out_of_jail': { en: 'rolled doubles and is out of Thana!', bn: 'ডাবল চাল দিয়েছে এবং থানা থেকে বেরিয়ে এসেছে!' },
    'failed_doubles_jail_turn': { en: 'failed to roll doubles. Turn %s in Thana.', bn: 'ডাবল চাল দিতে ব্যর্থ হয়েছে। থানায় %s পালা।' },
    'paid_fine_after_turns': { en: 'paid %s fine after 3 failed attempts to roll doubles and is out of Thana!', bn: '৩ বার ডাবল চাল দিতে ব্যর্থ হওয়ার পর %s জরিমানা দিয়েছে এবং থানা থেকে বেরিয়ে এসেছে!' },
    'no_card': { en: 'No Card', bn: 'কোন কার্ড নেই' },
    'no_goojf_card': { en: 'You do not have a Get Out of Thana Free card.', bn: 'আপনার কাছে "থানা থেকে বিনামূল্যে বের হন" কার্ড নেই।' },
    'used_goojf_card': { en: 'used a Get Out of Thana Free card and is out of Thana!', bn: 'একটি "থানা থেকে বিনামূল্যে বের হন" কার্ড ব্যবহার করেছে এবং থানা থেকে বেরিয়ে এসেছে!' },


    // Settings
    'language_changed_to': { en: 'Language changed to ', bn: 'ভাষা পরিবর্তন করা হয়েছে ' },
    'sfx_toggled': { en: 'Sound Effects Toggled: ', bn: 'সাউন্ড ইফেক্ট চালু/বন্ধ: ' },
    'free_parking_jackpot_toggled': { en: 'Free Parking Jackpot Toggled: ', bn: 'ফ্রি পার্কিং জ্যাকপট চালু/বন্ধ: ' },


    // Debug
    'enter_amount_to_give': { en: 'Enter amount to give cash:', bn: 'নগদ টাকা দেওয়ার পরিমাণ লিখুন:' },
    'received': { en: 'received', bn: 'পেয়েছে' },
    'enter_card_type_prompt': { en: 'Enter card type (event or local_news):', bn: 'কার্ডের প্রকার লিখুন (event অথবা local_news):' },
    'forced_card_draw': { en: 'forced a card draw', bn: 'একটি কার্ড জোর করে তুলেছে' },
    'no_cards_in_deck': { en: 'No cards of type %s in deck.', bn: '%s প্রকারের কোন কার্ড ডেকের মধ্যে নেই।' },
    'invalid_card_type': { en: 'Invalid card type entered.', bn: 'অবৈধ কার্ড প্রকার প্রবেশ করানো হয়েছে।' },
    'enter_tile_id_to_add_house': { en: 'Enter tile ID to add house/hotel:', bn: 'ঘর/হোটেল যোগ করার জন্য টাইলের আইডি লিখুন:' },
    'already_has_hotel_debug': { en: 'This property already has a hotel (Debug).', bn: 'এই সম্পত্তিতে ইতিমধ্যেই একটি হোটেল আছে (ডিবাগ)।' },
    'added_house_to': { en: 'added a house to', bn: 'এর উপর একটি ঘর যোগ করেছে' },
    'added_hotel_to': { en: 'added a hotel to', bn: 'এর উপর একটি হোটেল যোগ করেছে' },
    'invalid_property_for_house': { en: 'Invalid property ID or not owned by current player for building (Debug).', bn: 'নির্মাণের জন্য অবৈধ সম্পত্তি আইডি বা বর্তমান খেলোয়াড়ের মালিকানাধীন নয় (ডিবাগ)।' },
    'enter_tile_id_to_teleport': { en: 'Enter tile ID to teleport to:', bn: 'টেলিপোর্ট করার জন্য টাইলের আইডি লিখুন:' },
    'teleported_to': { en: 'teleported to', bn: 'এ টেলিপোর্ট করেছে' },
    'invalid_tile_id_teleport': { en: 'Invalid tile ID for teleport.', bn: 'টেলিপোর্টের জন্য অবৈধ টাইল আইডি।' },
    'tile_details': { en: 'Tile Details', bn: 'টাইল বিবরণ' },
    'passed_go_collected': { en: 'passed GO and collected %s.', bn: 'GO অতিক্রম করেছে এবং %s সংগ্রহ করেছে।' },
    'double_rent_full_set': { en: 'Owner has full set! Double rent charged.', bn: 'মালিকের সম্পূর্ণ সেট আছে! দ্বিগুণ ভাড়া চার্জ করা হয়েছে।' },
};


/**
 * Initializes the i18n system.
 * @param {string} lang - The initial language ('en' or 'bn').
 */
export function initI18n(lang) {
    currentLanguage = lang;
}


/**
 * Sets the current language for the game.
 * @param {string} lang - The language code ('en' or 'bn').
 */
export function setLanguage(lang) {
    if (translations[Object.keys(translations)[0]][lang]) { // Check if the language exists in translations
        currentLanguage = lang;
    } else {
        console.warn(`Language '${lang}' not supported. Defaulting to 'en'.`);
        currentLanguage = 'en';
    }
}


/**
 * Gets the localized text for a given key.
 * If Bengali translation is available, it uses that. Otherwise, falls back to English.
 * Supports simple string formatting with %s.
 * @param {string} key - The key for the translation string.
 * @param {string} [altBnText] - Optional Bengali text override for specific instances (e.g., tile names).
 * @param {...any} args - Arguments to substitute into the string.
 * @returns {string} The localized string.
 */
export function getLocalizedText(key, altBnText = null, ...args) {
    let textObj = translations[key];
    if (!textObj) {
        // If key is not found in translations, assume it's an English string literal
        // and try to use it directly, or fallback to a generic message.
        textObj = { en: key, bn: altBnText || key };
        // console.warn(`Translation key "${key}" not found. Using key as English text.`);
    }


    let text = currentLanguage === 'bn' && textObj.bn ? (altBnText || textObj.bn) : textObj.en;


    // Simple string substitution for %s
    args.forEach(arg => {
        text = text.replace('%s', arg);
    });


    return text;
}