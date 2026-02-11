import { Log } from './Log';

export class Loader {
    initFile: string[];
    log: any;

    constructor(initFile: string[], balance: number, log: Log) {
        this.initFile = [...initFile]; // Copy
        this.log = log.getLog();
        const time = new Date().getTime();
        this.initFile.push('stime=' + time);
        this.initFile.push('balance=' + balance);
        this.initFile.push('balance_cash=' + balance);

        if (!this.log) {
            const def_set = this.mergeLog();
            this.initFile = [...this.initFile, ...def_set];
        } else {
            if (this.log['ServerState']) {
                this.initFile.push(this.log['ServerState'].join('&'));
            }
        }
    }

    initStr() {
        return this.initFile.join('&');
    }

    private mergeLog() {
        return [
            'def_s=3,8,4,8,1,10,6,10,5,7,8,9,6,9,8,7,4,5,3,4,3,8,4,8,1,10,6,10,5,7',
            's=3,8,4,8,1,10,6,10,5,7,8,9,6,9,8,7,4,5,3,4,3,8,4,8,1,10,6,10,5,7',
            'sa=8,3,4,3,11,3',
            'sb=5,10,11,8,1,7',
            'bl=0',
            'defc=0.10',
            'c=0.10',
            'l=20',
        ];
    }
}
