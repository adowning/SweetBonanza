export class Multiple {
    public static getBonanzaMultiple(slotArea: string[], gameSettings: Record<string, string>, currentLog: any) {
        let tmp1 = gameSettings['prm'].split(';');
        let tmp = tmp1[0].split('~');
        let prm = tmp[0];
        let prmMultipliers = tmp[1].split(',');

        let reels = 6;
        let tmpSlotArea: string[][] = [];
        for (let i = 0; i < slotArea.length; i += reels) {
            tmpSlotArea.push(slotArea.slice(i, i + reels));
        }

        let currentSlotArea: string[][] = [];
        let k = 0;
        while (k < reels) {
            let i = 0;
            currentSlotArea[k] = [];
            while (i < Number(gameSettings['sh'])) {
                currentSlotArea[k].push(tmpSlotArea[i][k]);
                i++;
            }
            k++;
        }

        let prmReady: any[] = [];
        for (let reelKey = 0; reelKey < currentSlotArea.length; reelKey++) {
            let reel = currentSlotArea[reelKey];
            let reversedReel = [...reel].reverse();
            for (let symbolKey = 0; symbolKey < reversedReel.length; symbolKey++) {
                let symbol = reversedReel[symbolKey];
                if (symbol === prm) {
                    let symbolsCount = Number(gameSettings['sh']) - 1;
                    let prmSymbol = reelKey + (reels * (symbolsCount - symbolKey));
                    prmReady.push({
                        Symbol: prm,
                        Position: prmSymbol,
                        Multiplier: this.getMultiplier(currentLog, prmMultipliers, reelKey),
                        Reel: reelKey
                    });
                }
            }
        }

        if (prmReady.length > 0) return prmReady;
        else return false;
    }

    private static getMultiplier(currentLog: any, prmMultipliers: string[], reelKey: number): number {
        let multiplier: number | undefined;
        if (currentLog && currentLog['Multipliers']) {
            for (let logMultiplier of currentLog['Multipliers']) {
                if (logMultiplier['Reel'] === reelKey) {
                    multiplier = logMultiplier['Multiplier'];
                }
            }
        }
        if (multiplier !== undefined) return Number(multiplier);

        // array_rand
        let rndIdx = Math.floor(Math.random() * prmMultipliers.length);
        return Number(prmMultipliers[rndIdx]);
    }
}
