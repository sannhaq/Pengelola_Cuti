const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

/**
 * @param {import('express').Application} app
 */
const configServer = (app) => {
  app.use(bodyParser.json());
  app.use(cookieParser());
  const origins = 'http://localhost:9000' || [];

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
