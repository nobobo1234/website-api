const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (admin, statusCode, req, res) => {
    const token = signToken(admin._id);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() +
                parseInt(process.env.JWT_EXPIRES_IN.slice(0, -1), 10) *
                    24 *
                    60 *
                    60 *
                    1000
        ),
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        httpOnly: true,
        sameSite: true,
    });

    admin.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        data: {
            admin,
        },
    });
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        sameSite: true,
    });

    res.status(200).json({ status: 'success' });
};

exports.signup = catchAsync(async (req, res, next) => {
    // Bug with boolean values in mongoose
    if (!req.admin._doc.op) {
        return next(
            new AppError(
                'You have insufficient permissions to create a new user',
                403
            )
        );
    }

    const newAdmin = await Admin.create({ ...req.body });

    createSendToken(newAdmin, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.correctPassword(password, admin.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(admin, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError("You are not an admin! You don't have access", 401)
        );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentAdmin = await Admin.findById(decoded.id);
    if (!currentAdmin) {
        return next(
            new AppError(
                'The admin belonging to this token does no longer exists',
                401
            )
        );
    }

    if (currentAdmin.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'Admin recently changed password! Please log in again',
                401
            )
        );
    }

    req.admin = currentAdmin;
    next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { passwordCurrent, password, passwordConfirm } = req.body;

    if (!passwordCurrent || !password) {
        return next(
            new AppError(
                'Please provide your current password and your new password',
                400
            )
        );
    }

    const admin = await Admin.findById(req.admin.id).select('+password');

    if (!(await admin.correctPassword(passwordCurrent, admin.password))) {
        return next(new AppError('Incorrect password', 401));
    }

    admin.password = password;
    admin.passwordConfirm = passwordConfirm;
    await admin.save();

    createSendToken(admin, 200, req, res);
});
