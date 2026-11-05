const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const {
  applyToDrive,
  listApplications,
  updateApplicationStatus,
  downloadResume,
} = require('../controller/driveController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, listApplications);
router.post('/:driveId', protect, authorize('student'), upload.single('resume'), applyToDrive);
router.patch('/:applicationId/status', protect, authorize('company'), updateApplicationStatus);
router.get('/:applicationId/resume', protect, downloadResume);

module.exports = router;
