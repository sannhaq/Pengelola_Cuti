const express = require('express');

const router = express.Router();
const positionController = require('../controllers/position.controller');
const checkPermission = require('../middleware/checkPermission.middleware');

// GET All Position
router.get('/', checkPermission('Positions'), positionController.getPositions);

// GET All Position for filter leave
router.get('/filter-leaves', checkPermission('Get Employee'), positionController.getPositions);

// GET Position By ID
router.get('/:id', positionController.getPositionById);

// POST Create Positions
router.post('/create', checkPermission('Add Positions'), positionController.createPosition);

// PUT Update Positions
router.put('/update/:id', checkPermission('Update Positions'), positionController.updatePosition);

// DELETE Positions
router.delete(
  '/delete/:id',
  checkPermission('Delete Positions'),
  positionController.deletePosition,
);

module.exports = router;
