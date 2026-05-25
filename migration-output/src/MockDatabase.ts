export class MockDatabase {
    private static instance: MockDatabase;

    public balance: number = 1000.00;
    public slotsBank: number = 0;
    public bonusBank: number = 0;
    public fishBank: number = 0;
    public tableBank: number = 0;
    public littleBank: number = 0;

    private constructor() {}

    public static getInstance(): MockDatabase {
        if (!MockDatabase.instance) {
            MockDatabase.instance = new MockDatabase();
        }
        return MockDatabase.instance;
    }
}
