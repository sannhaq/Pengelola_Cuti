// dependencies / libraries
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { configServer } = require('./src/configs/server.config');

// Import OpenSSL for HTTPS
const https = require('https');
const fs = require('fs');

// routers
const routes = require('./src/routes/index.route');
// config
const { getConfig, saveConfigData } = require('./config');
const { getIpAddress } = require('./src/configs/ip.config');

// read config.json
const config = getConfig();
if (!config) {
  console.error('Failed to load config data. Existing');
  process.exit(1);
}

const port = config.PORT || 3000;
// const host = config.host || 'localhost';
const ipAddress = getIpAddress();

if (config.ipAddress !== ipAddress) {
  config.ipAddress = ipAddress;
  saveConfigData(config);
}

const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
configServer(app);

// Configuration for HTTPS server
const options = {
  key: fs.readFileSync('certificates/key.pem'), // Read private key for HTTPS
  cert: fs.readFileSync('certificates/cert.pem'), // Read certificate for HTTPS
};

const server = https.createServer(options, app);

// endpoint
app.get('/', (req, res) => {
  res.send('Hello world');
});

// Additional test endpoint
app.get('/test', (req, res) => {
  res.send('Bintang baghdad anjay');
});

// Mount routes under the /api prefix
app.use('/api', routes);

// logger
server.listen(port, ipAddress, () => {
  console.log(`The server is running on https://${ipAddress}:${port}`);
});
