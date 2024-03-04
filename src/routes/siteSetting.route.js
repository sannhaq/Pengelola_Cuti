const express = require('express');

const router = express.Router();
const webSettingController = require('../controllers/webSetting.controller');
const checkPermission = require('../middleware/checkPermission.middleware');
const { setStorage, setFileFilter, uploadFile } = require('../utils/helper.util');
const { getConfig, saveConfigData } = require('../../config');
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

router.get('/config', (req, res) => {
  const configData = getConfig();
  if (configData) {
    res.json(configData);
  } else {
    res.status(500).json({ error: 'Failed to read config data' });
  }
});

router.put('/update-config', (req, res) => {
  const newData = req.body;
  // Lakukan validasi newData di sini sesuai kebutuhan Anda

  try {
    // Panggil fungsi untuk memperbarui data konfigurasi
    saveConfigData(newData);
    res.json({ success: true, message: 'Config data updated successfully' });
  } catch (error) {
    console.error('Failed to write config data:', error);
    res.status(500).json({ error: 'Failed to write config data' });
  }
});

module.exports = router;
