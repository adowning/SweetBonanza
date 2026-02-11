export class BuyFreeSpins {
    static getFreeSpin(slotArea: any[], gameSettings: any) {
        const scatterTmp = gameSettings['scatters'].split('~');
        const scatter = parseInt(scatterTmp[0], 10);

        // Find current scatter positions
        let scatterPositions: number[] = [];
        slotArea.forEach((symbol: any, index: number) => {
            if (parseInt(symbol, 10) === scatter) {
                scatterPositions.push(index);
            }
        });

        const needFS = parseInt(gameSettings['settings_needfs'], 10);

        if (scatterPositions.length < needFS) {
            const needed = needFS - scatterPositions.length;

            // Randomly place scatters
            // Avoid existing scatters
            // PHP used goto for retry logic. We can just pick available spots.

            // Get all indices that are NOT scatters
            const availableIndices: number[] = [];
            slotArea.forEach((symbol: any, index: number) => {
                if (parseInt(symbol, 10) !== scatter) {
                    availableIndices.push(index);
                }
            });

            // Shuffle available indices
            for (let i = availableIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
            }

            // Pick first 'needed' indices
            for (let i = 0; i < needed; i++) {
                if (i < availableIndices.length) {
                    const index = availableIndices[i];
                    slotArea[index] = scatter;
                }
            }
        }
    }
}
