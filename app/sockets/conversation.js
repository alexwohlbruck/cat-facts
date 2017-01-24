module.exports = function(io) {
    io.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });
        socket.on('hi', function (data) {
            console.log(data);
        });
    });
};