export class Shop {
    id: number;
    percent: number;

    constructor(id: number, percent: number) {
        this.id = id;
        this.percent = percent;
    }

    static find(id: number) {
        return new Shop(id, 80); // Default percent
    }
}
