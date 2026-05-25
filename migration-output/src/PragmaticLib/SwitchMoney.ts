import { MockDatabase } from '../MockDatabase';

export class SwitchMoney {
    public static set(bet: number, win: number, freespins: any, currentLog: any, win_permission: any) {
        let db = MockDatabase.getInstance();

        if (bet) {
            let betAmount = bet * -1; // passed as negative already in PHP ? PHP says `if ($bet) { $bet *= -1; $user->decrement('balance', $bet); }`. Spin.php sets `$changeBalance = ($bet * $lines * -1);` so bet is negative here.
            // Wait, if Spin.php passes $changeBalance, it's negative. So bet *= -1 makes it positive. decrement(balance, positive) means balance = balance - positive. So balance goes down.
            // Let's implement accurately based on Spin.ts:
            bet *= -1;
            db.balance -= bet;
        }

        if (typeof win_permission === 'object' && win_permission !== null) {
            win = win_permission.CurrentWin;
        }

        let toBonus = currentLog && currentLog['FSPay'] ? currentLog['FSPay'] : false;

        let toJackpot = 0; // Jackpots stubbed
        let toProfit = 0; // Profit stubbed

        // SlotBank::addBank logic
        let toBank = bet - toJackpot - toProfit;
        if (toBonus) {
            db.bonusBank += toBank;
        } else {
            db.slotsBank += toBank * 0.5;
            db.bonusBank += toBank * 0.5;
        }

        if (currentLog && currentLog['FSPay']) {
            win = currentLog['FSPay'];
        }

        if (currentLog && currentLog['FreeState']) {
            db.bonusBank -= win;
        } else {
            db.slotsBank -= win;
        }
    }
}
