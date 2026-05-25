import { initConfig } from './init';
import { MockDatabase } from './MockDatabase';
import { Loader, GameSettings, Spin, InsufficientBalanceException, Collect, Log } from './PragmaticLib';
import { formatFloat } from './utils';

export class Server {
    public handle(request: any): string {
        try {
            let db = MockDatabase.getInstance();
            let log = new Log();

            let action = request.action;
            let bet = request.c;
            let lines = request.l;
            let index = request.index;
            let counter = request.counter;
            let doubleChance = request.bl;
            let buyFS = request.fsp;
            let callbackUrl = request.callbackUrl;

            if (action === 'doInit') {
                let loader = new Loader(initConfig, db.balance, log);
                return loader.initStr();
            }

            if (action === 'doSpin') {
                try {
                    let gameSettings = new GameSettings(initConfig);
                    return Spin.spinResult(bet, lines, log, gameSettings, index, counter, callbackUrl, doubleChance, buyFS);
                } catch (e) {
                    if (e instanceof InsufficientBalanceException) {
                        return "";
                    }
                    throw e;
                }
            }

            if (action === 'doCollect') {
                return Collect.collect(index, counter, log);
            }

            if (action === 'settings') {
                return 'SoundState=true_true_true_false_false;FastPlay=false;Intro=true;StopMsg=0;TurboSpinMsg=0;BetInfo=0_0;BatterySaver=false;ShowCCH=true;ShowFPH=true;CustomGameStoredData=;Coins=false;Volume=1;InitialScreen=1,3,6,6,3_10,4,9,10,8_6,3,8,5,4_10,8,7,7,8_5,4,4,8,1_7,8,5,9,10;SBPLock=true';
            }

            if (action === 'update') {
                let time = Date.now();
                return 'balance_bonus=0.00&balance=' + formatFloat(db.balance) + '&balance_cash=' + formatFloat(db.balance) + '&stime=' + time;
            }

            return JSON.stringify({ error: 0, description: "OK" });
        } catch (e: any) {
            console.error(e);
            return e.toString();
        }
    }
}
