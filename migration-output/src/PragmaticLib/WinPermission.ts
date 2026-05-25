import { MockDatabase } from '../MockDatabase';

export class WinPermission {
    public static winCheck(freespins: any, buyFS: string, currentState: any, win: number, multipliers: any, log: any) {
        let bank = MockDatabase.getInstance();

        if (freespins) {
            if (buyFS !== '0') {
                if (freespins['Pay'] !== undefined) {
                    if (bank.bonusBank < freespins['Pay']) return false;
                }
            }
        }

        if (!freespins && currentState['FreeSpinNumber'] === undefined) {
            if (bank.slotsBank < win) return false;
        }

        if (currentState['FreeSpinNumber'] !== undefined && currentState['FreeState'] !== 'FirstFreeSpin') {
            if (currentState['State'] === 'LastRespin' && log && log['BankCredit'] !== undefined) {
                delete log['BankCredit'];
            }

            if (multipliers) {
                let total_mult = 0;
                for (let multiplier of multipliers) {
                    total_mult += Number(multiplier['Multiplier']);
                }

                if (currentState['tmb_win'] !== undefined) {
                    win = currentState['tmb_win'] * total_mult;
                } else {
                    win = win * total_mult;
                }

                if (log && log['BankCredit'] !== undefined) {
                    win -= log['BankCredit'];
                }
            }

            if (bank.bonusBank < win) return false;
            else {
                if (log && log['BankCredit'] !== undefined) {
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
