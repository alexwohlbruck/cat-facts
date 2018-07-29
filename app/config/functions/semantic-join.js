// Join an arrray, with custom last separator
module.exports = (array, lastSep = 'and') => {
    return array.join(', ').replace(/, ([^,]*)$/, ` ${lastSep} $1`);
};