import { User } from '../stubs/User';

export class LogAndServer {
    static getResult(slotArea: any, index: number, counter: number, bet: number, lines: number, doubleChance: number, reelSet: number, win: any, log: any, user: User, freeSpins: any, multipliers: any, changeBalance: number) {
        let toLog: any = {
            SymbolsAfter: slotArea['SymbolsAfter'],
            SymbolsBelow: slotArea['SymbolsBelow'],
            SlotArea: slotArea['SlotArea'],
            Balance: user.balance + changeBalance,
            Index: index,
            Counter: counter,
            Bet: bet,
            Lines: lines,
            DoubleChance: doubleChance,
            ReelSet: reelSet,
            TotalWin: win['TotalWin'],
            Win: win['TotalWin']
        };

        const time = new Date().getTime();
        let toServer: string[] = [
            'prg_m=wm',
            'balance=' + toLog['Balance'],
            'prg=1',
            'index=' + toLog['Index'],
            'balance_cash=' + toLog['Balance'],
            'reel_set=' + toLog['ReelSet'],
            'balance_bonus=0.00',
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

        // Logic for Respin / FreeSpin / Win

        if (win['TotalWin'] == 0) {
            if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
                const addLog = {
                    Respin: log['Respin'] + 1,
                    RespinWin: log['RespinWin'],
                    WinLines: win['WinLines'], // Might be undefined/empty if no win
                    TotalWin: log['TotalWin'],
                    tmb_res: log['tmb_res'],
                    tmb_win: log['tmb_win'],
                    State: 'LastRespin'
                };
                toLog = { ...toLog, ...addLog };

                // Replace na=s with na=c
                const naIndex = toServer.indexOf('na=s');
                if (naIndex !== -1) toServer[naIndex] = 'na=c';

                const addResponse = [
                    'rs_t=' + toLog['Respin'],
                    'rs_win=' + toLog['RespinWin'],
                    'tmb_res=' + toLog['tmb_res'],
                    'tmb_win=' + toLog['tmb_win']
                ];
                toServer = [...toServer, ...addResponse];
            } else {
                toLog['State'] = 'Spin';
            }

            if (freeSpins) {
                if (freeSpins['AddFreeSpins']) {
                    const addFSLog = {
                        FreeState: 'AddFreeSpin',
                        FreeSpins: (log['FreeSpins'] || 0) + freeSpins['AddFreeSpins'],
                        FreeSpinNumber: (log['FreeSpinNumber'] || 0) + 1
                    };
                    const responseFs = [
                        'fsmul=1',
                        'fsmax=' + addFSLog['FreeSpins'],
                        'fswin=0.00',
                        'fs=' + addFSLog['FreeSpinNumber'],
                        'fsres=0.00',
                        'fsmore=5'
                    ];
                    // toLog merged later? PHP does array_merge at end of if block for both cases.
                     toLog = { ...toLog, ...addFSLog };
                     toServer = [...toServer, ...responseFs];
                } else {
                    if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
                        toLog['TotalWin'] = log['TotalWin'];
                    }
                    const addFSLog: any = {
                        FreeState: 'FirstFreeSpin',
                        FreeSpins: freeSpins['FreeSpins'],
                        FreeSpinNumber: 1,
                        FSPay: freeSpins['Pay'],
                        Scatter: freeSpins['Scatter'],
                        ScatterPositions: freeSpins['ScatterPositions'],
                        TotalWin: toLog['TotalWin'] + freeSpins['Pay'],
                        Win: toLog['TotalWin'] + freeSpins['Pay']
                    };
                    const responseFs = [
                        'fsmul=1',
                        'fsmax=' + addFSLog['FreeSpins'],
                        'fswin=0.00',
                        'fs=' + addFSLog['FreeSpinNumber'],
                        'fsres=0.00',
                        'fs_bought=10',
                        'psym=' + addFSLog['Scatter'] + '~' + addFSLog['FSPay'] + '~' + addFSLog['ScatterPositions'].join(',')
                    ];

                    if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
                        addFSLog['State'] = 'LastRespin';
                    } else {
                        addFSLog['State'] = 'Spin';
                    }
                    toLog = { ...toLog, ...addFSLog };
                    toServer = [...toServer, ...responseFs];
                }
            }
        } else {
            // There is a win
             if (log && (log['State'] === 'Respin' || log['State'] === 'FirstRespin')) {
                const addLog = {
                    Respin: log['Respin'] + 1,
                    RespinWin: log['RespinWin'] + win['TotalWin'],
                    WinLines: win['WinLines'],
                    TotalWin: log['TotalWin'] + win['TotalWin'],
                    tmb_res: log['tmb_res'] + win['TotalWin'],
                    tmb_win: log['tmb_win'] + win['TotalWin'],
                    State: 'Respin'
                };
                const positions = LogAndServer.positionsToServer(addLog['WinLines']);
                toServer = [...toServer, ...positions];

                const addToServer = [
                    'rs_p=' + addLog['Respin'],
                    'rs_c=1',
                    'rs_m=1',
                    'tmb_win=' + addLog['tmb_win'],
                    'tmb_res=' + addLog['tmb_res'],
                    'rs_win=' + addLog['RespinWin']
                ];

                toLog = { ...toLog, ...addLog };
                toServer = [...toServer, ...addToServer];
             } else {
                 const addLog = {
                     Respin: 0,
                     RespinWin: 0,
                     WinLines: win['WinLines'],
                     tmb_res: win['TotalWin'],
                     tmb_win: win['TotalWin'],
                     State: 'FirstRespin'
                 };
                 const positions = LogAndServer.positionsToServer(addLog['WinLines']);
                 toServer = [...toServer, ...positions];

                 const addToServer = [
                     'rs=t',
                     'rs_p=' + addLog['Respin'],
                     'rs_c=1',
                     'rs_m=1',
                     'tmb_win=' + addLog['tmb_win'],
                     'tmb_res=' + addLog['tmb_res']
                 ];
                 toLog = { ...toLog, ...addLog };
                 toServer = [...toServer, ...addToServer];
             }
        }

        // Check if currently in Free Spins
        if (log && log['FreeSpinNumber'] && log['FreeState'] !== 'LastFreeSpin') {
            if (toLog['State'] === 'Spin' || toLog['State'] === 'LastRespin') {
                toLog['FreeSpinNumber'] = log['FreeSpinNumber'] + 1;
            } else {
                toLog['FreeSpinNumber'] = log['FreeSpinNumber'];
            }
            if (!toLog['FreeSpins']) toLog['FreeSpins'] = log['FreeSpins'];

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

                const naIndex = toServer.indexOf('na=c');
                if (naIndex !== -1) toServer[naIndex] = 'na=s';
            } else {
                const naIndex = toServer.indexOf('na=s');
                if (naIndex !== -1) toServer[naIndex] = 'na=c';

                toLog['FreeState'] = 'LastFreeSpin';
                toServerFs = [
                    'fsmul_total=1',
                    'fswin_total=0.00',
                    'fs_total=' + (toLog['FreeSpinNumber'] - 1),
                    'fsres_total=0.00',
                    'fs_bought=10'
                ];
            }
            toServer = [...toServer, ...toServerFs];
        }

        if (multipliers) {
            toLog['Multipliers'] = multipliers;
            let prg = 0;
            let rmul = 'rmul=';

            multipliers.forEach((multiplier: any, key: number) => {
                // PHP: unset($multiplier['Reel']);
                // TS: create copy without Reel
                const { Reel, ...rest } = multiplier;
                prg += multiplier['Multiplier'];

                // Construct string.
                // PHP: implode('~', $multiplier) -> values joined by ~.
                // The order of keys in object matters.
                // Multiplier object keys: Symbol, Position, Multiplier. (Reel removed).
                // Assuming order is consistent.
                const values = Object.values(rest);
                if (key === 0) rmul += values.join('~');
                else rmul += ';' + values.join('~');
            });

            // Replace prg=1
            const prgIndex = toServer.findIndex(s => s.startsWith('prg='));
            if (prgIndex !== -1 && prg !== 0) toServer[prgIndex] = 'prg=' + prg;

            toServer.push(rmul);

            if (prg !== 0 && toLog['State'] === 'LastRespin') {
                const addMultWin = toLog['tmb_res'] * prg;
                toLog['MultWin'] = prg;
                toLog['tmb_res'] = addMultWin;
                toLog['TotalWin'] += addMultWin - toLog['tmb_win'];
            }
        }

        toServer.unshift('tw=' + toLog['TotalWin']);

        toLog['ServerState'] = toServer;

        return { Log: toLog, Server: toServer };
    }

    private static positionsToServer(winLines: any[]) {
        const result: string[] = [];
        const tmb: string[] = [];

        if (!winLines) return [];

        winLines.forEach((winLine: any, key: number) => {
            const l = 'l' + key + '=0~' + winLine['Pay'] + '~' + winLine['Positions'].join('~');
            tmb.push(winLine['Positions'].join(',') + '~' + winLine['WinSymbol']);
            // Wait, PHP: implode(','.$winLine['WinSymbol'].'~', $winLine['Positions']);
            // implode(glue, pieces).
            // Glue is ',Symbol~'.
            // Pieces are Positions.
            // Example: Positions=[10, 11]. Symbol=8. Glue=',8~'.
            // Result: '10,8~11'.
            // Wait, PHP implode glue is inserted BETWEEN elements.
            // So if Positions has 2 elements: P1 + glue + P2.
            // Result: '10,8~11'.
            // This looks weird format: 'pos,sym~pos,sym~...'?
            // If glue is ',8~'.
            // It seems format is: Pos1,Sym~Pos2,Sym~...
            // But last element won't have Sym~ after it?
            // Let's re-read PHP carefully.
            // $tmb[] = implode(','.$winLine['WinSymbol'].'~', $winLine['Positions']);
            // Yes.

            // TS equivalent:
            tmb.push(winLine['Positions'].join(',' + winLine['WinSymbol'] + '~'));

            result.push(l);
        });

        result.push('tmb=' + tmb.join('~'));
        return result;
    }
}
