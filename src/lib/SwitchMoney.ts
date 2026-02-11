import { Jackpots } from './Jackpots';
import { SlotBank } from './SlotBank';
import { Statistic } from './Statistic';
import { Game } from '../stubs/Game';
import { User } from '../stubs/User';
import { GameBank } from '../stubs/GameBank';

export class SwitchMoney {
    static set(bet: number, shop: any, bank: GameBank, jpgs: any[], user: User, game: Game, callbackUrl: string, win: number, slotArea: any, freespins: any, currentLog: any, winPermission: any) {
        if (bet) {
            const betDec = bet * -1; // PHP: $bet *= -1; but decrement takes positive?
            // PHP: $bet *= -1; $user->decrement('balance', $bet);
            // If bet is 10. bet becomes -10. decrement('balance', -10) -> balance - (-10) = balance + 10.
            // This ADDS money?
            // Wait. $user->decrement('balance', value). Usually subtracts value.
            // If value is negative, it adds.
            // Why would bet ADD money?
            // Maybe decrement expects positive value?
            // If I pass -10 to decrement, it subtracts -10, so adds 10.
            // That seems wrong for a bet.
            // Unless `decrement` implementation in `VanguardLTE` handles signs?
            // Or maybe `bet` passed to `SwitchMoney` is already negative?
            // In `Spin.php`: `$changeBalance = ($bet * $lines * -1);`
            // Then `SwitchMoney::set($changeBalance, ...)`
            // So `bet` passed here IS negative (e.g. -100).
            // Inside `SwitchMoney`:
            // `if ($bet)` (true for -100)
            // `$bet *= -1;` -> `bet` becomes 100.
            // `$user->decrement('balance', $bet);` -> decrement 100.
            // This makes sense.

            // TS:
            const positiveBet = bet * -1;
            user.decrement('balance', positiveBet);
            user.save();
        }

        if (winPermission && typeof winPermission === 'object' && winPermission.CurrentWin !== undefined) {
            win = winPermission.CurrentWin;
        }

        const toBonus = currentLog && currentLog['FSPay'] ? currentLog['FSPay'] : false;

        // Jackpots
        // Note: Jackpots.toJP expects bet (amount added to JP).
        // Here `bet` was modified to be positive 100.
        // PHP: `$toJackpot = Jackpots::toJP($bet, $jpgs);`
        // So we pass the positive bet amount.
        const toJackpot = Jackpots.toJP(bet * -1, jpgs); // wait, bet is now positive 100.
        // My code `const positiveBet = bet * -1`.
        // But PHP `$bet *= -1` modifies `$bet` variable.
        // So subsequent usage of `$bet` sees 100.

        const betAmount = bet * -1; // Positive amount

        const toProfit = betAmount * ((100 - shop.percent) / 100);

        const toSlotBank = SlotBank.addBank(betAmount, bank, toJackpot, toProfit, toBonus);

        if (currentLog && currentLog['FSPay']) {
            win = currentLog['FSPay'];
        }

        game.stat_out += win;
        game.stat_in += toSlotBank;
        game.save();

        Statistic.setStatistic(user, win, game, bank, betAmount, toSlotBank, toJackpot, toProfit, freespins, slotArea);

        if (currentLog && currentLog['FreeState']) {
            bank.decrement('bonus', win);
        } else {
            bank.decrement('slots', win);
        }
        bank.save();
    }
}
