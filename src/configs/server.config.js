const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('../configs/general.config');

/**
 * @param {import('express').Application} app
 */
const configServer = (app) => {
  app.use('/public/assets/images', express.static('public/assets/images'));
  app.use(bodyParser.json());
  app.use(cookieParser());
  const origins = config.cors || [];

  app.use(
    cors({
      origin: '*',
      credentials: true,
    }),
  );

  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
};

module.exports = { configServer };
