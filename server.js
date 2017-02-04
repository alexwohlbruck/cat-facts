var http = require('http');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
	mongoose.Promise = global.Promise;
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var passport = require('passport');
var keys = require.main.require('./app/config/keys');
var forceSSL = require('express-force-ssl');

mongoose.connect('mongodb://alexwohlbruck:' + keys.dbPassword + '@ds157298.mlab.com:57298/cat-facts');

app.set('socketio', io);
app.set('forceSSLOptions', {httpsPort: 443});

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
var sessionMiddleware = session({secret: keys.session.secret, resave: true, saveUninitialized: true});
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session()); // Persistent login sessions
app.use(forceSSL);
	
// Define routes
app.use('/', require('./app/routes'));

require('./app/sockets')(io);

require('./app/config/passport')(passport);

var port = process.env.PORT || 8080, IP = process.env.IP || "0.0.0.0";

server.listen(port, IP, function() {
	var addr = server.address();
	console.log("Server listening at", IP + ":" + port);
});
