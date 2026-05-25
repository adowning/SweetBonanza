import { rand } from '../utils';

export class BuyFreeSpins {
    public static getFreeSpin(slotArea: string[], gameSettings: Record<string, string>) {
        let scatterTmp = gameSettings['scatters'].split('~');
        let scatter = scatterTmp[0];

        while (true) {
            let scatterPositions = slotArea.reduce((acc, curr, index) => {
                if (curr === scatter) acc.push(index);
                return acc;
            }, [] as number[]);

            if (scatterPositions.length >= Number(gameSettings['settings_needfs'])) {
                break;
            }

            let needed = Number(gameSettings['settings_needfs']) - scatterPositions.length;

            // Random keys logic
            // array_rand equivalent
            let randKeys: number[] = [];
            let availableKeys = [...Array(slotArea.length).keys()];
            for (let i = 0; i < needed; i++) {
                if (availableKeys.length === 0) break;
                let rndIdx = rand(0, availableKeys.length - 1);
                randKeys.push(availableKeys[rndIdx]);
                availableKeys.splice(rndIdx, 1);
            }

            let intersect = scatterPositions.filter(value => randKeys.includes(value));
            if (intersect.length > 0) {
                continue; // goto newRand
            }

            for (let randKey of randKeys) {
                slotArea[randKey] = scatter;
            }
        }
    }
}
