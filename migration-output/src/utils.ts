export function rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatFloat(val: number): string {
    return Number(Math.round(val * 100) / 100).toString();
}
