import { User } from '../stubs/User';
import { Game } from '../stubs/Game';
import { Log } from './Log';

export class Collect {
    static collect(user: User, index: number, counter: number, log: Log, callbackUrl: string, game: Game) {
        const currentLog = log.getLog();
        if (currentLog && currentLog['TotalWin']) {
            user.increment('balance', currentLog['TotalWin']);
            user.save();
        }
        game.save();

        const time = new Date().getTime();

        const response = [
            'balance=' + user.balance,
            'index=' + index,
            'balance_cash=' + user.balance,
            'balance_bonus=0.00',
            'na=s',
            'stime=' + time,
            'sver=5',
            'counter=' + counter
        ];

        return response.join('&');
    }
}
