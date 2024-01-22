const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('../configs/general.config');

/**
 * @param {import('express').Application} app
 */
const configServer = (app) => {
  app.use(bodyParser.json());
  app.use(cookieParser());
  const origins = config.cors || [];

  app.use(
    cors({
      origin: origins.split(','),
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
