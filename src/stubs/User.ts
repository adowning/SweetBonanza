export class User {
    id: number;
    balance: number;
    shop_id: number;

    constructor(id: number, balance: number, shop_id: number) {
        this.id = id;
        this.balance = balance;
        this.shop_id = shop_id;
    }

    increment(field: string, amount: number) {
        if (field === 'balance') {
            this.balance += amount;
        }
    }

    decrement(field: string, amount: number) {
        if (field === 'balance') {
            this.balance -= amount;
        }
    }

    save() {
        // In-memory save (no-op)
    }

    static lockForUpdate() {
        return {
            find: (id: number) => {
                // Mock implementation, would normally fetch from DB
                return new User(id, 1000, 1);
            }
        }
    }
}
