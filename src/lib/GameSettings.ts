export class GameSettings {
    all: { [key: string]: string } = {};

    constructor(init: string[]) {
        for (const value of init) {
            const tmp = value.split('=');
            if (tmp.length >= 2) {
                // Handle cases where the value might contain '=' (though unlikely in this config format)
                // tmp[0] is key, the rest joined is value.
                const key = tmp[0];
                const val = tmp.slice(1).join('=');
                this.all[key] = val;
            }
        }
    }
}
