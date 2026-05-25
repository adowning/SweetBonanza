import { MockDatabase } from '../MockDatabase';
import { formatFloat } from '../utils';

export class Collect {
    public static collect(index: string, counter: string, log: any) {
        let currentLog = log.getLog();
        let db = MockDatabase.getInstance();

        let winAmount = currentLog['TotalWin'] || 0;
        db.balance += winAmount;

        let time = Date.now();
        let response = [
            'balance=' + formatFloat(db.balance),
            'index=' + index,
            'balance_cash=' + formatFloat(db.balance),
            'balance_bonus=0.00',
            'na=s',
            'stime=' + time,
            'sver=5',
            'counter=' + counter
        ];
        return response.join('&');
    }
}
