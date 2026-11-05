const StudentPlacement = require('../models/StudentPlacement');

const getPlacements = async (req, res) => {
  try {
    const { search, stage, department } = req.query;
    const query = {};

    if (stage) query.stage = stage;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { roleTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const placements = await StudentPlacement.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: placements.length, data: placements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPlacement = async (req, res) => {
  try {
    const placementData = {
      ...req.body,
      studentCgpa: Number(req.body.studentCgpa),
      backlogsCount: Number(req.body.backlogsCount || 0),
      minCgpaRequired: Number(req.body.minCgpaRequired || 6),
      maxBacklogsAllowed: Number(req.body.maxBacklogsAllowed || 0),
      ctcLpa: Number(req.body.ctcLpa),
      isEligible: true,
      stage: 'Applied',
      createdBy: req.user._id,
    };
    const placement = await StudentPlacement.create(placementData);
    res.status(201).json({ success: true, data: placement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePlacementStage = async (req, res) => {
  try {
    const placement = await StudentPlacement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    placement.stage = req.body.stage;
    await placement.save();
    return res.json({ success: true, data: placement });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deletePlacement = async (req, res) => {
  try {
    const placement = await StudentPlacement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await placement.deleteOne();
    return res.json({ success: true, message: 'Placement record deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlacements,
  createPlacement,
  updatePlacementStage,
  deletePlacement,
};
