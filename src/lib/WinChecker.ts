export class WinChecker {
    paytable: number[][];

    constructor(gameSettings: any) {
        const paytableString = gameSettings['paytable'];
        const paytableRows = paytableString.split(';');
        this.paytable = [];
        for (const row of paytableRows) {
            this.paytable.push(row.split(',').map((v: string) => parseFloat(v)));
        }
    }

    getWin(bet: number, slotArea: any) {
        // Count symbols in SlotArea
        const allWinSymbols: { [key: number]: number } = {};
        for (const symbol of slotArea['SlotArea']) {
            const sym = parseInt(symbol, 10);
            allWinSymbols[sym] = (allWinSymbols[sym] || 0) + 1;
        }

        const winSymbols: any[] = [];
        let totalWin = 0;

        for (const keyString in allWinSymbols) {
            const key = parseInt(keyString, 10);
            const value = allWinSymbols[key];

            if (this.paytable[key]) {
                const payRow = this.paytable[key];
                // PHP: $this->paytable[$key][count($this->paytable[$key]) - $value]
                const index = payRow.length - value;

                if (index >= 0 && index < payRow.length) {
                    const win = parseFloat((payRow[index] * bet).toFixed(2));

                    if (win > 0) {
                        const winPositions: number[] = [];
                        slotArea['SlotArea'].forEach((sym: any, pos: number) => {
                            if (parseInt(sym, 10) === key) {
                                winPositions.push(pos);
                            }
                        });

                        winSymbols.push({
                            WinSymbol: key,
                            CountSymbols: value,
                            Pay: win,
                            Positions: winPositions
                        });
                        totalWin += win;
                    }
                }
            }
        }

        return {
            TotalWin: totalWin,
            WinLines: winSymbols
        };
    }
}
