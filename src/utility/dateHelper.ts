
export const getDateDifference = (start: Date, end: Date): string => {
    // get total seconds between the times
    let delta = Math.abs(end.getTime() - start.getTime()) / 1000;

    // calculate (and subtract) whole days
    const days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    const minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    const seconds = Math.round(delta % 60);  // in theory the modulus is not required

    let result = '';

    if (!!days) {
        result += `${days} ${days === 1 ? 'day' : 'days'}, `;
    }
    if (!!hours) {
        result += `${hours} ${hours === 1 ? 'hour' : 'hours'}, `;
    }
    if (!!minutes) {
        result += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and `;
    }

    result += `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;

    return result;
};