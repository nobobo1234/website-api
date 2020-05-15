const mongoose = require('mongoose');
const validator = require('validator');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A project must have a name'],
    },
    description: {
        type: String,
        required: [true, 'A project must have a description'],
    },
    descriptionDutch: {
        type: String,
        required: [true, 'A project must have a description in dutch'],
    },
    github: {
        type: String,
        required: [true, 'A project must have a github link'],
        validate: validator.isURL,
    },
    demo: {
        type: String,
        validate: validator.isURL,
    },
    technologies: {
        type: [String],
        required: [true, 'A project must at least have one technology'],
    },
    screenshot: {
        type: String,
        default: 'background.jpg',
    },
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
