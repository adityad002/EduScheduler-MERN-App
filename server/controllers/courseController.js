const Course = require('../models/Course');

exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseCode, department, semester, faculty, numberOfSections, weeklyHours, isLab } = req.body;
    const sectionsCount = parseInt(numberOfSections, 10);
    if (isNaN(sectionsCount) || sectionsCount < 1) {
      return res.status(400).json({ message: 'Number of sections must be a positive number.' });
    }
    const createdCourses = [];
    for (let i = 0; i < sectionsCount; i++) {
      const section = String.fromCharCode(65 + i);
      const sectionCourseCode = `${courseCode}-${section}`;
      const course = new Course({
        courseName, courseCode: sectionCourseCode, department, semester, faculty, section, weeklyHours, isLab,
      });
      const createdCourse = await course.save();
      createdCourses.push(createdCourse);
    }
    res.status(201).json(createdCourses);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `A course with code like '${req.body.courseCode}-A' might already exist.` });
    }
    res.status(400).json({ message: 'Error creating course(s)', error: error.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('faculty', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      await course.deleteOne();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    const { courseName, courseCode, department, semester, faculty, weeklyHours, isLab, section } = req.body;
    const course = await Course.findById(req.params.id);

    if (course) {
      course.courseName = courseName || course.courseName;
      course.courseCode = courseCode || course.courseCode;
      course.department = department || course.department;
      course.semester = semester || course.semester;
      course.faculty = faculty || course.faculty;
      course.weeklyHours = weeklyHours || course.weeklyHours;
      course.isLab = isLab === undefined ? course.isLab : isLab;
      course.section = section || course.section;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating course', error: error.message });
  }
};
