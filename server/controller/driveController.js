const JobDrive = require('../models/JobDrive');
const Application = require('../models/Application');
const fs = require('fs/promises');
const path = require('path');
const { evaluateResume } = require('../utils/resumeEvaluator');
const resumeDirectory = path.resolve(__dirname, '..', 'uploads', 'resumes');

const listDrives = async (req, res) => {
  try {
    const query = req.user.role === 'company'
      ? { company: req.user._id }
      : { isOpen: true };
    const drives = await JobDrive.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: drives });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createDrive = async (req, res) => {
  try {
    const {
      roleTitle,
      description,
      ctcLpa,
      minCgpaRequired,
      maxBacklogsAllowed,
      allowedDepartments,
      requiredSkills,
    } = req.body;

    const drive = await JobDrive.create({
      company: req.user._id,
      companyName: req.user.companyName,
      roleTitle,
      description,
      ctcLpa: Number(ctcLpa),
      minCgpaRequired: Number(minCgpaRequired),
      maxBacklogsAllowed: Number(maxBacklogsAllowed),
      allowedDepartments: Array.isArray(allowedDepartments) ? allowedDepartments : [],
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    });

    return res.status(201).json({ success: true, data: drive });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const applyToDrive = async (req, res) => {
  let resumePath;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'A PDF or DOCX resume is required.' });
    }

    const drive = await JobDrive.findOne({ _id: req.params.driveId, isOpen: true });
    if (!drive) {
      return res.status(404).json({ success: false, message: 'This job drive is not available.' });
    }

    const { rollNumber } = req.body;
    const department = req.user.department;
    const studentCgpa = Number(req.body.studentCgpa);
    const backlogsCount = Number(req.body.backlogsCount || 0);
    const validDepartments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
    if (
      !rollNumber?.trim()
      || !validDepartments.includes(department)
      || !Number.isFinite(studentCgpa)
      || studentCgpa < 0
      || studentCgpa > 10
      || !Number.isInteger(backlogsCount)
      || backlogsCount < 0
    ) {
      return res.status(400).json({ success: false, message: 'Roll number, department, CGPA, and backlog count are required.' });
    }

    const evaluation = await evaluateResume(req.file.buffer, req.file.originalname, {
      requiredSkills: drive.requiredSkills,
    });
    const meetsCgpa = studentCgpa >= drive.minCgpaRequired;
    const meetsBacklogs = backlogsCount <= drive.maxBacklogsAllowed;
    const meetsDepartment = drive.allowedDepartments.length === 0
      || drive.allowedDepartments.includes(department);
    const meetsSkills = evaluation.matchScore === null || evaluation.matchScore >= 60;
    const meetsCriteria = meetsCgpa && meetsBacklogs && meetsDepartment && meetsSkills;
    const criteriaSummary = [
      meetsCgpa ? 'CGPA requirement met' : `CGPA below ${drive.minCgpaRequired}`,
      meetsBacklogs ? 'backlog requirement met' : `more than ${drive.maxBacklogsAllowed} backlogs`,
      meetsDepartment ? 'department eligible' : 'department not eligible',
      ...(evaluation.matchScore === null
        ? []
        : [meetsSkills ? 'resume skill match meets threshold' : 'resume skill match below 60%']),
    ].join('; ');

    await fs.mkdir(resumeDirectory, { recursive: true });
    const safeExtension = path.extname(req.file.originalname).toLowerCase();
    const resumeFilename = `${Date.now()}-${require('crypto').randomUUID()}${safeExtension}`;
    resumePath = path.join(resumeDirectory, resumeFilename);
    await fs.writeFile(resumePath, req.file.buffer, { flag: 'wx' });

    const application = await Application.create({
      drive: drive._id,
      student: req.user._id,
      studentName: req.user.name,
      rollNumber: rollNumber.trim(),
      department,
      studentCgpa,
      backlogsCount,
      resumePath,
      resumeName: req.file.originalname,
      matchScore: evaluation.matchScore,
      matchedSkills: evaluation.matchedSkills,
      meetsCriteria,
      criteriaSummary,
      status: 'Applied',
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted. The company will review your resume and update the status.',
      data: application,
    });
  } catch (error) {
    if (resumePath) {
      try {
        await fs.unlink(resumePath);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          console.error(`Failed to clean up uploaded resume: ${cleanupError.message}`);
        }
      }
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already applied to this drive.' });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const listApplications = async (req, res) => {
  try {
    const query = req.user.role === 'company'
      ? null
      : { student: req.user._id };
    let applications;

    if (req.user.role === 'company') {
      const drives = await JobDrive.find({ company: req.user._id }).select('_id');
      applications = await Application.find({ drive: { $in: drives.map((drive) => drive._id) } })
        .populate('drive', 'companyName roleTitle ctcLpa')
        .populate('student', 'email')
        .sort({ createdAt: -1 });
    } else {
      applications = await Application.find(query)
        .populate('drive', 'companyName roleTitle ctcLpa')
        .sort({ createdAt: -1 });
    }

    return res.json({ success: true, data: applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const allowedStatuses = ['Under Review', 'Shortlisted', 'Interviewing', 'Offered', 'Joined', 'Rejected'];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status.' });
    }

    const application = await Application.findById(req.params.applicationId).populate('drive', 'company');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    if (application.drive.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot review applications for another company.' });
    }

    application.status = req.body.status;
    await application.save();
    return res.json({ success: true, data: application });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const downloadResume = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId).populate('drive', 'company');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    const isOwner = application.student.toString() === req.user._id.toString();
    const isCompany = application.drive.company.toString() === req.user._id.toString();
    if (!isOwner && !isCompany && req.user.role !== 'tpo_admin') {
      return res.status(403).json({ success: false, message: 'You cannot access this resume.' });
    }

    return res.download(application.resumePath, application.resumeName);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listDrives,
  createDrive,
  applyToDrive,
  listApplications,
  updateApplicationStatus,
  downloadResume,
};
