// dependencies / libraries
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { configServer } = require('./src/configs/server.config');

// routers
const employeeRoute = require('./src/routes/employee.route');
const leaveRoute = require('./src/routes/leave.route');

// config
const config = require('./src/configs/general.config');

const port = config.port || 3000;
const host = config.host || 'localhost';
const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
configServer(app);

// endpoint
app.get('/', (req, res) => {
  res.send('Hello world');
});
app.use('/employee', employeeRoute);
app.use('/leave', leaveRoute);

// logger
const server = app.listen(port, host, () => {
  console.log(`The server is running on http://${host}:${port}`);
});
