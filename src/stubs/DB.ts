export class DB {
    static logs: any[] = [];
    static jpgs: any[] = [];

    static table(tableName: string) {
        return {
            upsert: (data: any[], keys: string[], update: string[]) => {
                // Mock upsert
            }
        };
    }
}
