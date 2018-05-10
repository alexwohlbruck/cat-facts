const strings = require('./config/strings');

module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.user) {
            return next();
        }
        
        return res.status(401).json({message: strings.unauthenticated});
    },
    isAdmin: (req, res, next) => {
        if (req.user.isAdmin) {
            return next();
        }
        
        return res.status(403).json({message: strings.unauthorized});
    }
};