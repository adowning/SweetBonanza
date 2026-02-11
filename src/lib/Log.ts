import { GameLog } from '../stubs/GameLog';

export class Log {
    gameId: number;
    userId: number;
    log: any;

    constructor(gameId: number, userId: number) {
        this.gameId = gameId;
        this.userId = userId;
        const history = GameLog.where({ game_id: this.gameId, user_id: this.userId })
            .orderBy('id', 'desc')
            .first('str');

        if (history && history.str) {
            this.log = JSON.parse(history.str);
        } else {
            this.log = false;
        }
    }

    getLog() {
        return this.log;
    }

    static setLog(log: any, gameId: number, userId: number, shopId: number) {
        GameLog.create({
            game_id: gameId,
            user_id: userId,
            ip: '127.0.0.1', // Mock IP
            str: JSON.stringify(log),
            shop_id: shopId
        });
    }
}
