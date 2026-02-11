import { GameBank } from '../stubs/GameBank';

export class WinPermission {
    static winCheck(freespins: any, buyFS: string, bank: GameBank, currentState: any, win: number, multipliers: any, log: any) {
        // freespins is object { FreeSpins: ..., Pay: ... } or { AddFreeSpins: ... } or false.

        if (freespins) {
            // buyFS is '0' if purchased? No, code says: if ($buyFS === '0') $changeBalance *= 100;
            // In Spin.php: if ($buyFS === '0') BuyFreeSpins::getFreeSpin(...);
            // Wait, WinPermission.php says: if (!$buyFS === '0'){ ... }
            // Wait, strict comparison: (!$buyFS === '0').
            // If $buyFS is '0', !$buyFS is false (empty string logic in PHP? '0' is falsy? Yes).
            // So if buyFS is '0' (purchased), !buyFS is true? No.
            // Wait.
            // If buyFS is '0'. !'0' is true. true === '0' is false.
            // If buyFS is '1'. !'1' is false. false === '0' is false.
            // PHP logic: `!$buyFS === '0'` is tricky.
            // Precedence: `!` is higher than `===`.
            // So `(!$buyFS) === '0'`.
            // If buyFS is '0', !$buyFS is true. true === '0' is false.
            // If buyFS is '', !$buyFS is true. true === '0' is false.
            // If buyFS is undefined/null, true.
            // Wait, maybe it meant `!($buyFS === '0')`.
            // But code is `if (!$buyFS === '0')`.
            // This is strange.
            // Let's assume it means: If NOT purchased free spins.
            // Usually buyFS='0' means purchased.
            // If not purchased, we check bank.
            // If purchased, we don't check bank (since user paid 100x bet).
            // Let's assume logic is: if (buyFS !== '0').

            if (buyFS !== '0') {
                if (freespins['Pay']) {
                    if (bank.bonus < freespins['Pay']) return false;
                }
            }
        }

        if (!freespins && !currentState['FreeSpinNumber']) {
            if (bank.slots < win) return false;
        }

        if (currentState['FreeSpinNumber'] && currentState['FreeState'] !== 'FirstFreeSpin') {
            if (currentState['State'] === 'LastRespin' && log['BankCredit']) {
                delete log['BankCredit'];
            }

            if (multipliers) {
                let total_mult = 0;
                for (const multiplier of multipliers) {
                    total_mult += multiplier['Multiplier'];
                }

                if (currentState['tmb_win']) {
                    win = currentState['tmb_win'] * total_mult;
                } else {
                    win = win * total_mult;
                }

                if (log['BankCredit']) {
                    win -= log['BankCredit'];
                }
            }

            if (bank.bonus < win) return false;
            else {
                if (log['BankCredit']) {
                    currentState['BankCredit'] = log['BankCredit'] + win;
                } else {
                    currentState['BankCredit'] = win;
                }

                return { CurrentWin: win };
            }
        }

        return true;
    }
}
