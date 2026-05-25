import { Server } from './migration-output/src/Server';

const server = new Server();
const collectOutput = server.handle({ action: 'doCollect', index: 1, counter: 1 });
if (collectOutput.includes('balance=1000') && collectOutput.includes('balance_cash=1000') && collectOutput.includes('na=s')) {
    console.log('Collect output test passed');
} else {
    console.error('Collect output test failed:', collectOutput);
    process.exit(1);
}
