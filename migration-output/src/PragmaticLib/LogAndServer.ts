import { formatFloat } from '../utils';

export class LogAndServer {
    public static getResult(slotArea: any, index: string, counter: string, bet: number, lines: number, doubleChance: string | number, reelSet: number, win: any, log: any, freeSpins: any, multipliers: any, changeBalance: number) {
        let toLog: any = {
            State: 'Spin',
            Win: win.TotalWin,
            TotalWin: win.TotalWin,
            WinLines: win.WinLines,
            SlotArea: slotArea.SlotArea,
            SymbolsAfter: slotArea.SymbolsAfter,
            SymbolsBelow: slotArea.SymbolsBelow,
            Lines: lines,
            Bet: bet,
            DoubleChance: doubleChance,
            Counter: counter,
            Index: index,
            ReelSet: reelSet,
            tmb_res: 0,
            tmb_win: 0
        };

        if (log && log['TotalWin'] !== undefined) toLog['TotalWin'] = log['TotalWin'] + win.TotalWin;

        let time = Date.now();
        let toServer: string[] = [
            'balance_cash=',
            'balance_bonus=0.00',
            'index=' + toLog['Index'],
            'balance=',
            'na=s',
            'bl=' + toLog['DoubleChance'],
            'stime=' + time,
            'sa=' + toLog['SymbolsAfter'].join(','),
            'sb=' + toLog['SymbolsBelow'].join(','),
            'sh=5',
            'c=' + toLog['Bet'],
            'sver=5',
            'counter=' + toLog['Counter'],
            'l=' + toLog['Lines'],
            's=' + toLog['SlotArea'].join(','),
            'w=' + toLog['Win']
        ];

        let addToServer: string[] = [];

        if (win.TotalWin === 0) {
            if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
                let addLog = {
                    Respin: log['Respin'] + 1,
                    RespinWin: log['RespinWin'],
                    WinLines: win.WinLines,
                    TotalWin: log['TotalWin'],
                    tmb_res: log['tmb_res'],
                    tmb_win: log['tmb_win'],
                    State: 'LastRespin'
                };
                Object.assign(toLog, addLog);

                let replIdx = toServer.indexOf('na=s');
                if (replIdx !== -1) toServer[replIdx] = 'na=c';

                let addResponse = [
                    'rs_t=' + toLog['Respin'],
                    'rs_win=' + toLog['RespinWin'],
                    'tmb_res=' + toLog['tmb_res'],
                    'tmb_win=' + toLog['tmb_win']
                ];
                toServer.push(...addResponse);
            } else {
                toLog['State'] = 'Spin';
            }

            if (freeSpins) {
                let addFSLog: any = {};
                let responseFs: string[] = [];

                if (freeSpins['AddFreeSpins'] !== undefined) {
                    addFSLog = {
                        FreeState: 'AddFreeSpin',
                        FreeSpins: log['FreeSpins'] + freeSpins['AddFreeSpins'],
                        FreeSpinNumber: log['FreeSpinNumber'] + 1
                    };
                    responseFs = [
                        'fsmul=1',
                        'fsmax=' + addFSLog['FreeSpins'],
                        'fswin=0.00',
                        'fs=' + addFSLog['FreeSpinNumber'],
                        'fsres=0.00',
                        'fsmore=5'
                    ];
                } else {
                    if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
                        toLog['TotalWin'] = log['TotalWin'];
                    }
                    addFSLog = {
                        FreeState: 'FirstFreeSpin',
                        FreeSpins: freeSpins['FreeSpins'],
                        FreeSpinNumber: 1,
                        FSPay: freeSpins['Pay'],
                        Scatter: freeSpins['Scatter'],
                        ScatterPositions: freeSpins['ScatterPositions'],
                        TotalWin: toLog['TotalWin'] + freeSpins['Pay'],
                        Win: toLog['TotalWin'] + freeSpins['Pay']
                    };
                    responseFs = [
                        'fsmul=1',
                        'fsmax=' + addFSLog['FreeSpins'],
                        'fswin=0.00',
                        'fs=' + addFSLog['FreeSpinNumber'],
                        'fsres=0.00',
                        'fs_bought=10',
                        'psym=' + addFSLog['Scatter'] + '~' + addFSLog['FSPay'] + '~' + addFSLog['ScatterPositions'].join(',')
                    ];
                }

                if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
                    addFSLog['State'] = 'LastRespin';
                } else {
                    addFSLog['State'] = 'Spin';
                }

                Object.assign(toLog, addFSLog);
                toServer.push(...responseFs);
            }
        } else {
            if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
                let addLog = {
                    Respin: log['Respin'] + 1,
                    RespinWin: log['RespinWin'] + win.TotalWin,
                    WinLines: win.WinLines,
                    TotalWin: log['TotalWin'] + win.TotalWin,
                    tmb_res: log['tmb_res'] + win.TotalWin,
                    tmb_win: log['tmb_win'] + win.TotalWin,
                    State: 'Respin'
                };
                let positions = this.positionsToServer(addLog.WinLines);
                toServer.push(...positions);
                addToServer = [
                    'rs_p=' + addLog.Respin,
                    'rs_c=1',
                    'rs_m=1',
                    'tmb_win=' + formatFloat(addLog.tmb_win),
                    'tmb_res=' + formatFloat(addLog.tmb_res),
                    'rs_win=' + formatFloat(addLog.RespinWin)
                ];
                Object.assign(toLog, addLog);
            } else {
                let addLog = {
                    Respin: 0,
                    RespinWin: 0,
                    WinLines: win.WinLines,
                    tmb_res: win.TotalWin,
                    tmb_win: win.TotalWin,
                    State: 'FirstRespin'
                };
                let positions = this.positionsToServer(addLog.WinLines);
                toServer.push(...positions);
                addToServer = [
                    'rs=t',
                    'rs_p=' + addLog.Respin,
                    'rs_c=1',
                    'rs_m=1',
                    'tmb_win=' + formatFloat(addLog.tmb_win),
                    'tmb_res=' + formatFloat(addLog.tmb_res)
                ];
                Object.assign(toLog, addLog);
            }
            toServer.push(...addToServer);
        }

        if (log && log['FreeSpinNumber'] !== undefined && log['FreeState'] !== 'LastFreeSpin') {
            if (toLog['State'] === 'Spin' || toLog['State'] === 'LastRespin') {
                toLog['FreeSpinNumber'] = log['FreeSpinNumber'] + 1;
            } else {
                toLog['FreeSpinNumber'] = log['FreeSpinNumber'];
            }
            if (toLog['FreeSpins'] === undefined) {
                toLog['FreeSpins'] = log['FreeSpins'];
            }
            toLog['TotalWin'] = toLog['Win'] + log['TotalWin'];

            let toServerFs: string[] = [];
            if (toLog['FreeSpinNumber'] <= toLog['FreeSpins']) {
                toLog['FreeState'] = 'FreeSpin';
                toServerFs = [
                    'fsmul=1',
                    'fsmax=' + toLog['FreeSpins'],
                    'fswin=0.00',
                    'fs=' + toLog['FreeSpinNumber'],
                    'fsres=0.00'
                ];
                let replIdx = toServer.indexOf('na=c');
                if (replIdx !== -1) toServer[replIdx] = 'na=s';
            } else {
                let replIdx = toServer.indexOf('na=s');
                if (replIdx !== -1) toServer[replIdx] = 'na=c';
                toLog['FreeState'] = 'LastFreeSpin';
                toServerFs = [
                    'fsmul_total=1',
                    'fswin_total=0.00',
                    'fs_total=' + (toLog['FreeSpinNumber'] - 1),
                    'fsres_total=0.00',
                    'fs_bought=10'
                ];
            }
            toServer.push(...toServerFs);
        }

        if (multipliers) {
            toLog['Multipliers'] = multipliers;
            let prg = 0;
            let rmul = 'rmul=';
            for (let key = 0; key < multipliers.length; key++) {
                let multiplier = { ...multipliers[key] };
                delete multiplier['Reel'];
                prg += Number(multiplier['Multiplier']);

                let mulStr = multiplier.Symbol + '~' + multiplier.Position + '~' + multiplier.Multiplier;
                if (key === 0) rmul += mulStr;
                else rmul += ';' + mulStr;
            }

            let replIdx = toServer.indexOf('prg=1');
            if (replIdx !== -1 && prg !== 0) toServer[replIdx] = 'prg=' + prg;
            toServer.push(rmul);

            if (prg !== 0 && toLog['State'] === 'LastRespin') {
                let addMultWin = toLog['tmb_res'] * prg;
                toLog['MultWin'] = prg;
                toLog['tmb_res'] = addMultWin;
                toLog['TotalWin'] += addMultWin - toLog['tmb_win'];
            }
        }

        toServer.unshift('tw=' + formatFloat(toLog['TotalWin']));

        let db = require('../MockDatabase').MockDatabase.getInstance();
        let balIdx = toServer.indexOf('balance=');
        if (balIdx !== -1) {
            toServer[balIdx] = 'balance=' + formatFloat(db.balance + toLog['TotalWin']);
        }
        let cashIdx = toServer.indexOf('balance_cash=');
        if (cashIdx !== -1) {
            toServer[cashIdx] = 'balance_cash=' + formatFloat(db.balance + toLog['TotalWin']);
        }

        toLog['ServerState'] = toServer;

        return { Log: toLog, Server: toServer };
    }

    private static positionsToServer(winLines: any[]) {
        let result: string[] = [];
        let tmb: string[] = [];

        for (let key = 0; key < winLines.length; key++) {
            let winLine = winLines[key];
            let l = 'l' + key + '=0~' + formatFloat(winLine['Pay']) + '~' + winLine['Positions'].join('~');
            tmb.push(winLine['WinSymbol'] + '~' + winLine['Positions'].join('~'));
            result.push(l);
        }
        result.push('tmb=' + tmb.join('~'));
        return result;
    }
}
