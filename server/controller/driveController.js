const JobDrive = require('../models/JobDrive');
const Application = require('../models/Application');
const { evaluateResume } = require('../utils/resumeEvaluator');
const {
  uploadResume,
  createResumeDownloadUrl,
  deleteResume,
} = require('../config/cloudinary');

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
  let uploadedResume;
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

    uploadedResume = await uploadResume(req.file.buffer);
    const application = await Application.create({
      drive: drive._id,
      student: req.user._id,
      studentName: req.user.name,
      rollNumber: rollNumber.trim(),
      department,
      studentCgpa,
      backlogsCount,
      resumePublicId: uploadedResume.publicId,
      resumeFormat: uploadedResume.format,
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
    if (uploadedResume?.publicId) {
      try {
        await deleteResume(uploadedResume.publicId);
      } catch (cleanupError) {
        console.error(`Failed to clean up uploaded resume: ${cleanupError.message}`);
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

    const downloadUrl = createResumeDownloadUrl(application.resumePublicId, application.resumeFormat);
    const resumeResponse = await fetch(downloadUrl);
    if (!resumeResponse.ok) {
      return res.status(502).json({ success: false, message: 'Cloud storage could not provide this resume.' });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${application.resumeName.replace(/["\\]/g, '_')}"`);
    return res.send(Buffer.from(await resumeResponse.arrayBuffer()));
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
