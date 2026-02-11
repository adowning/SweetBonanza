export class Game {
    id: number;
    name: string;
    shop_id: number;
    stat_in: number;
    stat_out: number;
    denomination: number;

    constructor(id: number, name: string, shop_id: number) {
        this.id = id;
        this.name = name;
        this.shop_id = shop_id;
        this.stat_in = 0;
        this.stat_out = 0;
        this.denomination = 1;
    }

    save() {
        // No-op
    }

    static where(query: any) {
        return {
            lockForUpdate: () => ({
                first: () => new Game(1, 'SweetBonanza', 1)
            })
        }
    }
}
