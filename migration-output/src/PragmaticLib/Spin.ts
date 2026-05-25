import { SlotArea } from './SlotArea';
import { BuyFreeSpins } from './BuyFreeSpins';
import { WinChecker } from './WinChecker';
import { FreeSpin } from './FreeSpin';
import { Multiple } from './Multiple';
import { LogAndServer } from './LogAndServer';
import { WinPermission } from './WinPermission';
import { SwitchMoney } from './SwitchMoney';
import { Log } from './Log';
import { MockDatabase } from '../MockDatabase';

export class InsufficientBalanceException extends Error {
    constructor() {
        super("Insufficient Balance");
    }
}

export class Spin {
    public static spinResult(bet: number, lines: number, log: any, gameSettingsObj: any, index: string, counter: string, callbackUrl: string, doubleChance: string | number, buyFS: string): string {
        let db = MockDatabase.getInstance();
        bet = Number(bet);
        lines = Number(lines);

        if (db.balance < bet * lines) {
            throw new InsufficientBalanceException();
        }

        let gameSettings = gameSettingsObj.all;
        let currentLog = log.getLog();
        lines = doubleChance === '0' || doubleChance === 0 ? lines : lines * 1.25;

        let changeBalance = 0;
        if (currentLog &&
            (currentLog['State'] !== 'Spin' && currentLog['State'] !== 'LastRespin' ||
             (currentLog['FreeState'] !== undefined && currentLog['FreeState'] !== 'LastFreeSpin'))) {
            changeBalance = 0;
        } else {
            changeBalance = (bet * lines * -1);
            if (buyFS === '0') changeBalance *= 100;
        }

        let logAndServer: any;
        let win: any;
        let slotArea: any;
        let freeSpins: any;
        let win_permission: any;
        let multipliers: any;

        while (true) {
            let reelSet = doubleChance === '0' || doubleChance === 0 ? 0 : 2;
            if (currentLog && currentLog['FreeState'] !== undefined
                && currentLog['FreeState'] !== 'LastFreeSpin' && currentLog['FreeSpinNumber'] > 1) {
                reelSet = 1;
            }

            slotArea = SlotArea.getSlotArea(gameSettings, reelSet, currentLog);

            if (buyFS === '0') {
                BuyFreeSpins.getFreeSpin(slotArea.SlotArea, gameSettings);
            }

            let winChecker = new WinChecker(gameSettings);
            win = winChecker.getWin(bet, slotArea);

            freeSpins = false;
            if (win.TotalWin === 0) {
                freeSpins = FreeSpin.check(slotArea.SlotArea, currentLog, gameSettings, bet);
            }

            multipliers = false;
            if (currentLog && currentLog['FreeSpins'] !== undefined && currentLog['FreeState'] !== 'LastFreeSpin') {
                multipliers = Multiple.getBonanzaMultiple(slotArea.SlotArea, gameSettings, currentLog);
            }

            logAndServer = LogAndServer.getResult(slotArea, index, counter, bet, lines, doubleChance, reelSet, win, currentLog, freeSpins, multipliers, changeBalance);

            if (win.TotalWin > 0) {
                win_permission = WinPermission.winCheck(freeSpins, buyFS, logAndServer.Log, win.TotalWin, multipliers, currentLog);
            } else {
                win_permission = true;
            }

            if (!win_permission) {
                continue;
            }
            break;
        }

        SwitchMoney.set(changeBalance, win.TotalWin, freeSpins, logAndServer.Log, win_permission);

        Log.setLog(logAndServer.Log);

        return logAndServer.Server.join('&');
    }
}
