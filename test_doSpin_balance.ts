import { execSync } from 'child_process';

const output = execSync('cd migration-output && bun run src/index.ts').toString();

// Expect doSpin to correctly parse floats and output format parity.
if (output.includes('tw=0') && output.includes('balance_cash=1000') && output.includes('na=s')) {
    console.log('Parity format floats test passed');
} else {
    console.error('Parity float format failed');
    process.exit(1);
}
