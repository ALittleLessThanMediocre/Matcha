const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mysql = require('mysql');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const MySQLStore = require('express-mysql-session')(session);
const http = require('http');
const socketio = require('socket.io');
const moment = require('moment');
const func = require('./functions2.0');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const con = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE
});

con.connect(function(err){
	if (err) throw err;
	console.log('Now connected to MySQL...');
});

// Static folder
app.use(express.static('./assets'));

// EJS  
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));

// Bodyparser
app.use(express.urlencoded( { extended: false }));

// Express Session
const sessionStore = new MySQLStore({}, con);
app.use(session({
    key: process.env.SESSION_COOKIE_NAME,
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
})

// Routes

app.use('/block', require('./routes/block2.0'));
app.use('/blockReq', require('./routes/blockReq2.0'));
app.use('/chat', require('./routes/chat2.0'));
app.use('/changePassword', require('./routes/changePassword2.0'));

app.use('/contact', require('./routes/contact2.0'));
app.use('/forgotPassword', require('./routes/forgotPassword2.0'));
app.use('/galleryDel', require('./routes/galleryDel2.0'));

app.use('/galleryUpload', require('./routes/galleryUpload2.0'));
app.use('/loginLanding', require('./routes/loginLanding2.0'));
app.use('/imageDel', require('./routes/imageDel2.0'));

app.use('/imageUpload', require('./routes/imageUpload2.0'));
app.use('/', require('./routes/index2.0'));
app.use('/like', require('./routes/like2.0'));
app.use('/likedBy', require('./routes/likedBy2.0'));

app.use('/likeV2', require('./routes/likeV2.0'));
app.use('/likeV3', require('./routes/likeV3.0'));
app.use('/likeV4', require('./routes/likeV4.0'));
app.use('/likeV5', require('./routes/likeV5.0'));

app.use('/login', require('./routes/login2.0'));
app.use('/logout', require('./routes/logout2.0'));
app.use('/myLikes', require('./routes/myLikes2.0'));   

app.use('/myMatches', require('./routes/myMatches2.0'));
app.use('/myProfile', require('./routes/myProfile2.0'));
app.use('/processReport', require('./routes/processReport2.0'));

app.use('/report', require('./routes/report2.0'));
app.use('/reports', require('./routes/reports2.0'));
app.use('/search', require('./routes/search2.0'));
app.use('/seeBlocked', require('./routes/seeBlocked2.0'));

app.use('/signup', require('./routes/signup2.0'));
app.use('/suspendAcc', require('./routes/suspendAcc2.0'));
app.use('/suspendAcc2', require('./routes/suspendAccV2.0'));

app.use('/verify', require('./routes/verify2.0'));
app.use('/viewBlockReq', require('./routes/viewBlockReq2.0'));
app.use('/viewedBy', require('./routes/viewedBy2.0'));
app.use('/viewProf', require('./routes/viewProf2.0'));

app.use('/updateVerify', require('./routes/updateVerify2.0'));
app.use('/updateProfile', require('./routes/updateProfile2.0'));

app.use(function(req, res){
    
    res.status(404).render('404');
});

app.use(function(req, res, next) {
  if (!req.session) {

      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
  }
  next();
});

var rooms = [];
var users = [];
// Run when client connects
io.on('connection', socket => {

    socket.on('userJoin', ({ id, session }) => {

        var index = func.findUser(session, users);

        if (index !== -1){

            users[index].id = id;

        } else {

            users.push({ id: id, username: session });
        }
    });

    socket.on('joinRoom', ({ sender1, receiver1 }) => {

        var index = func.findRoom(sender1, receiver1, rooms)

        if (index !== -1){

            socket.join(rooms[index]);

        } else {

            let roomName = sender1 + receiver1;

            rooms.push(roomName);
            socket.join(roomName);
        }
    });

    socket.on('chatMessage', ({ sender, receiver, message }) => {

        const sql0 = "INSERT INTO chats (sender, receiver, message, date) VALUES (?, ?, ?, ?)";

        con.query(sql0, [sender, receiver, message, moment().format('MMMM Do, h:mm a')], function (err) {
            if (err) throw err;

            var index = func.findRoom(sender, receiver, rooms)

            if (index !== -1){

                io.to(rooms[index]).emit('message', func.formatMessage(sender, receiver, message));
            }

            var i = func.findUser(receiver, users);

            if (i !== -1){

                io.to(users[i].id).emit('notification', `You received a message from ${sender}`);
            }
        });
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Now listening to port ${PORT}...`));
