const fs = require('fs');
const express = require('express');
const app = express();
const router = express.Router();

const configFilePath = 'config.json';

// Mengambil data dari file json
function getConfig() {
  try {
    const rawdata = fs.readFileSync(configFilePath);
    return JSON.parse(rawdata);
  } catch (error) {
    console.error('Failed to read config:', error);
    return null;
  }
}

// Menyimpan data ke file JSON
function saveConfigData(data) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(configFilePath, jsonData);
    return true;
  } catch (error) {
    console.error('Failed to save config data:', error);
    return false;
  }
}

module.exports = {
  getConfig,
  saveConfigData,
};
