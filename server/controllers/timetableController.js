const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');
const Settings = require('../models/Settings');

// Utility function to shuffle an array (Fisher-Yates shuffle)
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

    let bestSchedule = null;
    let lowestCost = Infinity;
    const startTime = Date.now();
    const TIMEOUT_MS = 10000; // 10 seconds

    const calculateCost = (schedule) => {
      let cost = 0;
      const studentSchedules = {};

      for (const entry of schedule) {
        const course = courses.find(c => c._id.equals(entry.course));
        if (!course) continue;
        const key = `${course.semester}-${course.section}`;
        if (!studentSchedules[key]) studentSchedules[key] = [];
        studentSchedules[key].push(entry);
      }

      for (const groupKey in studentSchedules) {
        const groupSchedule = studentSchedules[groupKey];
        let emptyDays = workingDays.length;
        
        for (const day of workingDays) {
          const dailyClasses = groupSchedule.filter(e => e.day === day)
            .sort((a, b) => timeSlots.indexOf(a.timeSlot) - timeSlots.indexOf(b.timeSlot));

          if (dailyClasses.length > 0) {
            emptyDays--;
          }

          for (let i = 0; i < dailyClasses.length - 1; i++) {
            const gap = timeSlots.indexOf(dailyClasses[i + 1].timeSlot) - timeSlots.indexOf(dailyClasses[i].timeSlot);
            if (gap > 2) {
              cost += 10 * (gap - 2);
            }
          }
        }

        cost += emptyDays * 50;

        const dailySubjectCount = {};
        for (const entry of groupSchedule) {
            const course = courses.find(c => c._id.equals(entry.course));
            if (!course) continue;
            const key = `${entry.day}-${course.courseName}`;
            dailySubjectCount[key] = (dailySubjectCount[key] || 0) + 1;
            if (dailySubjectCount[key] > 1) {
                cost += 50;
            }
        }
      }
      return cost;
    };

    const isSafe = (task, day, timeSlot, classroom, currentSchedule) => {
      const slotIndex = timeSlots.indexOf(timeSlot);
      if (slotIndex + task.duration > timeSlots.length) return false;

      if (task.isLab && task.duration > 1) {
          if (timeSlots.indexOf(timeSlots[slotIndex+1]) !== slotIndex + 1) {
              return false;
          }
      }

      for (let i = 0; i < task.duration; i++) {
        const currentSlot = timeSlots[slotIndex + i];
        for (const entry of currentSchedule) {
          if (entry.day === day && entry.timeSlot === currentSlot) {
            if (entry.classroom.equals(classroom._id)) return false;
            if (entry.faculty.equals(task.course.faculty._id)) return false;
            const scheduledCourse = courses.find(c => c._id.equals(entry.course));
            if (scheduledCourse && scheduledCourse.semester === task.course.semester && scheduledCourse.section === task.course.section) {
              return false;
            }
          }
        }
      }
      return true;
    };

    const solve = (taskIndex, currentSchedule) => {
      if (Date.now() - startTime > TIMEOUT_MS) {
        return;
      }

      if (taskIndex >= tasksToSchedule.length) {
        const currentCost = calculateCost(currentSchedule);
        if (currentCost < lowestCost) {
          lowestCost = currentCost;
          bestSchedule = [...currentSchedule];
        }
        return;
      }

      const currentTask = tasksToSchedule[taskIndex];
      
      const shuffledDays = shuffleArray([...workingDays]);
      const shuffledTimeSlots = shuffleArray([...timeSlots]);
      const shuffledClassrooms = shuffleArray([...classrooms]);

      for (const day of shuffledDays) {
        for (const timeSlot of shuffledTimeSlots) {
          for (const classroom of shuffledClassrooms) {
            if (isSafe(currentTask, day, timeSlot, classroom, currentSchedule)) {
              const entriesToAdd = [];
              for (let j = 0; j < currentTask.duration; j++) {
                const slot = timeSlots[timeSlots.indexOf(timeSlot) + j];
                const newEntry = {
                  day, timeSlot: slot,
                  course: currentTask.course._id,
                  faculty: currentTask.course.faculty._id,
                  classroom: classroom._id,
                };
                currentSchedule.push(newEntry);
                entriesToAdd.push(newEntry);
              }
              
              solve(taskIndex + 1, currentSchedule);
              
              for (let j = 0; j < entriesToAdd.length; j++) {
                currentSchedule.pop();
              }
            }
          }
        }
      }
    };

    solve(0, []);

    if (!bestSchedule) {
      return res.status(409).json({ message: 'Could not generate a valid timetable with the given constraints.' });
    }

    const timetable = await Timetable.findOneAndUpdate(
      { sessionName },
      { schedule: bestSchedule },
      { new: true, upsert: true }
    );
    res.status(201).json({ message: 'Optimized timetable generated successfully!', timetable });

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
    const latestTimetable = await Timetable.findOne({})
      .sort({ updatedAt: -1 })
      .select('sessionName');
    
    if (!latestTimetable) {
      return res.status(404).json({ message: 'No timetables have been generated yet.' });
    }
    res.json(latestTimetable);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
