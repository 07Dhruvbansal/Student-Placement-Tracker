const mongoose = require('mongoose');

const JobDriveSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    roleTitle: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    ctcLpa: { type: Number, required: true, min: 0 },
    minCgpaRequired: { type: Number, required: true, min: 0, max: 10 },
    maxBacklogsAllowed: { type: Number, required: true, min: 0 },
    allowedDepartments: [{
      type: String,
      enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'],
    }],
    requiredSkills: [{ type: String, trim: true }],
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobDrive', JobDriveSchema);
