export class Multiple {
    static getBonanzaMultiple(slotArea: any[], gameSettings: any, currentLog: any) {
        const prmString = gameSettings['prm'];
        // prm=12~2,3,...;12~...
        // PHP: $tmp = explode(';', $gameSettings['prm']); $tmp = explode('~', $tmp[0]);
        // It takes the first configuration.
        const prmConfigs = prmString.split(';');
        const prmParts = prmConfigs[0].split('~');
        const prmSymbol = parseInt(prmParts[0], 10);
        const prmMultipliers = prmParts[1].split(',').map((v: string) => parseInt(v, 10));

        const reels = 6;
        const sh = parseInt(gameSettings['sh'], 10);

        // Convert SlotArea (flat) to columns
        // PHP: array_chunk($slotArea, $reels) -> chunks into rows of length 6.
        // Then transpose.
        const tmpSlotArea: any[][] = [];
        for (let i = 0; i < slotArea.length; i += reels) {
            tmpSlotArea.push(slotArea.slice(i, i + reels));
        }

        const currentSlotArea: any[][] = [];
        for (let k = 0; k < reels; k++) {
            currentSlotArea[k] = [];
            for (let i = 0; i < sh; i++) {
                if (tmpSlotArea[i]) {
                    currentSlotArea[k].push(tmpSlotArea[i][k]);
                }
            }
        }

        const prmReady: any[] = [];

        for (let reelKey = 0; reelKey < currentSlotArea.length; reelKey++) {
            const reel = currentSlotArea[reelKey];
            // Iterate reversed
            for (let i = reel.length - 1; i >= 0; i--) {
                const symbolKey = reel.length - 1 - i; // 0 for last element
                // Wait, symbolKey in PHP: foreach (array_reverse($reel) as $symbolKey => $symbol)
                // In PHP array_reverse preserves keys? No, unless strictly specified.
                // Default array_reverse reindexes. So symbolKey 0 is the last element.

                const symbol = reel[i]; // symbol at index i (where i goes from length-1 down to 0)
                // PHP loop: symbolKey 0 is last element. symbolKey 1 is second last.
                // So symbolKey = reel.length - 1 - i.

                if (parseInt(symbol, 10) === prmSymbol) {
                    const symbolsCount = sh - 1;
                    // Position calculation:
                    // $prmSymbol = $reelKey + ($reels * ($symbolsCount - $symbolKey));
                    // reelKey is column index (0..5).
                    // reels = 6.
                    // symbolKey is index from bottom (0 is bottom).
                    // symbolsCount is max index (4).
                    // So row index from top = symbolsCount - symbolKey.
                    // Position = col + (row * width).
                    // This matches flat array index.

                    const actualSymbolKey = reel.length - 1 - i; // 0, 1, 2...

                    const position = reelKey + (reels * (symbolsCount - actualSymbolKey));

                    prmReady.push({
                        Symbol: prmSymbol,
                        Position: position,
                        Multiplier: Multiple.getMultiplier(currentLog, prmMultipliers, reelKey),
                        Reel: reelKey
                    });
                }
            }
        }

        if (prmReady.length > 0) return prmReady;
        return false;
    }

    private static getMultiplier(currentLog: any, prmMultipliers: number[], reelKey: number) {
        if (currentLog && currentLog['Multipliers']) {
            for (const logMultiplier of currentLog['Multipliers']) {
                if (logMultiplier['Reel'] === reelKey) {
                    return logMultiplier['Multiplier'];
                }
            }
        }

        // Random multiplier
        const randomIndex = Math.floor(Math.random() * prmMultipliers.length);
        return prmMultipliers[randomIndex];
    }
}
