import { execSync } from 'child_process';

const output = execSync('cd migration-output && bun run src/index.ts').toString();

if (output.includes('tw=') && output.includes('balance_cash=')) {
    console.log('Passed');
} else {
    console.error('Failed');
    process.exit(1);
}
