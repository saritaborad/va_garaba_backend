const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config()

const expressWinston = require('express-winston');
const winlogger = require('./utilis/logger');

require('./database/mongoDBConnection');
const indexRouter = require('./routes/index');
const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", "'unsafe-inline'"]
  }
}));
app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'build')));

var sockIO = require('socket.io')();
app.sockIO = sockIO;

app.use(expressWinston.logger({
  winstonInstance: winlogger.logger,
  statusLevels: true,
}))

app.use((req, res, next) => {

  winlogger.logger.info(`Request: ${req.method} ${req.originalUrl} from ${req.ip}`);

  next();
});
app.get('/s', (req, res) => {
  res.render("index", { title: 'My digi event' })
});

app.use('/v1/api', indexRouter);
app.use('/merchant/api/pgresponse', (req, res) => {
  const serverIP = app.get('serverIP');
  console.log(serverIP);
  res.send("Hy Payment Sucsess")
});

// Route for serving React.js application for all other routes
app.get(/^\/(?!v1\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


sockIO.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.emit('connection_digi', { status: 1, message: 'socket connection', data: socket.id })

  socket.on('disconnect', (error) => {
    console.log('user disconnected');
    socket.emit('disconnect_digi', { status: 1, message: 'socket disconnect', data: error })
  });
});



app.use(expressWinston.errorLogger({
  winstonInstance: winlogger.winerrorLogger,

}))

module.exports = app;
