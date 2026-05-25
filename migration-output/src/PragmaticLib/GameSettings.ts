export class GameSettings {
    public all: Record<string, string>;

    constructor(init: string[]) {
        this.all = {};
        for (const value of init) {
            const firstEqualsIndex = value.indexOf('=');
            if (firstEqualsIndex !== -1) {
                const key = value.substring(0, firstEqualsIndex);
                const val = value.substring(firstEqualsIndex + 1);
                this.all[key] = val;
            }
        }
    }
}
