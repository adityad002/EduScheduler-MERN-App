const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ configKey: "main" });
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { workingDays, timeSlots } = req.body;
    const updatedSettings = await Settings.findOneAndUpdate(
      { configKey: "main" },
      { workingDays, timeSlots },
      { new: true, upsert: true }
    );
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: 'Error updating settings', error: error.message });
  }
};