export class FreeSpin {
    public static check(slotArea: string[], log: any, gameSettings: Record<string, string>, bet: number) {
        let freeSpins: number | false = false;
        let addFreeSpins: number | false = false;

        let scatterTmp = gameSettings['scatters'].split('~');
        let scatter = scatterTmp[0];
        let scatterPayTable = scatterTmp[1].split(',').reverse();

        let scatterPositions: number[] = [];
        let symbols: Record<string, number> = {};

        for (let i = 0; i < slotArea.length; i++) {
            let symbol = slotArea[i];
            if (symbol === scatter) {
                scatterPositions.push(i);
            }
            symbols[symbol] = (symbols[symbol] || 0) + 1;
        }

        if (symbols[scatter]) {
            if (log && log['FreeSpinNumber'] !== undefined && log['FreeState'] !== 'LastFreeSpin') {
                if (symbols[scatter] >= Number(gameSettings['settings_needaddfs'])) {
                    addFreeSpins = Number(gameSettings['settings_addfs']);
                }
            } else {
                let payStr = scatterPayTable[symbols[scatter] - 1];
                let pay = Number(payStr) || 0;
                let win = Math.round(pay * bet * 100) / 100;
                if (win > 0) {
                    freeSpins = Number(gameSettings['settings_fs']);
                }
            }
        }

        if (freeSpins !== false) {
            let payStr = scatterPayTable[symbols[scatter] - 1];
            let pay = Number(payStr) || 0;
            let win = Math.round(pay * bet * 100) / 100;
            return { FreeSpins: freeSpins, Pay: win, ScatterPositions: scatterPositions, Scatter: scatter };
        }
        if (addFreeSpins !== false) {
            return { AddFreeSpins: addFreeSpins };
        }
        return false;
    }
}
