const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');
const Settings = require('../models/Settings');

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

exports.generateTimetable = async (req, res) => {
  try {
    const { sessionName } = req.body;
    if (!sessionName) {
      return res.status(400).json({ message: 'Session Name is required' });
    }

    const courses = await Course.find({}).populate('faculty');
    let classrooms = await Classroom.find({});
    let settings = await Settings.findOne({ configKey: "main" });
    if (!settings) settings = await Settings.create({});

    let { workingDays, timeSlots } = settings;

    const tasksToSchedule = [];
    for (const course of courses) {
      const hours = course.isLab ? course.weeklyHours / 2 : course.weeklyHours;
      for (let i = 0; i < hours; i++) {
        tasksToSchedule.push({
          course,
          isLab: course.isLab,
          duration: course.isLab ? 2 : 1,
        });
      }
    }

    let schedule = [];

    workingDays = shuffleArray([...workingDays]);
    timeSlots = shuffleArray([...timeSlots]);
    classrooms = shuffleArray([...classrooms]);

    const isSafe = (task, day, timeSlot, classroom) => {
      for (let i = 0; i < task.duration; i++) {
        const slotIndex = timeSlots.indexOf(timeSlot);
        if (slotIndex + i >= timeSlots.length) return false;
        const currentSlot = timeSlots[slotIndex + i];

        for (const entry of schedule) {
          if (entry.day === day && entry.timeSlot === currentSlot) {
            if (entry.classroom.equals(classroom._id)) return false;
            if (entry.faculty.equals(task.course.faculty._id)) return false;
            const scheduledCourse = courses.find(c => c._id.equals(entry.course));
            if (scheduledCourse.semester === task.course.semester && scheduledCourse.section === task.course.section) {
              return false;
            }
          }
        }
      }
      return true;
    };

    const solve = (taskIndex) => {
      if (taskIndex >= tasksToSchedule.length) return true;

      const currentTask = tasksToSchedule[taskIndex];

      for (const day of workingDays) {
        for (let i = 0; i < timeSlots.length; i++) {
          const timeSlot = timeSlots[i];
          for (const classroom of classrooms) {
            if (isSafe(currentTask, day, timeSlot, classroom)) {
              for (let j = 0; j < currentTask.duration; j++) {
                const slot = timeSlots[i + j];
                schedule.push({
                  day, timeSlot: slot,
                  course: currentTask.course._id,
                  faculty: currentTask.course.faculty._id,
                  classroom: classroom._id,
                });
              }

              if (solve(taskIndex + 1)) return true;

              for (let j = 0; j < currentTask.duration; j++) {
                schedule.pop();
              }
            }
          }
        }
      }
      return false;
    };

    if (!solve(0)) {
      return res.status(409).json({ message: 'Could not generate a valid timetable with the given constraints.' });
    }

    const timetable = await Timetable.findOneAndUpdate(
      { sessionName },
      { schedule },
      { new: true, upsert: true }
    );
    res.status(201).json({ message: 'Master timetable generated successfully!', timetable });
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};



exports.getTimetable = async (req, res) => {
    try {
        const { sessionName } = req.params;
        const timetable = await Timetable.findOne({ sessionName }).populate([
            { path: 'schedule.course', model: 'Course' },
            { path: 'schedule.faculty', model: 'Faculty' },
            { path: 'schedule.classroom', model: 'Classroom' },
        ]);
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found for this session' });
        }
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getLatestTimetable = async (req, res) => {
  try {
    // Find the single most recently updated document
    const latestTimetable = await Timetable.findOne({})
      .sort({ updatedAt: -1 }) // Sort by most recently updated
      .select('sessionName');   // We only need the sessionName for the link

    if (!latestTimetable) {
      return res.status(404).json({ message: 'No timetables have been generated yet.' });
    }
    res.json(latestTimetable);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}
