const { Router } = require('express');
const projectController = require('../controllers/project');

const router = Router();

router
    .route('/')
    .get(projectController.getAllProjects)
    .post(
        projectController.uploadScreenshot,
        projectController.resizeScreenshot,
        projectController.splitTechnologies,
        projectController.createProject
    );

router
    .route('/:id')
    .get(projectController.getProject)
    .patch(
        projectController.uploadScreenshot,
        projectController.resizeScreenshot,
        projectController.splitTechnologies,
        projectController.updateProject
    )
    .delete(projectController.deleteProject);

module.exports = router;
