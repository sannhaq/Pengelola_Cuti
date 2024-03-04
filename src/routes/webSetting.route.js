const express = require('express');

const router = express.Router();
const webSettingController = require('../controllers/webSetting.controller');
const { setStorage, setFileFilter, uploadFile } = require('../utils/helper.util');
const storage = setStorage();
const { getConfig, saveConfigData } = require('../../config');
const fileFilter = setFileFilter();
const options = {
  storage,
  fileFilter,
};

// Get webSetting
router.get('/', webSettingController.getWebSettings);

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
