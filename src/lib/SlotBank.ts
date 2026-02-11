import { GameBank } from '../stubs/GameBank';

export class SlotBank {
    static addBank(totalBet: number, bank: GameBank, toJackpot: number, toProfit: number, toBonus: boolean) {
        const toBank = totalBet - toJackpot - toProfit;
        if (toBonus) {
            bank.increment('bonus', toBank);
        } else {
            bank.increment('slots', toBank * 0.5);
            bank.increment('bonus', toBank * 0.5);
        }
        return toBank;
    }
}
