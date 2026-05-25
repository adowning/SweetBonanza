This is perfect. Having the actual files completely changes the game. I can see that you already have some draft prompts (`MIGRATION_TASK.md` and `AGENTS.md`) in there, which are excellent baselines.

However, to ensure your autonomous agent (like Roo, Cursor, or Codeium) doesn't hallucinate or ruin the exact string outputs required by the legacy client, we need to combine these into an **ironclad, test-driven master prompt**.

Copy and paste the following prompt directly to your AI agent. It specifically references the quirks found in your uploaded `Server.php`, `SlotSettings.php`, and `GameReel.php` files.

---

### 🤖 Master Handoff Prompt for Autonomous Agent

```markdown
# Role & Objective
You are an Elite Backend Migration Specialist. Your task is to convert a legacy PHP slot game backend (`CloverStonesNG`) into a self-contained, strict TypeScript/Node.js environment.

**The files you will be working with are:**
1. `Server.php` (API Endpoint & Response Routing)
2. `SlotSettings.php` (Core Logic, Paytables, RTP, RNG)
3. `GameReel.php` (File parsing logic)
4. `reels.txt` (Data source)
5. `init.sh` (Run this first to set up the environment in `./migration-output`)

## 🛑 THE GOLDEN RULE: Byte-for-Byte Parity
The legacy client application is incredibly brittle and expects exact string representations. 
**Your TypeScript output MUST be byte-for-byte identical to the PHP output.**
- Do **NOT** clean up, refactor, or use `JSON.stringify()` on strings that are manually concatenated in the PHP code (e.g., in `Server.php` where it does `'{"responseEvent":"error",...'`). 
- Maintain the exact key order, spacing, and capitalization of the original PHP outputs.

## 🏗️ Step-by-Step Execution Plan

### Step 1: Environment Setup
1. Execute `./init.sh` to scaffold the `migration-output` directory, package.json, and `tsconfig.json`.
2. Move into `migration-output`. All work happens here.

### Step 2: Polyfills & Core Stubs (`src/MockDatabase.ts` & `src/utils.ts`)
1. **Math Parity (CRITICAL):** PHP's `rand($min, $max)` is INCLUSIVE of both min and max. JavaScript's `Math.random()` is not. Create a precise `rand(min, max)` helper in TS to mimic the exact behavior of PHP.
2. **Database Removal:** Strip all `VanguardLTE` namespace dependencies and Laravel Eloquent queries. Create a `MockDatabase` class that stores the `Balance` (default `1000.00`), `Currency`, and `ShopID` in memory.
3. **Session State:** Replace PHP `serialize()` / `unserialize()` logic with basic in-memory JS Objects or JSON.

### Step 3: File I/O (`src/GameReel.ts`)
1. Port `GameReel.php`. Use Node's `fs.readFileSync` to read `reels.txt`.
2. Replicate the exact parsing logic: split by `=`, check for keys (e.g., `reelStrip1`), split values by `,`, and trim whitespace. 

### Step 4: Core Logic (`src/SlotSettings.ts`)
1. Port the `SlotSettings` class. This is heavy on arrays and math.
2. Carefully translate the `GetRandomScatterPos`, scatter counts, and reel array logic. Be highly vigilant of 0-indexed arrays in JS vs 1-indexed associations in PHP.

### Step 5: API Router (`src/Server.ts`)
1. Convert the `get()` function into a standard class method: `handle(requestData: any)`.
2. Copy the massive hardcoded `AuthResponse` string exactly as it appears in PHP. Do not alter it.
3. For the `SpinResponse`, look closely at the `winString` loop building logic in the PHP file. Replicate the string concatenation (`.=` in PHP becomes `+=` in JS) exactly so the JSON keys remain in the legacy order.

### Step 6: Verification Harness (`src/index.ts`)
1. Build an entry point that initializes `Server.ts` and `SlotSettings.ts`.
2. Mock an incoming `AuthRequest`.
3. Mock an incoming `SpinRequest` (e.g., Bet: 1, Coin: 1, Lines: 20).
4. `console.log()` the raw string output.


## ❓ Agent FAQ & Edge Case Handling
*Read this before beginning Phase 2.*

**Q: Should I read `reels.txt` from the filesystem or hardcode the parsed arrays into the TypeScript file?**
**A:** Use `fs.readFileSync('reels.txt', 'utf-8')`. Do not hardcode the arrays. You must replicate the exact string-splitting logic (by `=` and `,`) found in `GameReel.php` to guarantee no white-space or casting anomalies are introduced.

**Q: Which Node/TS versions are we targeting?**
**A:** Target Node.js 20 (LTS). Set your `tsconfig.json` compiler options to `"target": "ES2022"` and `"moduleResolution": "node"`. 

**Q: Should I use `JSON.stringify()` or manual string concatenation for building responses?**
**A:** **Match the PHP exactly.** - If the legacy PHP code used `json_encode($data)`, you must use `JSON.stringify(data)`.
- If the legacy PHP code used manual concatenation (e.g., `'{"responseEvent":"error", "msg":"' . $e . '"}'`), you MUST use manual string concatenation in TS (`'{"responseEvent":"error", "msg":"' + e + '"}'`). 
- **NEVER** convert a manual PHP string concatenation into a clean `JSON.stringify()` object, as it will alter key ordering and spacing, breaking the legacy client.

**Q: How should I format the mock inputs in the `index.ts` verification harness?**
**A:** Pass them as parsed JavaScript objects. The original `Server.php` relies on a `$context` or `json_decode` at the top level, meaning the internal routing logic expects standard arrays/objects, not raw HTTP string bodies.

**Q: How do I handle PHP `die()` or `exit()` calls?**
**A:** **Never use `process.exit()`**. This logic will eventually be imported into a persistent web server. Create a custom error class (e.g., `class LegacyExitException extends Error { public payload: string; ... }`). When you encounter a `die($response)`, throw the exception, catch it at the highest level of your router, and return the payload.

**Q: Do I need to write an automated diff-checker script for verification?**
**A:** No. Your `src/index.ts` harness only needs to do a `console.log(response)`. The human operator will handle piping that standard output into a file and running the diff against the baseline.

Q: init.php isn't a text file like reels.txt, it's a PHP array. How should I handle this?
A: Simply translate it into a static TypeScript array (export const initConfig = ['prg_m=wm', 'cfgs=1', ...];). There is no need for fs.readFileSync for this specific game provider.

Q: How do I handle PHP's goto NewSpin; in TypeScript?
A: Wrap the generation logic in a while(true) loop. Every time you see goto NewSpin;, replace it with continue; to restart the loop. Once the WinPermission check passes, break; out of the loop and return the response. Ensure you don't create an infinite loop by forgetting the break condition.

Q: For the LogAndServer.ts response, should I use URLSearchParams or querystring.stringify?
A: NO. You must push strings manually to an array and use .join('&') at the very end. Standard URL libraries will alphabetize the keys or apply strict URI encoding (like turning , into %2C), which will completely break the legacy Flash/HTML5 Pragmatic client. Maintain exact character parity with the legacy output.

**Acknowledge this prompt by replying:** "UNDERSTOOD. I will initialize the environment using `init.sh` and prioritize strict byte-for-byte string parity over aesthetic refactoring. I am ready to begin Step 2."

```