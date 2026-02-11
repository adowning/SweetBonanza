import { GameSettings } from './GameSettings';

export class SlotArea {
    static getSlotArea(gameSettings: any, reelset: number, log: any) {
        // Parse reelset from settings
        const reelSetString = gameSettings['reel_set' + reelset];
        const reelSetArray = reelSetString.split('~').map((reel: string) => reel.split(','));

        const positions: number[] = [];
        // Get random positions for reels
        for (let i = 0; i < reelSetArray.length; i++) {
            positions[i] = Math.floor(Math.random() * reelSetArray[i].length);
        }

        // Fill the game field with symbols
        let reels: any[][] = [];
        let symbolsAfter: any[] = [];
        let symbolsBelow: any[] = [];

        const sh = parseInt(gameSettings['sh'], 10);

        for (let key = 0; key < positions.length; key++) {
            const value = positions[key];
            const reel = reelSetArray[key];
            // Cycle the reel to ensure we have enough symbols
            const reelsetCycled = [...reel, ...reel.slice(0, 10)];

            // Fill the reel
            reels[key] = reelsetCycled.slice(value, value + sh);

            // Symbols after (above/before in array terms but logic says 'after'?)
            // PHP: array_slice($reelsetCycled, $value - 1, 1)
            // If value is 0, value-1 is -1. PHP array_slice with negative offset takes from end.
            // But here we are simulating a circular reel.
            let symbolAfterIndex = value - 1;
            if (symbolAfterIndex < 0) symbolAfterIndex = reel.length - 1; // Wrap around to end of original reel
             // Actually PHP slice with negative start and length 1 gives last element.
             // But let's stick to the logic: we need the symbol immediately preceding the window.
             // If we used the cycled array, value is the start index.
             // If value is 0, we want index -1.

            // Let's rely on JS slice handling if possible, but JS slice with negative index is relative to end.
            // If value - 1 < 0, we want the element at length + (value - 1).
            // Example: reel length 10. value 0. want index 9.
            // reelsetCycled has length 20.
            // If we just use reelsetCycled, we can access index [value - 1] if we handle the negative.

            if (value - 1 >= 0) {
                symbolsAfter[key] = reelsetCycled[value - 1];
            } else {
                 // getting from original reel end
                 symbolsAfter[key] = reel[reel.length - 1];
            }

            symbolsBelow[key] = reels[key][reels[key].length - 1];
        }

        if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
            // Respin logic: work with previous slotArea
            const currentSymbolsAfter = [...symbolsAfter];

            // Add symbol from SymbolsAfter to the top of each reel
            for (let key = 0; key < reels.length; key++) {
                reels[key].push(currentSymbolsAfter[key]);
            }

            // Reconstruct current grid from log.SlotArea (flat array)
            // log['SlotArea'] is flat, need to chunk it into rows then transpose to cols?
            // PHP: $tmpSlotArea = array_chunk($log['SlotArea'], count($reels)); // chunk by row length (number of reels)
            // Then transpose to cols.

            const logSlotArea = log['SlotArea'];
            const numReels = reels.length;

            // Chunk into rows
            const tmpSlotArea: any[][] = [];
            for (let i = 0; i < logSlotArea.length; i += numReels) {
                tmpSlotArea.push(logSlotArea.slice(i, i + numReels));
            }

            const currentSlotArea: any[][] = [];
            for (let k = 0; k < numReels; k++) {
                currentSlotArea[k] = [];
                for (let i = 0; i < sh; i++) {
                     if (tmpSlotArea[i] && tmpSlotArea[i][k] !== undefined) {
                        currentSlotArea[k].push(tmpSlotArea[i][k]);
                     }
                }
            }

            // Get winning symbols
            const winSymbols: any[] = [];
            if (log['WinLines']) {
                for (const winLine of log['WinLines']) {
                    winSymbols.push(winLine['WinSymbol']);
                }
            }

            // Remove winning symbols
            const sortSlotArea: any[][] = [];
            for (let sortReelKey = 0; sortReelKey < currentSlotArea.length; sortReelKey++) {
                const sortReel = currentSlotArea[sortReelKey];
                sortSlotArea[sortReelKey] = [];
                for (const value of sortReel) {
                    // Check if value is in winSymbols. Note: types might be string/number mixed.
                    // PHP in_array is loose by default.
                    if (!winSymbols.includes(value) && !winSymbols.includes(parseInt(value, 10)) && !winSymbols.includes(String(value))) {
                        sortSlotArea[sortReelKey].push(value);
                    }
                }
            }

            // Fill empty spaces
            for (let reelKey = 0; reelKey < sortSlotArea.length; reelKey++) {
                const currentReel = sortSlotArea[reelKey];
                const reelCount = currentReel.length;
                if (reelCount < sh) {
                    // Need to add (sh - reelCount) symbols to the BEGINNING (top)
                    // Take from reels[reelKey] (which contains new random symbols + symbolAfter)
                    // PHP: array_merge( array_slice($reels[$reelKey], ($reelCount - $gameSettings['sh'])), $currentReel);
                    // $reels[$reelKey] has size sh+1 (sh from initial random + 1 from symbolAfter).
                    // Wait, PHP logic: $reels was generated randomly above.
                    // array_slice(reels, (reelCount - sh)) -> negative index.
                    // If reelCount is 0 (all cleared), need sh symbols. slice(-5).
                    // If reelCount is 4 (1 cleared), need 1 symbol. slice(4-5) = slice(-1).
                    // So we take from the END of the generated random strip?
                    // Yes, likely simulating falling down.

                    const needed = sh - reelCount;
                    const symbolsToAdd = reels[reelKey].slice(-needed);
                    sortSlotArea[reelKey] = [...symbolsToAdd, ...currentReel];
                }
            }

            symbolsBelow = [];
            for (const item of sortSlotArea) {
                symbolsBelow.push(item[item.length - 1]);
            }

            // SymbolsAfter logic in PHP for respin:
            // $symbolsAfter = []; foreach ($reels as $reelAndSymbolsAfter) { $symbolsAfter[] = $reelAndSymbolsAfter[array_key_first($reelAndSymbolsAfter)]; }
            // $reels here refers to the OLD $reels (the random one generated at start of function).
            // array_key_first is index 0.
            symbolsAfter = [];
            for (const reel of reels) {
                 symbolsAfter.push(reel[0]);
            }

            reels = sortSlotArea;
        }

        // Flatten to SlotArea (row by row)
        const slotArea: any[] = [];
        for (let i = 0; i < sh; i++) {
            for (let k = 0; k < reels.length; k++) {
                slotArea.push(reels[k][i]);
            }
        }

        return {
            SlotArea: slotArea,
            SymbolsAfter: symbolsAfter,
            SymbolsBelow: symbolsBelow
        };
    }
}
