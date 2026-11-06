const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDrive', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    department: { type: String, required: true },
    studentCgpa: { type: Number, required: true, min: 0, max: 10 },
    backlogsCount: { type: Number, required: true, min: 0 },
    resumePath: { type: String, required: true },
    resumeName: { type: String, required: true },
    matchScore: { type: Number, min: 0, max: 100 },
    matchedSkills: [{ type: String }],
    meetsCriteria: { type: Boolean, required: true },
    criteriaSummary: { type: String, required: true },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interviewing', 'Offered', 'Joined', 'Rejected'],
      default: 'Applied',
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ drive: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
