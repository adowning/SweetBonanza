import { User } from '../stubs/User';
import { Game } from '../stubs/Game';
import { Log } from './Log';
import { GameSettings } from './GameSettings';
import { GameBank } from '../stubs/GameBank';
import { Shop } from '../stubs/Shop';
import { SlotArea } from './SlotArea';
import { BuyFreeSpins } from './BuyFreeSpins';
import { WinChecker } from './WinChecker';
import { FreeSpin } from './FreeSpin';
import { Multiple } from './Multiple';
import { LogAndServer } from './LogAndServer';
import { WinPermission } from './WinPermission';
import { SwitchMoney } from './SwitchMoney';

export class Spin {
    static spinResult(user: User, game: Game, bet: number, lines: number, log: Log, gameSettings: GameSettings, index: number, counter: number, callbackUrl: string, doubleChance: number, buyFS: string, bank: GameBank, shop: Shop, jpgs: any[]) {
        if (user.balance < bet * lines) return false;

        const currentLog = log.getLog();
        const effectiveLines = doubleChance === 0 ? lines : lines * 1.25;

        let changeBalance = 0;
        if (currentLog &&
            (currentLog['State'] !== 'Spin' && currentLog['State'] !== 'LastRespin' ||
                (currentLog['FreeState'] && currentLog['FreeState'] !== 'LastFreeSpin'))) {
            changeBalance = 0;
        } else {
            changeBalance = (bet * lines * -1);
            if (buyFS === '0') changeBalance *= 100;
        }

        while (true) {
            let reelSet = doubleChance === 0 ? 0 : 2;
            if (currentLog && currentLog['FreeState'] &&
                currentLog['FreeState'] !== 'LastFreeSpin' && currentLog['FreeSpinNumber'] > 1) {
                reelSet = 1; // 4th reel set? PHP code says: if free spins - reel set 4. But index 1?
                // PHP: $reelSet = 1; // если фриспины - то набор катушек 4й
                // Wait, 'reel_set1' in init.php exists.
            }

            const slotArea = SlotArea.getSlotArea(gameSettings.all, reelSet, currentLog);

            if (buyFS === '0') {
                BuyFreeSpins.getFreeSpin(slotArea['SlotArea'], gameSettings.all);
            }

            const winChecker = new WinChecker(gameSettings.all);
            const win = winChecker.getWin(bet, slotArea);

            let freeSpins: any = false;
            if (win['TotalWin'] == 0) {
                freeSpins = FreeSpin.check(slotArea['SlotArea'], currentLog, gameSettings.all, bet);
            }

            let multipliers: any = false;
            if (currentLog && currentLog['FreeSpins'] && currentLog['FreeState'] !== 'LastFreeSpin') {
                multipliers = Multiple.getBonanzaMultiple(slotArea['SlotArea'], gameSettings.all, currentLog);
            }

            const logAndServer = LogAndServer.getResult(slotArea, index, counter, bet, lines, doubleChance, reelSet, win, currentLog, user, freeSpins, multipliers, changeBalance);

            let winPermission: any = true;
            if (win['TotalWin'] > 0) {
                winPermission = WinPermission.winCheck(freeSpins, buyFS, bank, logAndServer['Log'], win['TotalWin'], multipliers, currentLog);
            } else {
                winPermission = true;
            }

            if (!winPermission) continue; // NewSpin

            SwitchMoney.set(changeBalance, shop, bank, jpgs, user, game, callbackUrl, win['TotalWin'], slotArea['SlotArea'], freeSpins, logAndServer['Log'], winPermission);

            Log.setLog(logAndServer['Log'], game.id, user.id, user.shop_id);

            return logAndServer['Server'].join('&');
        }
    }
}
