require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  secret: process.env.SECRET_KEY,
  host: process.env.HOST,
  encryption_key: process.env.ENCRYPTION_KEY,
  encryption_iv: process.env.ENCRYPTION_IV,
};
