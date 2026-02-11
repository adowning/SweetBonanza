export class FreeSpin {
    static check(slotArea: any[], log: any, gameSettings: any, bet: number) {
        let freeSpins: any = false;
        let addFreeSpins: any = false;

        const scatterTmp = gameSettings['scatters'].split('~');
        const scatter = parseInt(scatterTmp[0], 10);
        // scatterPayTable is reversed array of payouts
        const scatterPayTable = scatterTmp[1].split(',').map((v: string) => parseFloat(v)).reverse();

        // Count scatters
        let scatterCount = 0;
        const scatterPositions: number[] = [];
        slotArea.forEach((symbol: any, index: number) => {
            if (parseInt(symbol, 10) === scatter) {
                scatterCount++;
                scatterPositions.push(index);
            }
        });

        if (scatterCount > 0) {
            if (log && log['FreeSpinNumber'] && log['FreeState'] !== 'LastFreeSpin') {
                // Already in Free Spins
                if (scatterCount >= parseInt(gameSettings['settings_needaddfs'], 10)) {
                    addFreeSpins = parseInt(gameSettings['settings_addfs'], 10);
                }
            } else {
                // Not in Free Spins
                // Pay based on scatter count - 1 as index?
                // PHP: $pay = $scatterPayTable[$symbols[$scatter]-1];
                // index is count - 1.
                // If count is 4, index 3.
                // If count > table length? PHP arrays don't throw, just null/undefined.

                const index = scatterCount - 1;
                let pay = 0;
                if (index >= 0 && index < scatterPayTable.length) {
                    pay = scatterPayTable[index];
                }

                const win = parseFloat((pay * bet).toFixed(2));

                if (win > 0) {
                    freeSpins = parseInt(gameSettings['settings_fs'], 10);
                }

                if (freeSpins) {
                    return {
                        FreeSpins: freeSpins,
                        Pay: win,
                        ScatterPositions: scatterPositions,
                        Scatter: scatter
                    };
                }
            }
        }

        if (addFreeSpins) {
            return { AddFreeSpins: addFreeSpins };
        }

        return false;
    }
}
