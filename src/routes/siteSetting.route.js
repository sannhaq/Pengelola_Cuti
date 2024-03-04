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

// Create color
router.post('/create', checkPermission('Setting Website'), webSettingController.createWebSettings);

// Update color
router.put(
  '/update-color/:id',
  checkPermission('Setting Website'),
  webSettingController.updateWebColor,
);

// Update image
router.patch(
  '/update-image/:id',
  checkPermission('Setting Website'),
  uploadFile(options, 'picture'),
  webSettingController.updateImageLogo,
);

module.exports = router;
