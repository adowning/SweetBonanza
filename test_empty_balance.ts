import { Server } from './migration-output/src/Server';
import { MockDatabase } from './migration-output/src/MockDatabase';

const server = new Server();
const db = MockDatabase.getInstance();
db.balance = 0; // Simulate insufficient balance

const output = server.handle({ action: 'doSpin', c: 1.00, l: 20, bl: 0, fsp: 1, index: 1, counter: 1, callbackUrl: '' });

if (output === '') {
    console.log('Insufficient balance test passed (returns empty string)');
} else {
    console.error('Insufficient balance test failed. Expected empty string, got:', output);
    process.exit(1);
}
