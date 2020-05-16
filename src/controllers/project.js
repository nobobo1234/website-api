const multer = require('multer');
const sharp = require('sharp');
const Project = require('../models/project');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! You can only upload images', 404),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadScreenshot = upload.single('screenshot');

exports.resizeScreenshot = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.body.screenshot = `project-${req.params.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/projects/${req.body.screenshot}`);

    next();
});

exports.splitTechnologies = (req, res, next) => {
    if (req.body.technologies)
        req.body.technologies = req.body.technologies.split(',');

    next();
};

exports.getAllProjects = catchAsync(async (req, res, next) => {
    const projects = await Project.find();

    res.status(200).json({
        status: 'success',
        results: projects.length,
        data: {
            projects,
        },
    });
});

exports.getProject = catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new AppError('No project found with that ID', 404));
    }

    console.log('test');

    res.status(200).json({
        status: 'success',
        data: {
            project,
        },
    });
});

exports.createProject = catchAsync(async (req, res, next) => {
    const newProject = await Project.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            project: newProject,
        },
    });
});

exports.updateProject = catchAsync(async (req, res, next) => {
    const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedProject) {
        return next(new AppError('No project found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            project: updatedProject,
        },
    });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
    const deletedProject = await Project.findByIdAndRemove(req.params.id);

    if (!deletedProject) {
        return next(new AppError('No project found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
