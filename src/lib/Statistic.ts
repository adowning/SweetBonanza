import { StatGame } from '../stubs/StatGame';
import { User } from '../stubs/User';
import { Game } from '../stubs/Game';
import { GameBank } from '../stubs/GameBank';

export class Statistic {
    static setStatistic(
        user: User,
        win: number,
        game: Game,
        bank: GameBank,
        bet: number,
        toSlotBank: number,
        toJackpot: number,
        toProfit: number,
        fs: any,
        slotArea: any
    ) {
        let addName = '';
        if (fs) addName = ' FS';

        StatGame.create({
            user_id: user.id,
            balance: user.balance,
            bet: bet,
            win: win,
            game: game.name + addName,
            in_game: toSlotBank,
            in_jpg: toJackpot,
            in_profit: toProfit,
            denomination: game.denomination,
            shop_id: user.shop_id,
            slots_bank: bank.slots,
            bonus_bank: bank.bonus,
            fish_bank: bank.fish_bank,
            table_bank: bank.table_bank,
            little_bank: bank.little,
            total_bank: bank.slots + bank.bonus + bank.fish_bank + bank.table_bank + bank.little,
        });
    }

    private static getSymbols(slotArea: any[]) {
        // Implementation based on PHP code (which was commented out in usage but present in class)
        // Leaving as is or implementing if needed. PHP had it private and used in commented out line.
        let symbols: { [key: number]: string } = {};
        for (const reel of slotArea) {
            // reel is likely string[] or number[]
            for (let key = 0; key < reel.length; key++) {
                const symbol = reel[key];
                symbols[key] = (key in symbols) ? symbols[key] + symbol + '_' : symbol + '_';
            }
        }
        return Object.values(symbols).join(',');
    }
}
