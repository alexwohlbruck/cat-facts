module.exports = {
    validatePhoneNumber: number => {
        return number.length == 10 || number.length == 11;
    },
    cleanPhoneNumber: number => {
        return number.replace(/\D/g,'').replace(/^1+/, '');
    },
    semanticJoin: (array, lastSep = 'and') => {
        // Join an array, with custom last separator
        return array.join(', ').replace(/, ([^,]*)$/, ` ${lastSep} $1`);
    }
};