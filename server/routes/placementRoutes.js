const express = require('express');
const {
  getPlacements,
  createPlacement,
  updatePlacementStage,
  deletePlacement,
} = require('../controller/placementController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('tpo_admin'), getPlacements);
router.post('/', protect, authorize('tpo_admin'), createPlacement);
router.put('/:id/stage', protect, authorize('tpo_admin'), updatePlacementStage);
router.delete('/:id', protect, authorize('tpo_admin'), deletePlacement);

module.exports = router;
