const express = require('express');
const router = express.Router();
const controller = require('../controllers/courseController');

router.post('/add', controller.addCourse);
router.get('/all', controller.getAllCourses);
router.get('/:id', controller.getCourseById);
router.put('/update/:id', controller.updateCourse);
router.delete('/delete/:id', controller.deleteCourse);

module.exports = router;