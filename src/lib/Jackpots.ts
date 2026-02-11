import { DB } from '../stubs/DB';
import { JPG } from '../stubs/JPG';

export class Jackpots {
    static toJP(bet: number, jpgs: JPG[]): number {
        let toJackpots = 0;
        const upsertArray: any[] = [];

        for (const jpg of jpgs) {
            const increment = bet * (jpg.percent / 100);
            upsertArray.push({
                id: jpg.id,
                name: jpg.name,
                balance: jpg.balance + increment,
                shop_id: jpg.shop_id
            });
            toJackpots += increment;
        }

        DB.table('jpg').upsert(upsertArray, ['id', 'name', 'shop_id'], ['balance']);
        return toJackpots;
    }
}
