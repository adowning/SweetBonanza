import { User } from './stubs/User';
import { Shop } from './stubs/Shop';
import { Game } from './stubs/Game';
import { GameBank } from './stubs/GameBank';
import { JPG } from './stubs/JPG';
import { initConfig } from './config/init';
import { Log } from './lib/Log';
import { Loader } from './lib/Loader';
import { GameSettings } from './lib/GameSettings';
import { Spin } from './lib/Spin';
import { Collect } from './lib/Collect';

export async function handleRequest(request: any) {
    try {
        const userId = 1; // Mock user ID

        if (userId == null) {
            return JSON.stringify({
                responseEvent: 'error',
                responseType: '',
                serverResponse: 'invalid login'
            });
        }

        const user = User.lockForUpdate().find(userId);
        const shop = Shop.find(user.shop_id);
        const game = Game.where({ name: 'SweetBonanza', shop_id: user.shop_id }).lockForUpdate().first();
        const bank = GameBank.where({ shop_id: user.shop_id }).first();
        const jpgs = JPG.where({ shop_id: user.shop_id }).lockForUpdate().get();
        const init = [...initConfig]; // Copy
        const log = new Log(game.id, user.id);
        const callbackUrl = request.callbackUrl;

        const action = request.action;
        const bet = parseFloat(request.c);
        const lines = parseInt(request.l, 10);
        const index = parseInt(request.index, 10);
        const counter = parseInt(request.counter, 10);
        const doubleChance = parseInt(request.bl, 10);
        const buyFS = request.fsp;

        if (action === 'doInit') {
            const loader = new Loader(init, user.balance, log);
            return loader.initStr();
        }

        if (action === 'doSpin') {
            const gameSettings = new GameSettings(init);
            const response = Spin.spinResult(user, game, bet, lines, log, gameSettings, index, counter, callbackUrl, doubleChance, buyFS, bank, shop, jpgs);
            return response;
        }

        if (action === 'doCollect') {
            const response = Collect.collect(user, index, counter, log, callbackUrl, game);
            return response;
        }

        if (action === 'settings') {
            return 'SoundState=true_true_true_false_false;FastPlay=false;Intro=true;StopMsg=0;TurboSpinMsg=0;BetInfo=0_0;BatterySaver=false;ShowCCH=true;ShowFPH=true;CustomGameStoredData=;Coins=false;Volume=1;InitialScreen=1,3,6,6,3_10,4,9,10,8_6,3,8,5,4_10,8,7,7,8_5,4,4,8,1_7,8,5,9,10;SBPLock=true';
        }

        if (action === 'update') {
            const time = new Date().getTime();
            return 'balance_bonus=0.00&balance=' + user.balance + '&balance_cash=' + user.balance + '&stime=' + time;
        }

        const response = { error: 0, description: 'OK' };
        return JSON.stringify(response);

    } catch (e: any) {
        console.error(e);
        return e.toString();
    }
}
