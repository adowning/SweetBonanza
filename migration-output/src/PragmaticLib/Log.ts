export class Log {
    private log: any;

    constructor(logData: any = false) {
        this.log = logData;
    }

    public getLog() {
        return this.log;
    }

    public static setLog(log: any) {
        // Mock persistence
        return log;
    }
}
