const path = require('path');
const express = require('express');
// Optimizer/security middleware
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const projectRouter = require('./routes/project');
const adminRouter = require('./routes/admin');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/error');

const app = express();

app.enable('trust proxy');

// For static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Security http headers
app.use(helmet());

// Rate limiter
app.use(
    '/',
    rateLimit({
        max: 100,
        windowMs: 60 * 60 * 1000,
        message: 'Too many requests from this IP, please try again in an hour',
    })
);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// Data compression
app.use(compression());

app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/admins', adminRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

module.exports = app;
