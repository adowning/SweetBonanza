export class WinChecker {
    private paytable: number[][];

    constructor(gameSettings: Record<string, string>) {
        let paytableStrs = gameSettings['paytable'].split(';');
        this.paytable = [];
        for (let item of paytableStrs) {
            this.paytable.push(item.split(',').map(Number));
        }
    }

    public getWin(bet: number, slotArea: any) {
        let allWinSymbols: Record<string, number> = {};
        for (let symbol of slotArea['SlotArea']) {
            allWinSymbols[symbol] = (allWinSymbols[symbol] || 0) + 1;
        }

        let winSymbols: any[] = [];
        let totalWin = 0;

        for (let keyStr in allWinSymbols) {
            let key = Number(keyStr);
            let value = allWinSymbols[keyStr];

            // this.paytable[key][count(this.paytable[key]) - value]
            let payIndex = this.paytable[key].length - value;
            if (payIndex < 0) payIndex = 0; // Prevent out of bounds if value is larger than paytable length
            let win = Math.round(this.paytable[key][payIndex] * bet * 100) / 100;

            if (win > 0) {
                let winPositions: number[] = [];
                for (let i = 0; i < slotArea['SlotArea'].length; i++) {
                    if (slotArea['SlotArea'][i] === String(key)) {
                        winPositions.push(i);
                    }
                }
                winSymbols.push({
                    WinSymbol: key,
                    CountSymbols: value,
                    Pay: win,
                    Positions: winPositions
                });
                totalWin += win;
            }
        }

        return { TotalWin: totalWin, WinLines: winSymbols };
    }
}
