import { DB } from './DB';

export class GameLog {
    static where(query: any) {
        return {
            orderBy: (field: string, direction: string) => ({
                first: (columns?: string) => {
                    const logs = DB.logs.filter((l: any) => l.game_id === query.game_id && l.user_id === query.user_id);
                    if (logs.length > 0) {
                        return logs[logs.length - 1];
                    }
                    return null;
                }
            })
        }
    }

    static create(data: any) {
        DB.logs.push(data);
    }
}
