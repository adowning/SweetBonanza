export class GameBank {
    shop_id: number;
    slots: number;
    bonus: number;
    fish_bank: number;
    table_bank: number;
    little: number;

    constructor(shop_id: number, slots: number, bonus: number) {
        this.shop_id = shop_id;
        this.slots = slots;
        this.bonus = bonus;
        this.fish_bank = 0;
        this.table_bank = 0;
        this.little = 0;
    }

    increment(field: string, amount: number) {
        if (field === 'slots') this.slots += amount;
        if (field === 'bonus') this.bonus += amount;
    }

    decrement(field: string, amount: number) {
        if (field === 'slots') this.slots -= amount;
        if (field === 'bonus') this.bonus -= amount;
    }

    save() {
        // No-op
    }

    static where(query: any) {
        return {
            first: () => new GameBank(1, 10000, 10000)
        }
    }
}
