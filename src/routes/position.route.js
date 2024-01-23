const express = require('express');

const router = express.Router();
const positionController = require('../controllers/position.controller');
const roleMiddleware = require('../middleware/role.middleware');

// GET All Position
router.get('/', positionController.getPositions);

// GET Position By ID
router.get('/:id', roleMiddleware('Super Admin', 'Admin'), positionController.getPositionById);

// POST Create Positions
router.post('/create', roleMiddleware('Super Admin', 'Admin'), positionController.createPosition);

// PUT Update Positions
router.put(
  '/update/:id',
  roleMiddleware('Super Admin', 'Admin'),
  positionController.updatePosition,
);

// DELETE Positions
router.delete(
  '/delete/:id',
  roleMiddleware('Super Admin', 'Admin'),
  positionController.deletePosition,
);

module.exports = router;
