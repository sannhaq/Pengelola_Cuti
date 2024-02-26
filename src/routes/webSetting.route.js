const express = require('express');

const router = express.Router();
const webSettingController = require('../controllers/webSetting.controller');
const checkPermission = require('../middleware/checkPermission.middleware');
const { setStorage, setFileFilter, uploadFile } = require('../utils/helper.util');
const storage = setStorage();
const fileFilter = setFileFilter();
const options = {
  storage,
  fileFilter,
};

// Get webSetting
router.get('/', webSettingController.getWebSettings);

// Create color
router.post('/create', webSettingController.createWebSettings);

// Update color
router.put('/update-color/:id', webSettingController.updateWebColor);

// Update image
router.patch(
  '/update-image/:id',
  uploadFile(options, 'picture'),
  webSettingController.updateImageLogo,
);

module.exports = router;
