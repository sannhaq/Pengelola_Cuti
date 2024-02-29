const express = require('express');

const router = express.Router();
const webSettingController = require('../controllers/webSetting.controller');
const { setStorage, setFileFilter, uploadFile } = require('../utils/helper.util');
const storage = setStorage();
const fileFilter = setFileFilter();
const options = {
  storage,
  fileFilter,
};

// Get webSetting
router.get('/', webSettingController.getWebSettings);

module.exports = router;
