require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const methodOverride = require('method-override');
const session = require('express-session');
const slowDown = require("express-slow-down");
const requestIp = require('request-ip');
const MongoStore = require('connect-mongo')(session);
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const passport = require('passport');
const keys = require.main.require('./app/config/keys');


global.Promise = require('bluebird');
mongoose.Promise = global.Promise;

mongoose.connect(keys.database.url(), {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.enable('trust proxy');

app.set('socketio', io);
app.set('view engine', 'ejs');

const mongoStore = new MongoStore({url: keys.database.url()});

const sessionMiddleware = session({
    secret: keys.session.secret,
    resave: true,
    saveUninitialized: true,
    store: mongoStore
});

const speedLimiter = slowDown({
    windowMs: 10 * 60 * 1000,
    delayAfter: 150,
    delayMs: 500
});

app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors());
app.use(speedLimiter);
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
app.use(requestIp.mw());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session()); // Persistent login sessions

// Define routes
app.use('/', require('./app/routes'));

// Redirect to HTTPS
if (process.env.NODE_ENV === 'production') {
    app.use(function (req, res, next) {
        if (req.headers['x-forwarded-proto'] != 'https') {
            return res.redirect('https://' + req.headers.host + req.url);
        } else {
            return next();
        }
    });
}

require('./app/config/passport')(passport);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    const addr = server.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});