// server/models/StudentPlacement.js
const mongoose = require('mongoose');

const StudentPlacementSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    department: {
      type: String,
      required: true,
      enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'],
    },
    // Student qualifications to check against company criteria
    studentCgpa: { type: Number, required: true, min: 0, max: 10 },
    backlogsCount: { type: Number, default: 0 },

    // Company drive details & requirements
    companyName: { type: String, required: true },
    roleTitle: { type: String, required: true },
    minCgpaRequired: { type: Number, default: 6.0 }, // Minimum CGPA criteria
    allowedDepartments: [{ type: String }],           // Eligible departments
    maxBacklogsAllowed: { type: Number, default: 0 },

    ctcLpa: { type: Number, required: true },
    interviewDate: { type: Date, default: null },
    resumeUrl: { type: String },
    matchScore: { type: Number, min: 0, max: 100 },
    notes: { type: String },
    
    // 6 Core Placement Stages
    stage: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interviewing', 'Offered', 'Joined', 'Rejected', 'Not Eligible'],
      default: 'Applied',
    },
    isEligible: { type: Boolean, default: false }, // Eligibility status flag
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentPlacement', StudentPlacementSchema);