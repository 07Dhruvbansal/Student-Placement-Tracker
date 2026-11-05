const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const StudentPlacement = require('./models/StudentPlacement');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const samplePlacements = [
  {
    studentName: 'Aarav Sharma',
    rollNumber: 'CS202401',
    department: 'Computer Science',
    companyName: 'Google',
    roleTitle: 'Software Engineer',
    ctcLpa: 24,
    stage: 'Offered',
    interviewDate: '2026-10-15',
    notes: 'Cleared 4 technical rounds.',
  },
  {
    studentName: 'Priya Patel',
    rollNumber: 'IT202412',
    department: 'Information Technology',
    companyName: 'Microsoft',
    roleTitle: 'Product Analyst',
    ctcLpa: 18,
    stage: 'Interviewing',
    interviewDate: '2026-11-10',
    notes: 'Final system design round scheduled.',
  },
  {
    studentName: 'Rohan Gupta',
    rollNumber: 'EC202405',
    department: 'Electronics',
    companyName: 'Texas Instruments',
    roleTitle: 'Embedded Systems Engineer',
    ctcLpa: 14,
    stage: 'Shortlisted',
    interviewDate: null,
    notes: 'Awaiting round 1 interview date.',
  },
  {
    studentName: 'Ananya Verma',
    rollNumber: 'CS202488',
    department: 'Computer Science',
    companyName: 'Amazon',
    roleTitle: 'SDE-1',
    ctcLpa: 28,
    stage: 'Joined',
    interviewDate: '2026-09-01',
    notes: 'Accepted offer and joined bangalore office.',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected for seeding...');

    // Find or create an admin user reference
    let admin = await User.findOne({ role: 'tpo_admin' });
    if (!admin) {
      admin = await User.create({
        name: 'TPO Admin',
        email: 'tpo@college.edu',
        password: 'adminpassword123',
        role: 'tpo_admin',
        department: 'Computer Science',
      });
    }

    await StudentPlacement.deleteMany({});
    const formattedData = samplePlacements.map((item) => ({
      ...item,
      createdBy: admin._id,
    }));

    await StudentPlacement.insertMany(formattedData);
    console.log('Sample placement records seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();