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
var env = process.env.NODE_ENV || 'development';

mongoose.connect('mongodb://alexwohlbruck:' + keys.dbPassword + '@ds157298.mlab.com:57298/cat-facts');

app.set('socketio', io);
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
var sessionMiddleware = session({secret: keys.session.secret, resave: true, saveUninitialized: true});
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session()); // Persistent login sessions
	
// Define routes
app.use('/', require('./app/routes'));

// Redirect to HTTPS
if (env === 'production') {
    app.use(function(req, res, next) {
        if (process.env.NODE_ENV === 'production') {
            if (req.headers['x-forwarded-proto'] != 'https') {
                return res.redirect('https://' + req.headers.host + req.url);
            } else {
                return next();
            }
        } else {
            return next();
        }
    });
}

require('./app/config/passport')(passport);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
	var addr = server.address();
	console.log("Server listening at", addr.address + ":" + addr.port);
});
/*
// Testing crypto
// http://lollyrock.com/articles/nodejs-encryption/

var crypto = require('crypto');
var key = 'b02blap2b8dmso209bnz29b7eqobue8cmwlbja08jbklqibxjd';

/*
const hash = crypto.createHmac('sha256', secret)
                   .update('some important information')
                   .digest('hex');
console.log(hash);

/*/



/**/