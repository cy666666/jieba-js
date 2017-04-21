session = require('express-session');

var cookieParser = require('cookie-parser');

app.set('trust proxy', 1); // trust first proxy
app.use(cookieParser());
app.use( session({
        // https://github.com/expressjs/session/issues/56
        secret : "aopqfpwepcpa",
        //name : 'sessionId',
        resave: false,
        proxy: false,
        saveUninitialized: false,
        cookie: {
            path: '/',
            domain: 'pc.pulipuli.info',
            maxAge: 1000 * 60 * 24 // 24 hours
        }
    })
);

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

/*
app.use(session({
    secret: CONFIG.secret,
    resave: true,
    // unset: 'destroy',
    domain: 'pc.pulipuli.info:3000',
    saveUninitialized: false,
    cookie:  {
        // path: '/',
        domain: 'pc.pulipuli.info:3000',
        maxAge: 24 * 6 * 60 * 10000
    },
    //store: new MongoStore({url: config.db, autoReconnect:true})
}));
*/