export class JPG {
    id: number;
    name: string;
    balance: number;
    shop_id: number;
    percent: number;

    constructor(id: number, name: string, balance: number, shop_id: number, percent: number) {
        this.id = id;
        this.name = name;
        this.balance = balance;
        this.shop_id = shop_id;
        this.percent = percent;
    }

    static where(query: any) {
        return {
            lockForUpdate: () => ({
                get: () => [
                    new JPG(1, 'Mini', 100, 1, 0.1),
                    new JPG(2, 'Major', 1000, 1, 0.2),
                    new JPG(3, 'Grand', 10000, 1, 0.5)
                ]
            })
        }
    }
}
