const Course = require('../models/courseModel');

// ADD NEW COURSE
exports.addCourse = async (req, res) => {
    try {
        const { advantages, ...rest } = req.body;
        const course = await Course.create({
            ...rest,
            advantages: advantages ? JSON.stringify(advantages) : null
        });
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// VIEW ALL
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        const formatted = courses.map(c => ({
            ...c.toJSON(),
            advantages: c.advantages ? JSON.parse(c.advantages) : []
        }));
        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// VIEW BY ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: "Not Found" });
        
        const data = course.toJSON();
        data.advantages = data.advantages ? JSON.parse(data.advantages) : [];
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE
exports.updateCourse = async (req, res) => {
    try {
        const { advantages, ...rest } = req.body;
        const updatedData = { ...rest };
        if (advantages) updatedData.advantages = JSON.stringify(advantages);
        
        await Course.update(updatedData, { where: { id: req.params.id } });
        res.status(200).json({ message: "Course updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE
exports.deleteCourse = async (req, res) => {
    try {
        await Course.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: "Course deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};