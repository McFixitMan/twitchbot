const SECONDS_IN_YEAR = 31536000;
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;

export const getDateDifference = (start: Date, end: Date): string => {
    // get total seconds between the times
    let delta = Math.abs(end.getTime() - start.getTime()) / 1000;

    // calculate (and subtract) whole years
    const years = Math.floor(delta / SECONDS_IN_YEAR);
    delta -= years * SECONDS_IN_YEAR;

    // calculate (and subtract) whole days
    const days = Math.floor(delta / SECONDS_IN_DAY);
    delta -= days * SECONDS_IN_DAY;

    // calculate (and subtract) whole hours
    const hours = Math.floor(delta / SECONDS_IN_HOUR) % 24;
    delta -= hours * SECONDS_IN_HOUR;

    // calculate (and subtract) whole minutes
    const minutes = Math.floor(delta / SECONDS_IN_MINUTE) % 60;
    delta -= minutes * SECONDS_IN_MINUTE;

    // what's left is seconds
    const seconds = Math.round(delta % 60);  // in theory the modulus is not required

    let result = '';

    if (!!years) {
        result += `${years} ${years === 1 ? 'year' : 'years'}, `;
    }
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