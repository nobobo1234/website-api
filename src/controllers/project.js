const Project = require('../models/project');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
