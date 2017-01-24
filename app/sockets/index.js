module.exports = function(io) {
    require.main.require('./app/sockets/conversation')(io);
};