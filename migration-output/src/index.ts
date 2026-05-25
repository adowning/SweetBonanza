import { Server } from './Server';

const server = new Server();

console.log('--- ACTION: settings ---');
console.log(server.handle({ action: 'settings' }));
console.log('\n--- ACTION: doInit ---');
console.log(server.handle({ action: 'doInit' }));
console.log('\n--- ACTION: doSpin ---');
console.log(server.handle({ action: 'doSpin', c: 0.20, l: 20, bl: 0, fsp: 1, index: 1, counter: 1, callbackUrl: '' }));
console.log('\n--- ACTION: update ---');
console.log(server.handle({ action: 'update' }));
