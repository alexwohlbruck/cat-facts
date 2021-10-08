const strings = require('./config/strings');
const ApiLog = require.main.require('./app/models/api-log');

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
    },
    logApiRequest: (req, res, next) => {
        const apiLog = new ApiLog({
            host: req.headers.host,
            body: JSON.stringify(req.body),
            clientIp: req.clientIp,
            originalUrl: req.originalUrl
        });
            
        apiLog.save();
        next();
    }
};