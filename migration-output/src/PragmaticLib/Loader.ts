import { formatFloat } from '../utils';

export class Loader {
    private initFile: string[];
    private log: any;

    constructor(initFile: string[], balance: number, log: any) {
        this.initFile = [...initFile];
        this.log = log.getLog();
        let time = Date.now();

        this.initFile.push('stime=' + time);
        this.initFile.push('balance=' + formatFloat(balance));
        this.initFile.push('balance_cash=' + formatFloat(balance));

        if (!this.log) {
            let def_set = this.mergeLog();
            this.initFile = this.initFile.concat(def_set);
        } else {
            this.initFile.push(this.log['ServerState'].join('&'));
        }
    }

    public initStr() {
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
