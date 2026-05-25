import { rand } from '../utils';

export class SlotArea {
    public static getSlotArea(gameSettings: Record<string, string>, reelsetIndex: number, log: any) {
        let reelsetString = gameSettings['reel_set' + reelsetIndex];
        if (!reelsetString) throw new Error("Reelset not found");

        let reelsetArr = reelsetString.split('~').map(reel => reel.split(','));

        let positions: Record<number, number> = {};
        for (let key = 0; key < reelsetArr.length; key++) {
            positions[key] = rand(0, reelsetArr[key].length);
        }

        let reels: string[][] = [];
        let symbolsAfter: string[] = [];
        let symbolsBelow: string[] = [];

        for (let key = 0; key < reelsetArr.length; key++) {
            let reelsetCycled = reelsetArr[key].concat(reelsetArr[key].slice(0, 10));
            reels[key] = reelsetCycled.slice(positions[key], positions[key] + Number(gameSettings['sh']));

            // PHP: array_slice($reelsetCycled, $value - 1, 1) handling negative index logic?
            // If value is 0, value-1 is -1. PHP array_slice with -1 length or offset?
            // "array_slice($reelsetCycled, $value - 1, 1)"
            let beforeIndex = positions[key] - 1;
            if (beforeIndex < 0) beforeIndex = reelsetCycled.length - 1; // Fallback or strict PHP parity needed here. Let's trace PHP: if positions[key]=0, $value-1 = -1. array_slice array, -1, 1 returns the last element.
            // Wait, in JS array.slice(-1) returns the last element.
            let sliced = beforeIndex < 0 ? reelsetCycled.slice(-1) : reelsetCycled.slice(beforeIndex, beforeIndex + 1);
            symbolsAfter[key] = sliced.join('');
            symbolsBelow[key] = reels[key][reels[key].length - 1];
        }

        if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
            let currentSymbolsAfter = symbolsAfter;
            for (let key = 0; key < reels.length; key++) {
                reels[key].push(currentSymbolsAfter[key]);
            }

            // chunk slotArea
            let tmpSlotArea: string[][] = [];
            for (let i = 0; i < log['SlotArea'].length; i += reels.length) {
                tmpSlotArea.push(log['SlotArea'].slice(i, i + reels.length));
            }

            let currentSlotArea: string[][] = [];
            let k = 0;
            while (k < reels.length) {
                let i = 0;
                currentSlotArea[k] = [];
                while (i < Number(gameSettings['sh'])) {
                    currentSlotArea[k].push(tmpSlotArea[i][k]);
                    i++;
                }
                k++;
            }

            let winSymbols: any[] = [];
            if (log['WinLines']) {
                for (let winLine of log['WinLines']) {
                    winSymbols.push(winLine['WinSymbol']);
                }
            }

            let sortSlotArea: string[][] = [];
            for (let sortReelKey = 0; sortReelKey < currentSlotArea.length; sortReelKey++) {
                sortSlotArea[sortReelKey] = [];
                for (let value of currentSlotArea[sortReelKey]) {
                    // String vs number comparison handling
                    if (!winSymbols.map(String).includes(String(value))) {
                        sortSlotArea[sortReelKey].push(value);
                    }
                }
            }

            for (let reelKey = 0; reelKey < sortSlotArea.length; reelKey++) {
                let currentReel = sortSlotArea[reelKey];
                let reelCount = currentReel.length;
                if (reelCount < Number(gameSettings['sh'])) {
                    let missing = Number(gameSettings['sh']) - reelCount;
                    // PHP array_slice($reels[$reelKey], ($reelCount - $gameSettings['sh'])) => equivalent to slice( -missing )
                    let sliceFromReels = reels[reelKey].slice(-missing);
                    sortSlotArea[reelKey] = sliceFromReels.concat(currentReel);
                }
            }

            symbolsBelow = [];
            for (let item of sortSlotArea) {
                symbolsBelow.push(item[item.length - 1]);
            }
            symbolsAfter = [];
            for (let reelAndSymbolsAfter of reels) {
                symbolsAfter.push(reelAndSymbolsAfter[0]);
            }
            reels = sortSlotArea;
        }

        let slotArea: string[] = [];
        let i = 0;
        while (i < Number(gameSettings['sh'])) {
            let k = 0;
            while (k < reels.length) {
                slotArea.push(reels[k][i]);
                k++;
            }
            i++;
        }

        return {
            SlotArea: slotArea,
            SymbolsAfter: symbolsAfter,
            SymbolsBelow: symbolsBelow
        };
    }
}
