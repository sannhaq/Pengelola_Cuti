require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  secret: process.env.SECRET_KEY,
  host: process.env.DB_HOST,
};
