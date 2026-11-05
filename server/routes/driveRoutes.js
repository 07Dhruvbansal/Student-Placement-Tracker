const express = require('express');
const { listDrives, createDrive } = require('../controller/driveController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, listDrives)
  .post(protect, authorize('company'), createDrive);

module.exports = router;
