
// Based on this, just too small to pull in as a dependency in case I want to make changes
// https://github.com/btmills/weighted-random

/**
 * 
 * @param weights List of numbers representing weights
 * @returns An index in the list, selected based on the given weights
 */
export const getWeightedRandomIndex = (weights: Array<number>): number => {
    let random: number;

    const totalWeight = weights.reduce((partialSum, weight) => partialSum + weight, 0);

    random = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
        if (random < weights[i]) {
            return i;
        }

        random -= weights[i];
    }

    return -1;
};